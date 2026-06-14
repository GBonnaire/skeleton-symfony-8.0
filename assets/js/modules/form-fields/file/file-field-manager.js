import { isDomLoaded } from '../../../utils/helper';
import { FileField } from './file-field';

export class FileFieldManager {

    constructor(selector = '[data-file-dropzone]') {
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
            if (!el._fileField) {
                el._fileField = new FileField(el);
            }
        });
    }
}
