import { isDomLoaded } from '../../../utils/helper';
import { MaskField } from './mask-field';

export class MaskFieldManager {

    constructor(selector = 'input[data-mask]') {
        if (isDomLoaded()) {
            this._init(selector);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                this._init(selector);
            });
        }
    }

    _init(selector) {
        document.querySelectorAll(selector).forEach(el => {
            if (!el._maskField) {
                const options = el.dataset.mask ? JSON.parse(el.dataset.mask) : {};
                el._maskField = new MaskField(el, options);
            }
        });
    }
}
