/**
 * SseManager
 * Gestion centralisée des connexions Server-Sent Events.
 * Annule automatiquement toutes les connexions sur changement d'URL (popstate / pushState).
 *
 * Callbacks disponibles par connexion (dans options) :
 *   onMessage(data, event)          — chaque message reçu (event 'message' par défaut)
 *   on({ eventName, handler })      — écoute un event nommé spécifique (ex: 'progress', 'done')
 *   onSuccess(data, event)          — alias sémantique de onMessage
 *   onFailure(error)                — SseError (hors CancelledError)
 *   onOpen()                        — connexion établie
 *   onDone(data)                    — reçu quand l'event 'done' arrive, puis fermeture auto
 *
 * Callbacks globaux (dans le constructeur) :
 *   onCancel(reason)   — quand des connexions sont annulées en masse
 *   onError(error)     — fallback global erreur
 *
 * Usage :
 *   const sse = new SseManager({ baseUrl: '/api' });
 *
 *   sse.open('/sse/task', { jobId: 42 }, {
 *     onOpen:    ()           => console.log('Connecté'),
 *     onMessage: (data)       => console.log(data),
 *     on: [
 *       { event: 'progress', handler: (data) => progressBar.style.width = data.percent + '%' },
 *       { event: 'done',     handler: (data) => console.log('Résultat', data) },
 *     ],
 *     onFailure: (err) => showError(err.message),
 *   });
 *
 *   sse.close('/sse/task');
 *   sse.closeAll();
 */
export class SseManager {
    /**
     * @param {Object}   [options={}]
     * @param {string}   [options.baseUrl='']              Préfixe ajouté à toutes les URLs
     * @param {boolean}  [options.cancelOnNavigation=true] Ferme les connexions sur changement d'URL
     * @param {boolean}  [options.autoReconnect=false]     Reconnexion automatique sur erreur
     * @param {number}   [options.reconnectDelay=3000]     Délai de reconnexion en ms
     * @param {number}   [options.maxReconnectAttempts=5]  Tentatives max avant abandon
     * @param {Function} [options.onCancel=null]           Callback global annulation
     * @param {Function} [options.onError=null]            Callback global erreur
     */
    constructor(options = {}) {
        this.baseUrl               = options.baseUrl               ?? '';
        this.cancelOnNavigation    = options.cancelOnNavigation    ?? true;
        this.autoReconnect         = options.autoReconnect         ?? false;
        this.reconnectDelay        = options.reconnectDelay        ?? 3000;
        this.maxReconnectAttempts  = options.maxReconnectAttempts  ?? 5;
        this.onCancel              = options.onCancel              ?? null;
        this.onError               = options.onError               ?? null;

        /**
         * @type {Map<string, { source: EventSource, handlers: Function[], attempts: number, closed: boolean }>}
         */
        this._connections = new Map();

        if (this.cancelOnNavigation) {
            this._bindNavigationEvents();
        }
    }

    // ─────────────────────────────────────────────
    // API publique
    // ─────────────────────────────────────────────

    /**
     * Ouvre une connexion SSE.
     * @param {string}   url
     * @param {Object}   [params={}]    Paramètres ajoutés en query string
     * @param {Object}   [options={}]
     * @param {Function} [options.onOpen]                ()
     * @param {Function} [options.onMessage]             (data: any, event: MessageEvent)
     * @param {Function} [options.onSuccess]             Alias de onMessage
     * @param {Array}    [options.on]                    [{ event: string, handler: Function }]
     * @param {Function} [options.onDone]                (data: any) — ferme la connexion automatiquement
     * @param {Function} [options.onFailure]             (error: SseError)
     * @returns {string} Clé de la connexion (pour close() manuel)
     */
    open(url, params = {}, options = {}) {
        const fullUrl = this._buildUrl(url, params);
        const key     = this._makeKey(fullUrl);

        // Ferme une éventuelle connexion existante sur la même URL
        if (this._connections.has(key)) {
            this._closeConnection(key, 'Superseded');
        }

        this._openConnection(key, fullUrl, options, 0);

        return key;
    }

    /**
     * Ferme une connexion par clé (retournée par open()) ou par URL.
     * @param {string} keyOrUrl
     */
    close(keyOrUrl) {
        const key = this._connections.has(keyOrUrl)
            ? keyOrUrl
            : this._makeKey(this._buildUrl(keyOrUrl));

        this._closeConnection(key, 'Manual close');
    }

    /**
     * Ferme toutes les connexions en cours.
     * @param {string} [reason='Navigation']
     */
    closeAll(reason = 'Navigation') {
        if (this._connections.size === 0) return;
        this._connections.forEach((_, key) => this._closeConnection(key, reason));
        if (typeof this.onCancel === 'function') this.onCancel(reason);
    }

    /** @returns {number} Nombre de connexions actives */
    get activeCount() {
        return this._connections.size;
    }

    /** Libère les listeners (appeler si vous détruisez l'instance). */
    destroy() {
        this.closeAll('destroy');
        window.removeEventListener('popstate', this._onPopState);
    }

    // ─────────────────────────────────────────────
    // Internals — ouverture / fermeture
    // ─────────────────────────────────────────────

    /**
     * Crée l'EventSource et branche tous les handlers.
     * @param {string} key
     * @param {string} url
     * @param {Object} options
     * @param {number} attempts  Tentative en cours (pour autoReconnect)
     * @private
     */
    _openConnection(key, url, options, attempts) {
        const {
            onOpen,
            onMessage,
            onSuccess,
            on      = [],
            onDone,
            onFailure,
        } = options;

        const source  = new EventSource(url);
        const entry   = { source, options, attempts, closed: false };

        this._connections.set(key, entry);

        // ── Connexion établie ────────────────────────
        source.addEventListener('open', () => {
            entry.attempts = 0;
            if (typeof onOpen === 'function') onOpen();
        });

        // ── Event générique 'message' ────────────────
        const messageHandler = typeof onMessage === 'function'
            ? onMessage
            : typeof onSuccess === 'function'
                ? onSuccess
                : null;

        if (messageHandler) {
            source.addEventListener('message', (e) => {
                messageHandler(this._parse(e.data), e);
            });
        }

        // ── Events nommés (progress, done, etc.) ────
        for (const { event, handler } of on) {
            if (typeof handler !== 'function') continue;

            // Branchement spécial pour 'done' : ferme après réception
            if (event === 'done') {
                source.addEventListener('done', (e) => {
                    const data = this._parse(e.data);
                    handler(data);
                    if (typeof onDone === 'function') onDone(data);
                    this._closeConnection(key, 'Done');
                });
                continue;
            }

            source.addEventListener(event, (e) => {
                handler(this._parse(e.data), e);
            });
        }

        // ── onDone sans passer par `on` ──────────────
        if (typeof onDone === 'function' && !on.some(o => o.event === 'done')) {
            source.addEventListener('done', (e) => {
                onDone(this._parse(e.data));
                this._closeConnection(key, 'Done');
            });
        }

        // ── Erreur / reconnexion ─────────────────────
        source.addEventListener('error', (e) => {
            // EventSource readyState : 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
            if (source.readyState === EventSource.CLOSED) {
                this._connections.delete(key);

                if (entry.closed) return; // fermeture volontaire, pas d'erreur

                const error = new SseError('Connection closed by server', url);

                if (this.autoReconnect && attempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        if (!entry.closed) {
                            this._openConnection(key, url, options, attempts + 1);
                        }
                    }, this.reconnectDelay * (attempts + 1)); // backoff linéaire
                    return;
                }

                this._handleError(error, onFailure);
            }
        });
    }

    /**
     * Ferme proprement une connexion et la supprime de la Map.
     * @param {string} key
     * @param {string} reason
     * @private
     */
    _closeConnection(key, reason) {
        const entry = this._connections.get(key);
        if (!entry) return;

        entry.closed = true;       // flag pour bloquer le callback error
        entry.source.close();
        this._connections.delete(key);
    }

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────

    /**
     * Tente un JSON.parse, retourne la chaîne brute si échec.
     * @param {string} raw
     * @returns {any}
     * @private
     */
    _parse(raw) {
        try { return JSON.parse(raw); } catch { return raw; }
    }

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
     * Clé unique pour identifier une connexion.
     * @param {string} url
     * @returns {string}
     * @private
     */
    _makeKey(url) {
        return `SSE::${url}`;
    }

    /**
     * Écoute les événements de navigation — même logique que AjaxManager.
     * @private
     */
    _bindNavigationEvents() {
        this._patchHistoryMethod('pushState');
        this._patchHistoryMethod('replaceState');

        this._onPopState = () => this.closeAll('popstate');
        window.addEventListener('popstate', this._onPopState);

        window.addEventListener('hashchange', (e) => {
            this.closeAll('hashchange to ' + e.newURL);
        });

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href      = link.getAttribute('href');
            const isExternal = link.hostname !== location.hostname;
            const isDownload = link.hasAttribute('download');
            const isMailOrTel = /^(mailto|tel):/.test(href);
            const isBlank   = link.target === '_blank';

            if (isExternal || isDownload || isMailOrTel || isBlank) return;

            this.closeAll('link-click to ' + link.href);
        });
    }

    /**
     * Monkey-patch history.pushState / history.replaceState.
     * @param {'pushState'|'replaceState'} method
     * @private
     */
    _patchHistoryMethod(method) {
        const original = history[method].bind(history);
        history[method] = (...args) => {
            const oldUrl = location.href;
            const result = original(...args);
            const newUrl = location.href;
            if (newUrl !== oldUrl) this.closeAll(`${method} to ${newUrl}`);
            return result;
        };
    }
}

// ─────────────────────────────────────────────
// Erreurs typées
// ─────────────────────────────────────────────

export class SseError extends Error {
    /**
     * @param {string} message
     * @param {string} url     URL de la connexion concernée
     */
    constructor(message, url) {
        super(message);
        this.name = 'SseError';
        this.url  = url;
    }
}
