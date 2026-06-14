import {isDomLoaded} from "../../utils/helper";
import {Tooltip, TooltipPositionEnum} from "./tooltip";

export class TooltipManager {
    constructor(selector = "[data-tooltip]") {
        if(isDomLoaded()) {
            this.onLoad(selector);
        } else {
            document.addEventListener("DOMContentLoaded", () => {
                this.onLoad(selector);
            })
        }
    }

    static createTooltipAtPosition(x, y, options) {
        const anchorElement = document.createElement('div');
        anchorElement.style.position = 'absolute';
        anchorElement.style.left = `${x}px`;
        anchorElement.style.top = `${y}px`;
        anchorElement.style.width = `1px`;
        anchorElement.style.height = `1px`;

        document.body.insertBefore(anchorElement, document.body.firstChild);

        const tooltip = new Tooltip(anchorElement, options, TooltipPositionEnum.right);
        tooltip.show();

        return tooltip;
    }

    onLoad(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((tooltipElement) => {
            new Tooltip(tooltipElement);
        })
    }
}
