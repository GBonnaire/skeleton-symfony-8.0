import "./tooltip.css";
import {EventsDispatcher} from "../../utils/events-dispatcher";

export const TooltipPositionEnum = {
    center: "center",
    left: "left",
    right: "right"
};

export class Tooltip extends EventsDispatcher {

    constructor(element, message, position) {
        super(true, true);
        this.element = element;
        this.message = message;
        if(!message) {
            if (element.hasAttribute("data-tooltip") && element.getAttribute("data-tooltip")) {
                this.message = element.getAttribute("data-tooltip");
                element.removeAttribute("data-tooltip");
            } else if (element.hasAttribute("title") && element.getAttribute("title")) {
                this.message = element.getAttribute("title");
                element.removeAttribute("title");
            } else if (element.hasAttribute("alt") && element.getAttribute("alt")) {
                this.message = element.getAttribute("alt");
            }
        }

        let positionValue = "" + position;
        if(!position) {
            if(element.hasAttribute("data-tooltip-position") && element.getAttribute("data-tooltip-position")) {
                positionValue = element.getAttribute("data-tooltip-position").toLowerCase();
            }
        }

        switch(positionValue) {
            case "right":
                this.position = TooltipPositionEnum.right;
                break;
            case "left":
                this.position = TooltipPositionEnum.left;
                break;
            case "center":
            default:
                this.position = TooltipPositionEnum.center;
                break;
        }

        if(this.message) {
            this.build();
        }
    }

    build() {
        if(this.element.tagName !== "DIV") {
            this.container = document.createElement("DIV");
            this.element.parentElement?.insertBefore(this.container, this.element);
            this.container.append(this.element);
        } else {
            this.container = this.element;
        }
        this.container.classList.add("tooltip-container");
        this.tooltipElement = document.createElement("span");
        this.tooltipElement.classList.add("tooltip-content");

        if(this.position == TooltipPositionEnum.right) {
            this.tooltipElement.classList.add("tooltip-right");
        }
        if(this.position == TooltipPositionEnum.left) {
            this.tooltipElement.classList.add("tooltip-left");
        }

        this.generateContent();

        this.container.append(this.tooltipElement);
    }

    show() {
        this.tooltipElement?.classList.add("active");
        this._dispatchEvent("show");
    }

    hide() {
        this.tooltipElement?.classList.remove("active");
        this._dispatchEvent("hide", this);
    }

    disable() {
        this.tooltipElement?.classList.add("disabled");
        this._dispatchEvent("disable");
    }

    enable() {
        this.tooltipElement?.classList.remove("disabled");
        this._dispatchEvent("enable");
    }

    destroy() {
        if(this.container) {
            this.container.remove();
            this.container = null;
        }
    }

    isDestroyed() {
        return this.container === null;
    }

    getElement() {
        return this.container;
    }

    generateContent() {
        if(!this.tooltipElement) {
            return;
        }
        this.tooltipElement.innerHTML = "";
        if(!this.message) {
            return;
        }
        if(typeof this.message == "string") {
            this.tooltipElement.innerHTML = this.message;
        } else if(typeof this.message == "object") {
            const messageTooltip = this.message;

            if(messageTooltip.message) {
                this.tooltipElement.innerHTML = messageTooltip.message;
            }

            if (messageTooltip.actions && messageTooltip.actions.length > 0) {
                const actionsContainer = document.createElement("div");
                actionsContainer.classList.add("tooltip-actions");
                messageTooltip.actions.forEach(action => {
                    const buttonAction = document.createElement("button");
                    buttonAction.classList.add("tooltip-action");
                    if(action.icon) {
                        const spanIconAction = document.createElement("span");
                        spanIconAction.classList.add("tooltip-action-icon");
                        spanIconAction.innerHTML = action.icon;
                        buttonAction.append(spanIconAction);
                    }
                    if(action.text) {
                        const spanLabelAction = document.createElement("span");
                        spanLabelAction.classList.add("tooltip-action-label");
                        spanLabelAction.innerText = action.text;
                        buttonAction.append(spanLabelAction);
                    }
                    if(action.element) {
                        buttonAction.append(action.element);
                    }

                    buttonAction.addEventListener("click", (event) => {
                        const result = this._dispatchEvent("action.click", this, action, buttonAction);

                        if(action.url && result !== false) {
                            window.open(action.url, "_blank");
                        }

                        event.preventDefault();
                        event.stopPropagation();
                    });

                    buttonAction.addEventListener("mouseover", (event) => {
                        this._dispatchEvent("action.mouseover", this, action, buttonAction);

                        event.preventDefault();
                        event.stopPropagation();
                    });

                    actionsContainer.append(buttonAction);
                    this._dispatchEvent("action.load", this, action, buttonAction);
                });
                this.tooltipElement.append(actionsContainer);
            }
        }
    }
}
