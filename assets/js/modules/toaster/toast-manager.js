import { Toaster } from './toaster';
import { Singleton } from '../../utils/singleton';
import Translator from "../../utils/translator";

export class ToastManager extends Singleton {
    static _singletonName = "ttm";

    static get singletonName() {
        return this._singletonName;
    }

    constructor() {
        super();
        this.container = null;
        this.activeToasters = [];

        Translator.get()
            .load({
                "Notification": "Notification",
                "Success": "Success",
                'Error': 'Error',
                'Warning': 'Warning',
                'Information': 'Information',
            }, "toaster", "en")
            .load({
                "Notification": "Notification",
                "Success": "Succès",
                'Error': 'Erreur',
                'Warning': 'Attention',
                'Information': 'Information',
            }, "toaster", "fr");

        document.addEventListener("DOMContentLoaded", () => {
            this.container = document.getElementById('notifications-flash-toaster-container');

            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'notifications-flash-toaster-container';
                this.container.className = 'notifications';
                document.body.appendChild(this.container);
            }

            this.container.addEventListener('mouseenter', () => {
                this.pauseAllToasters();
            });

            this.container.addEventListener('mouseleave', () => {
                this.resumeAllToasters();
            });
        });
    }

    pauseAllToasters() {
        this.activeToasters.forEach(toaster => {
            toaster.pauseTimer();
        });
    }

    resumeAllToasters() {
        this.activeToasters.forEach(toaster => {
            toaster.resumeTimer();
        });
    }

    flash(message, level = "notice", title = '', url = null) {
        const toaster = new Toaster(level, message, title);

        this.activeToasters.push(toaster);

        if (url) {
            const toasterElement = toaster.getElement();
            toasterElement.classList.add('clickable');
            toasterElement.style.cursor = 'pointer';

            toasterElement.addEventListener('click', (e) => {
                const closeBtn = toasterElement.querySelector('.icon-close');
                if (closeBtn && (e.target === closeBtn || closeBtn.contains(e.target))) {
                    return;
                }
                window.location.href = url;
            });
        }

        if (this.container) {
            this.container.appendChild(toaster.getElement());
            setTimeout(() => {
                toaster.show();
            }, 10);
        }

        const originalClose = toaster.close.bind(toaster);
        toaster.close = () => {
            originalClose();

            const index = this.activeToasters.indexOf(toaster);
            if (index !== -1) {
                this.activeToasters.splice(index, 1);
            }
        };
    }

    success(message, title = '', url = null) {
        this.flash(message, "success", title, url);
    }

    error(message, title = '', url = null) {
        this.flash(message, "error", title, url);
    }

    warning(message, title = '', url = null) {
        this.flash(message, "warning", title, url);
    }

    info(message, title = '', url = null) {
        this.flash(message, "notice", title, url);
    }
}
