import { isDomLoaded } from '../../../utils/helper';
import { Rating } from './rating';

export class RatingManager {

    constructor(selector = '[data-rating]') {
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
            if (!el._rating) {
                const options = {};
                if (el.dataset.ratingNumber) {
                    options.number = parseInt(el.dataset.ratingNumber, 10);
                }
                el._rating = new Rating(el, options);
            }
        });
    }
}
