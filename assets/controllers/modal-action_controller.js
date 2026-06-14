import { Controller } from '@hotwired/stimulus';
import { ModalManager } from "../js/modules/modal/modal-manager";

export default class extends Controller {

    static values = {
        id: String,
    }

    initialize() {
        super.initialize();
        this.modal = null;
    }

    open() {
        if(this.modal == null) {
            this.modal = this.#retriveModal(this.idValue);
        }
        if(this.modal) {
            this.modal.open();
        }
    }

    close() {
        if(this.modal == null) {
            this.modal = this.#retriveModal(this.idValue);
        }
        if(this.modal) {
            this.modal.close();
        }
    }

    toggle() {
        if(this.modal == null) {
            this.modal = this.#retriveModal(this.idValue);
        }
        if(this.modal) {
            if(this.modal.isShown()) {
                this.modal.close();
            } else {
                this.modal.open();
            }
        }
    }

    /**
     * Retrieve Modal
     * @param {string} id
     * @returns {Modal}
     */
    #retriveModal(id) {
        return ModalManager.get().getModal(this.idValue)
    }
}
