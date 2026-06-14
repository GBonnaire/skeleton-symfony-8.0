/**
 * @description Please use on Type Symfony attr => [conditional-field => true] to prepare form directly
 * @example
 * ```
 *  const field = document.querySelector("input#project_url");
 *  const conditional = new ConditionalField(field.parentElement, {
 *      fieldsTracked: ["#project_name", "project[companyType]"],
 *      resetValueOnShow: true,
 *      handle: (instance, field, values) => {
 *          if(values['#project_name']) {
 *              return true;
 *          } else {
 *              return false;
 *          }
 *      }
 *  })
 * ```
 */
import {EventsDispatcher} from "../../../utils/events-dispatcher";

export class ConditionalField extends EventsDispatcher {

    #formElement;
    #fields = [];
    #fieldsTracked = {};
    #options;

    constructor(fieldElement, options) {
        super();
        this.fieldElement = fieldElement;

        const defaultOptions = {
            requiredOnShow: false,
            resetValueOnShow: false,
            fieldsTracked: [],
            handle: () => {}
        };

        this.#options = Object.assign({}, options);

        for (const property in defaultOptions) {
            if (!Object.prototype.hasOwnProperty.call(this.#options, property) || this.#options[property] == null) {
                this.#options[property] = defaultOptions[property];
            }
        }

        const formElement = fieldElement.closest('form');
        if (formElement) {
            this.#formElement = formElement;
            this.#init();
        } else {
            this.#formElement = fieldElement.closest('.fields');
            if (this.#formElement) {
                this.#init();
            }
        }
    }

    getField(name) {
        return this.#fields[name] ?? null;
    }

    #init() {
        const tag = this.fieldElement.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') {
            this.#fields.push(this.fieldElement);
            this.fieldElement.setAttribute('data-default-value', this.fieldElement.getAttribute('value') ?? '');
            if (this.fieldElement.hasAttribute('required')) {
                this.#options.requiredOnShow = true;
            }
            this.fieldElement.removeAttribute('required');
        } else {
            this.#formElement.querySelectorAll('input[name], select[name], textarea[name]').forEach((field) => {
                this.#fields.push(field);
                field.setAttribute('data-default-value', field.value);
                if (field.required) {
                    this.#options.requiredOnShow = true;
                }
                field.removeAttribute('required');
            });
        }

        this.#formElement.querySelectorAll('input[name], select[name], textarea[name]').forEach((fieldElement) => {
            const name = fieldElement.getAttribute('name') ?? '';
            const id = '#' + fieldElement.id ?? '';
            let tracked = false;

            if (name && this.#options.fieldsTracked.includes(name)) {
                this.#fieldsTracked[name] = fieldElement;
                tracked = true;
            }
            if (id !== '#' && this.#options.fieldsTracked.includes(id)) {
                this.#fieldsTracked[id] = fieldElement;
                tracked = true;
            }

            if (tracked) {
                fieldElement.addEventListener('change', () => {
                    this.#handleFieldChange();
                });
            }
        });

        this.#handleFieldChange();
    }

    #handleFieldChange() {
        const values = {};
        for (const field of this.#options.fieldsTracked) {
            if (!this.#fieldsTracked[field]) {
                continue;
            }
            if (this.#fieldsTracked[field].type === 'radio') {
                const fieldSelected = this.#formElement.querySelector('input[name="' + this.#fieldsTracked[field].name + '"]:checked');
                values[field] = fieldSelected ? fieldSelected.value : '';
            } else {
                values[field] = this.#fieldsTracked[field].value;
            }
        }

        const result = this.#options.handle(this, this.fieldElement, values);

        if (result === true && this.fieldElement.style.display === 'none') {
            this.fieldElement.style.display = '';
            if (this.#options.requiredOnShow) {
                this.#fields.forEach((inputElement) => {
                    if (inputElement.parentElement?.style.display !== 'none') {
                        inputElement.required = true;
                        if (this.#options.resetValueOnShow) {
                            inputElement.value = inputElement.getAttribute('data-default-value') ?? '';
                        }
                    }
                });
            }
        } else if (result === false && this.fieldElement.style.display === '') {
            this.fieldElement.style.display = 'none';
            this.#fields.forEach((inputElement) => {
                inputElement.removeAttribute('required');
                if (this.#options.resetValueOnShow) {
                    inputElement.value = inputElement.getAttribute('data-default-value') ?? '';
                }
            });
        }
    }
}
