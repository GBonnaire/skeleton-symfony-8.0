import {Singleton} from "../../utils/singleton";
import {Modal} from "./modal";
import {isDomLoaded} from "../../utils/helper";
import Translator from "../../utils/translator";

export class ModalManager extends Singleton {
    static _singletonName = "mm";
    static instances = {};
    static stack = [];
    static current = null;

    static get singletonName() {
        return this._singletonName;
    }

    constructor() {
        super();

        Translator.get()
            .load(
                {
                    "yes": "Yes",
                    "no": "No",
                    "ok": "OK",
                }, "modalmanager", "en"
            )
            .load(
                {
                    "yes": "Oui",
                    "no": "Non",
                    "ok": "OK"
                }, "modalmanager", "fr"
            );

        this.isLoaded = isDomLoaded();
        this._eventDebug = false;
        this._eventCallBack = [];

        if(isDomLoaded()) {
            this.bindsEvent();
            this.isLoaded = true;
            if(ModalManager.stack.length > 0) {
                this.nextStack();
            }
        } else {
            document.addEventListener("DOMContentLoaded", () => {
                this.bindsEvent();
                this.isLoaded = true;
                if(ModalManager.stack.length > 0) {
                    this.nextStack();
                }
            })
        }
    }

    bindsEvent() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    closeAll(force = false) {
        const modals = ModalManager.instances;
        for (const modal of modals) {
            if(force || modal.canCloseByUser()) {
                modal.close();
            }
        }
    }

    handleKeyDown(e) {
        if (e.key == "Escape") {
            this.closeAll();
        }
    }

    info(content, title = "Information", callback, onload, options, id = null) {
        if(ModalManager.current || !this.isLoaded) {
            this.addStack(this.info, [content, title, callback, onload, options, id]);
            return null;
        }

        const opts = options == null ? {} : Object.assign({}, options);
        const defaultOptions = {
            withControl: true,
            canClose: true,
            ok: "OK"
        }

        for(let property in defaultOptions) {
            if (!opts.hasOwnProperty(property) || opts[property] == null) {
                opts[property] = defaultOptions[property];
            }
        }

        let modalInfo;

        const iconOpts = {
            icon: opts.icon ?? 'fa-circle-info',
            iconPosition: opts.iconPosition ?? 'left',
            iconVariant: opts.iconVariant ?? 'info'
        };

        if(opts.withControl) {
            const contolsElement = document.createElement("div");
            contolsElement.classList.add("controls");

            const buttonOk = document.createElement("button");
            buttonOk.innerText = opts['ok'];
            buttonOk.classList.add("da-btn", "da-btn-primary");
            contolsElement.append(buttonOk);

            modalInfo = new Modal({
                title: title,
                content: content,
                footer: contolsElement,
                ...iconOpts
            });

            buttonOk.addEventListener("click", () => {
                modalInfo.close();
            })
        } else {
            modalInfo = new Modal({
                title: title,
                content: content,
                canClose: opts.canClose,
                ...iconOpts
            });
        }

        if(this.isLoaded) {
            this._dispatchEvent("modal.show", [this, modalInfo, "info"]);
        }
        this._dispatchEvent("modal.info", [this, modalInfo]);

        modalInfo.addEventListener("close", () => {
            if (callback) {
                callback(modalInfo);
            }
            this.nextStack();
        })

        this.addModal(modalInfo, id);
        ModalManager.current = modalInfo;

        if (onload) {
            onload(modalInfo, id);
        }

        if(opts.closed) {
            this.nextStack();
        }

        return true;
    }

    alert(content, title = "Alerte", callback, onload, options, id = null) {
        if(ModalManager.current || !this.isLoaded) {
            this.addStack(this.alert, [content, title, callback, onload, options, id]);
            return null;
        }

        const opts = options == null ? {} : Object.assign({}, options);
        const defaultOptions = {
            ok: Translator.get().trans("ok", "modalmanager")
        }

        for(let property in defaultOptions) {
            if (!opts.hasOwnProperty(property) || opts[property] == null) {
                opts[property] = defaultOptions[property];
            }
        }

        const contolsElement = document.createElement("div");
        contolsElement.classList.add("controls");

        const buttonOk = document.createElement("button");
        buttonOk.innerText = opts.ok;
        buttonOk.classList.add("da-btn", "da-btn-primary");
        contolsElement.append(buttonOk);

        const modalAlert = new Modal({
            title: title,
            content: content,
            footer: contolsElement,
            icon: opts.icon ?? 'fa-triangle-exclamation',
            iconPosition: opts.iconPosition ?? 'left',
            iconVariant: opts.iconVariant ?? 'warning'
        });

        buttonOk.addEventListener("click", () => {
            modalAlert.close();
        })
        modalAlert.addEventListener("close", () => {
            if (callback) {
                callback(modalAlert);
            }
            this.nextStack();
        })

        this.addModal(modalAlert, id);
        ModalManager.current = modalAlert;

        if(this.isLoaded) {
            this._dispatchEvent("modal.show", [this, modalAlert, "alert"]);
        }
        this._dispatchEvent("modal.alert", [this, modalAlert]);

        if (onload) {
            onload(modalAlert, id);
        }

        if(opts.closed) {
            this.nextStack();
        }

        return true;
    }

    confirm(content, title = "Confirmation", callback, onload, options, id = null) {
        if(ModalManager.current || !this.isLoaded) {
            if(options == null || options.closed === null || options.closed === false) {
                this.addStack(this.confirm, [content, title, callback, onload, options, id]);
                return null;
            }
        }

        const opts = options == null ? {} : Object.assign({}, options);
        const defaultOptions = {
            buttons: {
                yes: Translator.get().trans("yes", "modalmanager"),
                no: Translator.get().trans("no", "modalmanager")
            },
            class: {
                yes: "da-btn-primary",
                no: "da-btn-outline"
            },
            values: {
                yes: true,
                no: false
            },
            closed: false
        }

        for(let property in defaultOptions) {
            if (!opts.hasOwnProperty(property) || opts[property] == null) {
                opts[property] = defaultOptions[property];
            }
        }

        let isAnswered = false;
        let result;

        const controlsElement = document.createElement("div");
        controlsElement.classList.add("controls");

        for(const buttonName in opts.buttons) {
            const buttonElement = document.createElement("button");
            buttonElement.innerText = opts.buttons[buttonName];
            buttonElement.classList.add("da-btn");
            buttonElement.setAttribute("data-id", buttonName);
            if(opts.class[buttonName]) {
                buttonElement.classList.add(...opts.class[buttonName].split(" "));
            }
            controlsElement.append(buttonElement);
            buttonElement.addEventListener("click", () => {
                result = opts.values[buttonName] ?? buttonName;
                isAnswered = true;
                if (callback) {
                    const response = callback(result, modalConfirmation);
                    if(response !== false) {
                        modalConfirmation.close();
                    }
                } else {
                    modalConfirmation.close();
                }
            })
        }

        const modalConfirmation = new Modal({
            title: title,
            content: content,
            closed: opts.closed,
            footer: controlsElement,
            icon: opts.icon ?? null,
            iconPosition: opts.iconPosition ?? 'left',
            iconVariant: opts.iconVariant ?? null
        });

        modalConfirmation.addEventListener("close", () => {
            if (!isAnswered && callback) {
                const response = callback(null, modalConfirmation);
                if(response !== false) {
                    this.nextStack();
                }
            } else {
                this.nextStack();
            }
        })

        this.addModal(modalConfirmation, id);
        ModalManager.current = modalConfirmation;

        if (onload) {
            onload(modalConfirmation, id);
        }

        if(this.isLoaded) {
            this._dispatchEvent("modal.show", [this, modalConfirmation, "confirm"]);
        }
        this._dispatchEvent("modal.confirm", [this, modalConfirmation]);

        if(opts.closed) {
            this.nextStack();
        }

        return true;
    }

    custom(content, title, callback, onload, options, id = null) {
        if (ModalManager.current || !this.isLoaded) {
            this.addStack(this.custom, [content, title, callback, onload, options, id]);
            return null;
        }

        const opts = Object.assign({}, options);
        opts.content = content;
        opts.title   = title;

        const modalCustom = new Modal(opts);

        modalCustom.addEventListener("close", () => {
            if (callback) {
                callback(modalCustom);
            }
            this.nextStack();
        });

        this.addModal(modalCustom, id);
        ModalManager.current = modalCustom;

        if (this.isLoaded) {
            this._dispatchEvent("modal.show", [this, modalCustom, "custom"]);
        }
        this._dispatchEvent("modal.custom", [this, modalCustom]);

        if (onload) {
            onload(modalCustom, id);
        }

        if(opts.closed) {
            this.nextStack();
        }

        return true;
    }

    length() {
        return ModalManager.stack.length;
    }

    on(event, callback) {
        this._eventCallBack.push({
            event: event,
            callback: callback
        });
        return this;
    }

    _dispatchEvent(event, args) {
        if(this._eventDebug) {
            console.log("modalManager *DEBUG*", event, args);
        }
        for(let i = 0; i < this._eventCallBack.length; i++) {
            const cb = this._eventCallBack[i];
            if(cb.event.toLowerCase() === event.toLowerCase() && typeof cb.callback === "function") {
                if(this._eventDebug) {
                    console.log("modalManager callback *DEBUG*", event, cb);
                }
                cb.callback.apply(this, args);
            }
        }
    }

    addStack(fx, args) {
        ModalManager.stack.push({f: fx, a: args});
    }

    nextStack() {
        ModalManager.current = null;
        if(ModalManager.stack.length > 0) {
            const s = ModalManager.stack.shift();
            s.f.apply(this, s.a);
            return true;
        } else if(this.isLoaded) {
            this._dispatchEvent("stack.finish", this);
        }
        return false;
    }

    addModal(modal, id) {
        if(!id) {
            id = this.randomId();
        }
        ModalManager.instances[id] = modal;
        return id;
    }

    getModal(id) {
        return ModalManager.instances[id] || null;
    }

    getModals() {
        return ModalManager.instances;
    }

    randomId() {
        return "modal-"+Math.random().toString(36).substr(2);
    }
}
