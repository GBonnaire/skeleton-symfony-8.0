import { Controller } from '@hotwired/stimulus';
import { SelectizeManager } from '../../../js/modules/form-fields/selectize/selectize-manager';
import { FileFieldManager } from '../../../js/modules/form-fields/file/file-field-manager';
import { MaskFieldManager } from '../../../js/modules/form-fields/mask/mask-field-manager';
import { RatingManager } from '../../../js/modules/form-fields/rating/rating-manager';

export default class extends Controller {

    initialize() {
        super.initialize();
        new SelectizeManager();
        new FileFieldManager();
        new MaskFieldManager();
        new RatingManager();
    }

    connect() {
        this.buttonSubmit = this.element.querySelector('button[type="submit"]');
        this.originalButtonContent = null;

        this.element.addEventListener('submit', (e) => {
            if (this.buttonSubmit && !this.buttonSubmit.disabled) {
                this.originalButtonContent = this.buttonSubmit.innerHTML;
                this.buttonSubmit.disabled = true;
                this.buttonSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            }
        });
    }


}
