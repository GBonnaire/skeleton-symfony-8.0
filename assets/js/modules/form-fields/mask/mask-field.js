import IMask from 'imask';
import {EventsDispatcher} from "../../../utils/events-dispatcher";

export class MaskField extends EventsDispatcher {

    #element;
    #options;
    #processValue;
    #elementWithMask;
    #elementMasked;

    constructor(element, options = null, processValue = null) {
        super();
        this.#element = element;
        this.#options = options;
        this.#processValue = processValue;
        this.#prepare();
        this.#bindEvent();
    }

    #prepare() {
        this.#elementWithMask = this.#element.cloneNode();
        this.#element.style.display = 'none';
        this.#element.after(this.#elementWithMask);
        this.#elementWithMask.setAttribute('type', 'text');
        this.#elementWithMask.removeAttribute('name');
        this.#elementWithMask.removeAttribute('id');
        this.#elementWithMask.removeAttribute('pattern');

        if (this.#elementWithMask.hasAttribute('maxLength')) {
            if (!Object.prototype.hasOwnProperty.call(this.#options, 'maxLength')) {
                this.#options.maxLength = this.#elementWithMask.getAttribute('maxLength');
            }
            this.#elementWithMask.removeAttribute('maxLength');
        }

        this.#elementMasked = new IMask(this.#elementWithMask, this.#options);
        this.#element['mask'] = this.#elementMasked;

        const elementMasked = this.#elementMasked;
        const elementWithMask = this.#elementWithMask;
        Object.defineProperties(this.#element, {
            value: {
                get() { return this.getAttribute('value'); },
                set(oValue) {
                    this.setAttribute('value', oValue);
                    elementMasked.value = oValue;
                }
            },
            disabled: {
                set(oValue) {
                    if (oValue) {
                        this.setAttribute('disabled', '');
                    } else {
                        this.removeAttribute('disabled');
                    }
                    elementWithMask.disabled = oValue;
                }
            }
        });
    }

    #bindEvent() {
        this.#elementWithMask.addEventListener('input', () => {
            if (this.#processValue && typeof this.#processValue === 'function') {
                this.#element.setAttribute('value', this.#processValue(this.#elementMasked.unmaskedValue, this.#elementWithMask.value));
            } else {
                this.#element.setAttribute('value', this.#elementMasked.unmaskedValue);
            }
        });
    }
}
