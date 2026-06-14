/**
 * AjaxManager
 * Gestion centralisée des requêtes AJAX avec support d'annulation (AbortController).
 * Annule automatiquement toutes les requêtes en cours sur changement d'URL (popstate / pushState).
 *
 * Callbacks disponibles par requête (dans options) :
 *   onProgress({ loaded, total, percent, direction }) — progression upload OU download
 *   onSuccess(data)                                   — réponse parsée (JSON / texte / Blob)
 *   onFailure(error)                                  — AjaxError ou autre (hors CancelledError)
 *
 * Callbacks globaux (dans le constructeur) :
 *   onCancel(reason)   — quand des requêtes sont annulées en masse
 *   onError(error)     — fallback global erreur
 *
 * Usage :
 *   const ajax = new AjaxManager({ baseUrl: '/api' });
 *
 *   ajax.get('/users', { page: 1 }, {
 *     onProgress: ({ percent }) => progressBar.style.width = percent + '%',
 *     onSuccess:  (data)        => renderUsers(data),
 *     onFailure:  (err)         => showError(err.message),
 *   });
 *
 *   ajax.post('/login', { email, password }, {
 *     onSuccess: (data) => redirect(data.redirectUrl),
 *     onFailure: (err)  => showError(err),
 *   });
 *
 *   ajax.postForm('/upload', formElement, {
 *     onProgress: ({ loaded, total, percent }) => console.log(`${percent}%`),
 *     onSuccess:  (data) => console.log('Fichier reçu', data),
 *   });
 */
export class AjaxManager {
    /**
     * @param {Object}   [options={}]
     * @param {string}   [options.baseUrl='']              Préfixe ajouté à toutes les URLs
     * @param {Object}   [options.defaultHeaders={}]       Headers ajoutés à chaque requête
     * @param {boolean}  [options.cancelOnNavigation=true] Annule les requêtes sur changement d'URL
     * @param {Function} [options.onCancel=null]           Callback global annulation
     * @param {Function} [options.onError=null]            Callback global erreur
     */
    constructor(options = {}) {
        this.baseUrl            = options.baseUrl            ?? '';
        this.defaultHeaders     = options.defaultHeaders     ?? {};
        this.cancelOnNavigation = options.cancelOnNavigation ?? true;
        this.onCancel           = options.onCancel           ?? null;
        this.onError            = options.onError            ?? null;

        /** @type {Map<string, AbortController>} */
        this._controllers = new Map();

        if (this.cancelOnNavigation) {
            this._bindNavigationEvents();
        }
    }

    // ─────────────────────────────────────────────
    // API publique
    // ─────────────────────────────────────────────

    /**
     * Requête GET
     * @param {string} url
     * @param {Object} [params={}]   Paramètres ajoutés en query string
     * @param {Object} [options={}]
     * @param {Function} [options.onProgress] ({ loaded, total, percent, direction: 'download' })
     * @param {Function} [options.onSuccess]  (data: any)
     * @param {Function} [options.onFailure]  (error: AjaxError|Error)
     * @returns {Promise<any>}
     */
    async get(url, params = {}, options = {}) {
        const fullUrl = this._buildUrl(url, params);
        return this._request(fullUrl, { method: 'GET', ...options });
    }

    /**
     * Requête POST JSON
     * @param {string}       url
     * @param {Object|Array} [body={}]
     * @param {Object}       [options={}]
     * @param {Function}     [options.onProgress] ({ loaded, total, percent, direction: 'upload' })
     * @param {Function}     [options.onSuccess]  (data: any)
     * @param {Function}     [options.onFailure]  (error: AjaxError|Error)
     * @returns {Promise<any>}
     */
    async post(url, body = {}, options = {}) {
        return this._request(this.baseUrl + url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            ...options,
        });
    }

    /**
     * Requête POST multipart/form-data
     * Accepte un HTMLFormElement, un FormData, ou un objet plain { key: value }.
     * @param {string}                          url
     * @param {HTMLFormElement|FormData|Object} data
     * @param {Object}                          [options={}]
     * @param {Function} [options.onProgress] ({ loaded, total, percent, direction: 'upload' })
     * @param {Function} [options.onSuccess]  (data: any)
     * @param {Function} [options.onFailure]  (error: AjaxError|Error)
     * @returns {Promise<any>}
     */
    async postForm(url, data, options = {}) {
        const formData = this._toFormData(data);
        return this._request(this.baseUrl + url, {
            method: 'POST',
            body: formData,
            ...options,
        });
    }

    /**
     * Annule toutes les requêtes en cours.
     * @param {string} [reason='Navigation']
     */
    cancelAll(reason = 'Navigation') {
        if (this._controllers.size === 0) return;
        this._controllers.forEach(controller => controller.abort(reason));
        this._controllers.clear();
        if (typeof this.onCancel === 'function') this.onCancel(reason);
    }

    /**
     * Annule une requête identifiée par sa clé (method::url).
     * @param {string} key
     */
    cancel(key) {
        const controller = this._controllers.get(key);
        if (controller) {
            controller.abort('Manual cancel');
            this._controllers.delete(key);
        }
    }

    /** @returns {number} Nombre de requêtes en cours */
    get pendingCount() {
        return this._controllers.size;
    }

    // ─────────────────────────────────────────────
    // Internals — routage selon présence d'onProgress
    // ─────────────────────────────────────────────

    /**
     * Point d'entrée interne : choisit fetch (download progress) ou XHR (upload progress).
     * @param {string} url
     * @param {Object} options  Options fetch + callbacks onProgress/onSuccess/onFailure
     * @returns {Promise<any>}
     * @private
     */
    async _request(url, options = {}) {
        const { onProgress, onSuccess, onFailure, ...fetchOptions } = options;
        const method   = (fetchOptions.method ?? 'GET').toUpperCase();
        const isUpload = method !== 'GET' && fetchOptions.body !== undefined;

        // XHR uniquement pour upload avec onProgress (fetch ne supporte pas l'upload progress)
        if (onProgress && isUpload) {
            return this._requestXhr(url, fetchOptions, { onProgress, onSuccess, onFailure });
        }

        return this._requestFetch(url, fetchOptions, { onProgress, onSuccess, onFailure });
    }

    // ─────────────────────────────────────────────
    // fetch — GET (download progress) + POST sans progress
    // ─────────────────────────────────────────────

    /**
     * @param {string}   url
     * @param {Object}   fetchOptions
     * @param {Object}   callbacks     { onProgress, onSuccess, onFailure }
     * @returns {Promise<any>}
     * @private
     */
    async _requestFetch(url, fetchOptions, { onProgress, onSuccess, onFailure } = {}) {
        const key        = this._makeKey(url, fetchOptions.method ?? 'GET');
        const controller = new AbortController();

        if (this._controllers.has(key)) {
            this._controllers.get(key).abort('Superseded');
        }
        this._controllers.set(key, controller);

        const options = {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                ...this.defaultHeaders,
                ...(fetchOptions.headers ?? {}),
            },
        };

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new AjaxError(
                    `HTTP ${response.status} – ${response.statusText}`,
                    response.status,
                    response
                );
            }

            const data = await this._parseResponseWithProgress(response, onProgress);

            if (typeof onSuccess === 'function') onSuccess(data);
            return data;

        } catch (err) {
            if (err.name === 'AbortError') {
                throw new CancelledError(err.message ?? 'Request cancelled');
            }
            this._handleError(err, onFailure);
            throw err;

        } finally {
            if (this._controllers.get(key) === controller) {
                this._controllers.delete(key);
            }
        }
    }

    // ─────────────────────────────────────────────
    // XHR — POST avec upload progress
    // ─────────────────────────────────────────────

    /**
     * @param {string}   url
     * @param {Object}   fetchOptions
     * @param {Object}   callbacks     { onProgress, onSuccess, onFailure }
     * @returns {Promise<any>}
     * @private
     */
    _requestXhr(url, fetchOptions, { onProgress, onSuccess, onFailure } = {}) {
        const key = this._makeKey(url, fetchOptions.method ?? 'POST');

        if (this._controllers.has(key)) {
            this._controllers.get(key).abort('Superseded');
        }

        // Proxy abort pour que cancelAll() fonctionne sur les XHR
        const abortProxy = { abort: null };
        this._controllers.set(key, abortProxy);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(fetchOptions.method ?? 'POST', url);

            // Headers
            const headers = { ...this.defaultHeaders, ...(fetchOptions.headers ?? {}) };
            for (const [name, value] of Object.entries(headers)) {
                // Laisser le navigateur gérer le Content-Type multipart/form-data + boundary
                if (name.toLowerCase() === 'content-type' && fetchOptions.body instanceof FormData) {
                    continue;
                }
                xhr.setRequestHeader(name, value);
            }

            // Branchement de l'abort proxy sur le vrai XHR
            abortProxy.abort = (reason) => {
                xhr.abort();
                reject(new CancelledError(reason ?? 'Request cancelled'));
            };

            // ── Progress upload ──────────────────────────
            xhr.upload.addEventListener('progress', (e) => {
                if (!e.lengthComputable || typeof onProgress !== 'function') return;
                onProgress({
                    loaded:    e.loaded,
                    total:     e.total,
                    percent:   Math.round((e.loaded / e.total) * 100),
                    direction: 'upload',
                });
            });

            // ── Réponse ──────────────────────────────────
            xhr.addEventListener('load', () => {
                this._controllers.delete(key);

                if (xhr.status < 200 || xhr.status >= 300) {
                    const error = new AjaxError(
                        `HTTP ${xhr.status} – ${xhr.statusText}`,
                        xhr.status,
                        null
                    );
                    this._handleError(error, onFailure);
                    return reject(error);
                }

                const data = this._parseXhrResponse(xhr);
                if (typeof onSuccess === 'function') onSuccess(data);
                resolve(data);
            });

            // ── Erreur réseau ────────────────────────────
            xhr.addEventListener('error', () => {
                this._controllers.delete(key);
                const error = new Error('Network error');
                this._handleError(error, onFailure);
                reject(error);
            });

            // ── Timeout ──────────────────────────────────
            xhr.addEventListener('timeout', () => {
                this._controllers.delete(key);
                const error = new Error('Request timeout');
                this._handleError(error, onFailure);
                reject(error);
            });

            xhr.send(fetchOptions.body ?? null);
        });
    }

    // ─────────────────────────────────────────────
    // Parsing
    // ─────────────────────────────────────────────

    /**
     * Lit le body via ReadableStream pour mesurer la progression download.
     * Si onProgress est absent, utilise la méthode rapide classique.
     * @param {Response}      response
     * @param {Function|null} onProgress
     * @returns {Promise<any>}
     * @private
     */
    async _parseResponseWithProgress(response, onProgress) {
        if (typeof onProgress !== 'function') {
            return this._parseResponse(response);
        }

        const contentLength = response.headers.get('Content-Length');
        const total         = contentLength ? parseInt(contentLength, 10) : 0;
        const reader        = response.body.getReader();
        const chunks        = [];
        let loaded          = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            loaded += value.byteLength;

            onProgress({
                loaded,
                total,
                percent:   total ? Math.round((loaded / total) * 100) : 0,
                direction: 'download',
            });
        }

        // Reconstruction du buffer complet
        const fullBuffer = new Uint8Array(loaded);
        let offset = 0;
        for (const chunk of chunks) {
            fullBuffer.set(chunk, offset);
            offset += chunk.byteLength;
        }

        const blob        = new Blob([fullBuffer]);
        const contentType = response.headers.get('Content-Type') ?? '';

        if (contentType.includes('application/json')) return JSON.parse(await blob.text());
        if (contentType.startsWith('text/'))          return blob.text();
        return blob;
    }

    /**
     * Parse classique pour fetch sans progress.
     * @param {Response} response
     * @returns {Promise<any>}
     * @private
     */
    async _parseResponse(response) {
        const contentType = response.headers.get('Content-Type') ?? '';
        if (contentType.includes('application/json')) return response.json();
        if (contentType.startsWith('text/'))          return response.text();
        return response.blob();
    }

    /**
     * Parse la réponse XHR selon Content-Type.
     * @param {XMLHttpRequest} xhr
     * @returns {any}
     * @private
     */
    _parseXhrResponse(xhr) {
        const contentType = xhr.getResponseHeader('Content-Type') ?? '';
        if (contentType.includes('application/json')) {
            try { return JSON.parse(xhr.responseText); } catch { return xhr.responseText; }
        }
        if (contentType.startsWith('text/')) return xhr.responseText;
        return xhr.response;
    }

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────

    /**
     * Appelle onFailure local puis onError global.
     * @param {Error}         error
     * @param {Function|null} onFailure
     * @private
     */
    _handleError(error, onFailure) {
        if (typeof onFailure === 'function') onFailure(error);
        if (typeof this.onError === 'function') this.onError(error);
    }

    /**
     * Construit une URL avec query string.
     * @param {string} url
     * @param {Object} params
     * @returns {string}
     * @private
     */
    _buildUrl(url, params = {}) {
        const base  = this.baseUrl + url;
        const query = new URLSearchParams(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
        ).toString();
        return query ? `${base}${base.includes('?') ? '&' : '?'}${query}` : base;
    }

    /**
     * Convertit diverses sources en FormData.
     * @param {HTMLFormElement|FormData|Object} data
     * @returns {FormData}
     * @private
     */
    _toFormData(data) {
        if (data instanceof FormData)        return data;
        if (data instanceof HTMLFormElement) return new FormData(data);

        const fd = new FormData();
        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
                value.forEach(v => fd.append(key, v));
            } else {
                fd.append(key, value);
            }
        }
        return fd;
    }

    /**
     * Clé unique pour identifier une requête.
     * @param {string} url
     * @param {string} method
     * @returns {string}
     * @private
     */
    _makeKey(url, method) {
        return `${method.toUpperCase()}::${url}`;
    }

    /**
     * Écoute les événements de navigation (back/forward + pushState/replaceState).
     * @private
     */
    _bindNavigationEvents() {
        this._patchHistoryMethod('pushState');
        this._patchHistoryMethod('replaceState');

        window.addEventListener('popstate', () => {
            this._onUrlChange(location.href, null, 'popstate');
        });

        window.addEventListener('hashchange', (e) => {
            this._onUrlChange(e.newURL, e.oldURL, 'hashchange');
        });

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            const isExternal = link.hostname !== location.hostname;
            const isDownload = link.hasAttribute('download');
            const isMailOrTel = /^(mailto|tel):/.test(href);
            const isBlank = link.target === '_blank';

            if (isExternal || isDownload || isMailOrTel || isBlank) return;

            // Note : on intercepte l'intention, pas encore la navigation effective
            this._onUrlChange(link.href, location.href, 'link-click');
        });
    }

    _onUrlChange(newUrl, oldUrl, trigger) {
        this.cancelAll('change URL to ' + newUrl);
    }

    /**
     * Monkey-patch history.pushState / history.replaceState pour détecter les navigations SPA.
     * @param {'pushState'|'replaceState'} method
     * @private
     */
    _patchHistoryMethod(method) {
        const original = history[method].bind(history);
        history[method] = (...args) => {
            const oldUrl = location.href;
            const result = original.apply(this, args);
            const newUrl = location.href;
            if (newUrl !== oldUrl) this._onUrlChange(newUrl, oldUrl, method);
            return result;
        };
    }

    /** Libère les listeners (appeler si vous détruisez l'instance). */
    destroy() {
        this.cancelAll('destroy');
        window.removeEventListener('popstate', () => this.cancelAll('popstate'));
    }
}

// ─────────────────────────────────────────────
// Erreurs typées
// ─────────────────────────────────────────────

export class AjaxError extends Error {
    /**
     * @param {string}        message
     * @param {number}        status    Code HTTP
     * @param {Response|null} response  Réponse fetch brute (null pour XHR)
     */
    constructor(message, status, response) {
        super(message);
        this.name     = 'AjaxError';
        this.status   = status;
        this.response = response;
    }
}

export class CancelledError extends Error {
    constructor(message = 'Request cancelled') {
        super(message);
        this.name = 'CancelledError';
    }
}
