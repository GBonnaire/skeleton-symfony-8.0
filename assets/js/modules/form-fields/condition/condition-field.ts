/**
 * @description Please use on Type Symfony attr => [conditional-field => true] to prepare form directly
 * @example
 * ```
 *  const field = document.querySelector("input#project_url") as HTMLElement;
 *  const conditional = new ConditionalField(field.parentElement as HTMLElement, {
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
import {AbstractField} from "../abstract/abstract-field";

interface OptionsConditionalFieldInterface {
    requiredOnShow?: boolean,
    resetValueOnShow? : boolean,
    fieldsTracked: Array<string>,
    handle: Function
}

interface FieldsTrackedInterface {
    [index: string]: HTMLInputElement
}


export class ConditionalField extends AbstractField {

    private formElement: HTMLFormElement|HTMLElement;
    private fields: Array<HTMLInputElement> = [];
    private fieldsTracked: FieldsTrackedInterface = {};
    private options: OptionsConditionalFieldInterface;

    constructor(private fieldElement: HTMLElement, options: OptionsConditionalFieldInterface) {
        super();
        const defaultOptions: OptionsConditionalFieldInterface = {
            requiredOnShow: false,
            resetValueOnShow: false,
            fieldsTracked: [],
            handle: () => {}
        }

        this.options = Object.assign({},options);

        for(let property in defaultOptions) {
            if (!this.options.hasOwnProperty(property) || this.options[property]==null ) {
                this.options[property] = defaultOptions[property];
            }
        }


        const formElement = fieldElement.closest("form");
        if(formElement) {
            this.formElement = formElement;
            this.init();
        } else {
            this.formElement = fieldElement.closest(".fields") as HTMLElement;
            if(this.formElement) {
                this.init();
            }
        }
    }

    public getField(name: string): HTMLElement|null
    {
        return this.fields[name] ?? null;
    }

    private init() {
        if(this.fieldElement.tagName == "INPUT" || this.fieldElement.tagName == "SELECT" || this.fieldElement.tagName == "TEXTAREA") {
            this.fields.push(this.fieldElement as HTMLInputElement);
            this.fieldElement.setAttribute("data-default-value", this.fieldElement.getAttribute("value") ?? "");
            if(this.fieldElement.hasAttribute("required")) {
                this.options.requiredOnShow = true;
            }
            this.fieldElement.removeAttribute("required");
        } else {
            const fieldsElements = this.fieldElement.querySelectorAll("input[name], select[name], textarea[name]") as NodeListOf<HTMLInputElement>
            fieldsElements.forEach((field) => {
                this.fields.push(field);
                field.setAttribute("data-default-value", field.value);
                if(field.required) {
                    this.options.requiredOnShow = true;
                }
                field.removeAttribute("required");
            })
        }



        const fieldElementsInForm = this.formElement.querySelectorAll("input[name], select[name], textarea[name]") as NodeListOf<HTMLInputElement>;
        fieldElementsInForm.forEach((fieldElement) => {
            const name = fieldElement.getAttribute("name") ?? "";
            const id = "#" + fieldElement.id ?? "";
            let tracked = false;
            if(name && this.options.fieldsTracked.includes(name) ) {
                this.fieldsTracked[name] = fieldElement;
                tracked = true;
            }
            if(id != "#" && this.options.fieldsTracked.includes(id)) {
                this.fieldsTracked[id] = fieldElement;
                tracked = true;
            }

            if(tracked) {
                fieldElement.addEventListener("change", (e) => {
                    this.handleFieldChange();
                })
            }
        });

        this.handleFieldChange();
    }

    private handleFieldChange() {
        const values = {};
        for(const field of this.options.fieldsTracked) {
            if(!this.fieldsTracked[field]) {
                continue;
            }
            if(this.fieldsTracked[field].type == "radio") {
                const fieldSelected = this.formElement.querySelector('input[name="'+this.fieldsTracked[field].name+'"]:checked') as HTMLInputElement;
                if(fieldSelected) {
                    values[field] = fieldSelected.value;
                } else {
                    values[field] = "";
                }
            } else {
                values[field] = this.fieldsTracked[field].value;
            }
        }
        const result = this.options.handle(this, this.fieldElement, values);

        if(result === true && this.fieldElement.style.display === "none") {
            this.fieldElement.style.display = "";
            if(this.options.requiredOnShow) {
                this.fields.forEach((inputElement) => {
                    if(inputElement.parentElement?.style.display != "none") {
                        inputElement.required = true;
                        if (this.options.resetValueOnShow) {
                            inputElement.value = inputElement.getAttribute("data-default-value") ?? "";
                        }
                    }
                });
            }
        } else if(result === false && this.fieldElement.style.display === "") {
            this.fieldElement.style.display = "none";
            this.fields.forEach((inputElement) => {
                inputElement.removeAttribute("required");
                if(this.options.resetValueOnShow) {
                    inputElement.value = inputElement.getAttribute("data-default-value") ?? "";
                }
            });
        }
    }
}