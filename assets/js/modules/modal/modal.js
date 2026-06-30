import "./modal.css";
import {EventsDispatcher} from "../../utils/events-dispatcher";
import {ModalManager} from "./modal-manager";
import {isOnMobile} from "../../utils/helper";

export class Modal extends EventsDispatcher {

    constructor(options) {
        super();
        this.options = Object.assign({}, options);
        const defaultOptions = {
            closed: false,
            backdrop: true,
            canMove: false,
            canClose: true,
            root: document.body,
            icon: null,
            iconPosition: 'left',
            iconVariant: null,
            iconSize: null
        }

        for(let property in defaultOptions) {
            if (!this.options.hasOwnProperty(property) || this.options[property] == null) {
                this.options[property] = defaultOptions[property];
            }
        }

        this.init();
        this.bindsEvent();
        if(this.options.closed == false) {
            this.show();
        }
    }

    getElement() {
        return this.content;
    }

    canCloseByUser() {
        return this.options.canClose;
    }

    isShown() {
        return this.element?.open ?? false;
    }

    close() {
        if(this.element && this.isShown()) {
            this.element.close();
        }
    }

    open() {
        this.show();
    }

    show() {
        if(this.element && !this.isShown()) {
            this.element.showModal();

            if(isOnMobile()) {
                this.panel.classList.remove('rounded-none', 'rounded-t-xl', 'sm:my-8', 'sm:w-full', 'sm:max-w-lg', 'max-w-full');
                this.panel.classList.add('rounded-lg', 'min-w-0');
                this.panel.style.width = '100%';
                this.panel.style.maxWidth = 'calc(100vw - 2rem)';
                this.panel.style.height = '';
                this.panel.style.maxHeight = 'calc(100vh - 2rem)';
            } else {
                this.panel.classList.remove('rounded-none', 'rounded-t-xl');
                this.panel.classList.add('sm:my-8', 'sm:w-full', 'sm:max-w-lg', 'rounded-lg', 'w-full', 'min-w-0', 'max-w-full');
                this.panel.style.maxHeight = '';
                this.panel.style.width = this.options.width || '';
                this.panel.style.maxWidth = this.options.width || '';
                this.panel.style.height = this.options.height || '';
            }

            this._dispatchEvent("open", this);
        }
    }

    hide() {
        this.close();
    }

    destroy() {
        this.element?.remove();
    }

    init() {
        // ── Header ───────────────────────────────────────────────
        this.header = document.createElement('div');
        this.header.className = 'flex items-start justify-between px-6 pt-6 pb-0 gap-4';

        if(this.options.title) {
            const titleWrapper = document.createElement('div');
            titleWrapper.className = 'flex-1 min-w-0';
            if(typeof this.options.title == "string") {
                const h5 = document.createElement('h5');
                h5.className = 'modal-title text-base font-semibold leading-6 truncate';
                h5.innerHTML = this.options.title;
                titleWrapper.append(h5);
            } else {
                titleWrapper.append(this.options.title);
            }
            this.header.append(titleWrapper);
        }

        if(this.options.canClose) {
            const btnClose = document.createElement("button");
            btnClose.className = 'shrink-0 rounded-md p-1.5 text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors cursor-pointer';
            btnClose.setAttribute('aria-label', 'Fermer');
            btnClose.innerHTML = `<svg class="size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
  <path d="M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z"/>
</svg>`;
            btnClose.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.close();
            });
            this.header.append(btnClose);
        }

        if(!this.options.title && !this.options.canClose) {
            this.header.style.display = 'none';
        }

        // ── Content ──────────────────────────────────────────────
        this.content = document.createElement('div');
        this.content.className = 'modal-content px-6 py-5 overflow-y-auto text-sm text-ink-600';

        if (this.options.icon) {
            const position = this.options.iconPosition === 'center' ? 'center' : 'left';
            this.content.classList.add(`modal-content--icon-${position}`);

            const iconEl = document.createElement('i');
            iconEl.className = `fa-solid ${this.options.icon} modal-icon`;
            if (this.options.iconVariant) {
                iconEl.classList.add(`modal-icon--${this.options.iconVariant}`);
            }
            if (this.options.iconSize) {
                iconEl.style.fontSize = `${this.options.iconSize}px`;
            }
            this.content.append(iconEl);

            const bodyEl = document.createElement('div');
            bodyEl.className = 'modal-icon-body';
            if (this.options.content) {
                if (typeof this.options.content === 'string') {
                    bodyEl.innerHTML = this.options.content;
                } else {
                    bodyEl.append(this.options.content);
                }
            }
            this.content.append(bodyEl);
        } else {
            this.content.classList.add('text-center');
            if (this.options.content) {
                if (typeof this.options.content === 'string') {
                    this.content.innerHTML = this.options.content;
                } else {
                    this.content.append(this.options.content);
                }
            }
        }

        // ── Footer ───────────────────────────────────────────────
        this.footer = document.createElement('div');
        this.footer.className = 'modal-footer bg-ink-50 px-6 py-4 border-t border-ink-100';
        if(this.options.footer) {
            if(typeof this.options.footer == "string") {
                this.footer.innerHTML = this.options.footer;
            } else {
                this.footer.append(this.options.footer);
            }
        } else {
            this.footer.style.display = 'none';
        }

        // ── Panel (carte visible) ─────────────────────────────────
        this.panel = document.createElement('div');
        this.panel.className = 'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg';

        this.panel.append(this.header, this.content, this.footer);

        // ── Dialog natif ──────────────────────────────────────────
        this.element = document.createElement('dialog');
        this.element.className = 'modal-dialog';
        if (!this.options.backdrop) {
            this.element.classList.add('modal-dialog--no-backdrop');
        }
        this.element.append(this.panel);

        this.options.root?.append(this.element);

        // Dispatch notre événement "close" depuis l'événement natif
        this.element.addEventListener('close', () => {
            this._dispatchEvent("close", this);
        });

        // Empêche la fermeture native par Escape ; le ModalManager gère ça via keydown
        this.element.addEventListener('cancel', (e) => {
            e.preventDefault();
        });

        // Clic sur le fond (dialog lui-même, pas sur le panel) → fermer
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element && this.options.canClose) {
                ModalManager.get().closeAll();
            }
        });

        this._dispatchEvent("init", this);
    }

    bindsEvent() {
        if(this.header && this.options.canMove) {
            this.header.addEventListener('mouseup', this.handleMouseUp);
            this.header.addEventListener('mousedown', this.handleMouseDown);
            this.header.addEventListener('mousemove', this.handleMouseMove);
        }
    }

    handleMouseUp(e) {}
    handleMouseDown(e) {}
    handleMouseMove(e) {}
}
