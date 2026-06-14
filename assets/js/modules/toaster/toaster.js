import './toaster.css';
import Translator from "../../utils/translator";

export class Toaster {
    constructor(type, message, title = '') {
        this.timeToShow = 7000;
        this.timeout = null;
        this.startTime = 0;
        this.remainingTime = 0;
        this.isPaused = false;
        this.build(type, message, title);
    }

    build(type, message, title) {
        const iconMap = {
            'success': { fa: 'fa-check',                variant: 'success' },
            'danger':  { fa: 'fa-circle-exclamation',  variant: 'danger'  },
            'error':   { fa: 'fa-circle-exclamation',  variant: 'danger'  },
            'warning': { fa: 'fa-triangle-exclamation',variant: 'warning' },
            'primary': { fa: 'fa-circle-info',         variant: 'info'    },
            'notice':  { fa: 'fa-circle-info',         variant: 'info'    },
            'info':    { fa: 'fa-circle-info',         variant: 'info'    },
        };

        if (type === 'notice') type = 'primary';
        else if (type === 'error') type = 'danger';

        const icon = iconMap[type] || iconMap['info'];

        this.element = document.createElement('div');
        this.element.className = 'da-toast';

        const iconWrapEl = document.createElement('span');
        iconWrapEl.className = `da-toast__icon da-toast__icon--${icon.variant}`;
        const iconEl = document.createElement('i');
        iconEl.className = `fa-solid ${icon.fa} fa-sm`;
        iconWrapEl.appendChild(iconEl);

        const bodyEl = document.createElement('div');
        bodyEl.className = 'da-toast__body';
        const titleEl = document.createElement('p');
        titleEl.className = 'da-toast__title';
        titleEl.textContent = title || this.getTitleFromType(type);
        const descEl = document.createElement('p');
        descEl.className = 'da-toast__desc';
        descEl.textContent = message;
        bodyEl.appendChild(titleEl);
        bodyEl.appendChild(descEl);

        const closeEl = document.createElement('button');
        closeEl.className = 'da-toast__close';
        closeEl.setAttribute('type', 'button');
        closeEl.innerHTML = '<i class="fa-solid fa-xmark fa-sm"></i>';

        this.element.appendChild(iconWrapEl);
        this.element.appendChild(bodyEl);
        this.element.appendChild(closeEl);

        closeEl.addEventListener('click', () => this.close());
    }

    getTitleFromType(type) {
        const titles = {
            'success': 'Success',
            'danger':  'Error',
            'error':   'Error',
            'warning': 'Warning',
            'primary': 'Information',
            'notice':  'Information',
            'info':    'Information',
        };
        return Translator.get().trans(titles[type] || 'Notification', "toaster");
    }

    pauseTimer() {
        if (this.timeout && !this.isPaused) {
            this.isPaused = true;
            clearTimeout(this.timeout);
            this.timeout = null;

            const elapsedTime = Date.now() - this.startTime;
            this.remainingTime = Math.max(0, this.timeToShow - elapsedTime);

            this.element.classList.add('paused');
        }
    }

    resumeTimer() {
        if (this.isPaused) {
            this.isPaused = false;
            this.startTime = Date.now();
            this.element.classList.remove('paused');

            this.timeout = window.setTimeout(() => this.close(), this.remainingTime);
        }
    }

    show() {
        this.element.classList.add('active');

        this.startTime = Date.now();
        this.remainingTime = this.timeToShow;
        this.timeout = window.setTimeout(() => this.close(), this.timeToShow);
    }

    close() {
        if (this.element) {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }

            this.element.classList.remove('active');
            setTimeout(() => this.element.remove(), 300);
        }
    }

    getElement() {
        return this.element;
    }
}
