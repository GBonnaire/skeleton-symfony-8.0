import IMask from 'imask';
import {AbstractField} from "../abstract/abstract-field";

export class MaskField extends AbstractField {
    private element: HTMLInputElement;
    private options: any = null;
    private processValue: Function | null | undefined = null;
    private elementWithMask: HTMLInputElement;
    private elementMasked: any;

    public constructor(element: HTMLInputElement, options?: any | null | undefined, processValue?: Function | null | undefined) {
        super();
        this.element = element;
        this.options = options;
        this.processValue = processValue;
        this.prepare();
        this.bindEvent();
    }

    private prepare() {
        this.elementWithMask = <HTMLInputElement>this.element.cloneNode();
        this.element.style.display = "none";
        this.element.after(this.elementWithMask);
        this.elementWithMask.setAttribute("type", "text");
        this.elementWithMask.removeAttribute('name');
        this.elementWithMask.removeAttribute('id');
        this.elementWithMask.removeAttribute('pattern');
        if(this.elementWithMask.hasAttribute('maxLength')) {
            if(!this.options.hasOwnProperty("maxLength")) {
                this.options.maxLength = this.elementWithMask.getAttribute('maxLength');
            }
            this.elementWithMask.removeAttribute('maxLength');
        }
        // @ts-ignore
        this.elementMasked = new IMask(this.elementWithMask, this.options);
        this.element['mask'] = this.elementMasked;
        const that = this;
        Object.defineProperties(this.element,{
            value:{
                get:function() {
                    return this.getAttribute("value");
                },
                set:function(oValue){
                    this.setAttribute("value", oValue);
                    that.elementMasked.value = oValue;
                }
            },
            disabled: {
                set: function(oValue) {
                    if(oValue) {
                        this.setAttribute("disabled", "");
                    } else {
                        this.removeAttribute("disabled");
                    }
                    that.elementWithMask.disabled = oValue;
                }
            }
        });
    }

    private bindEvent() {
        this.elementWithMask.addEventListener("input", (e) => {
            if(this.processValue && typeof this.processValue == "function") {
                this.element.setAttribute('value', this.processValue(this.elementMasked.unmaskedValue, this.elementWithMask.value));
            } else {
                this.element.setAttribute('value', this.elementMasked.unmaskedValue);
            }
        });
    }
}