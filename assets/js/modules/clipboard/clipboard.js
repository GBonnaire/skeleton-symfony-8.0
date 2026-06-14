import "./clipboard.css";
import {EventsDispatcher} from "../../utils/events-dispatcher";
import {Modal} from "../modal/modal";
import ClipboardJS from "clipboard";
import {guid} from "../../utils/helper";
import Translator from "../../utils/translator";

export class Clipboard extends EventsDispatcher {

    constructor(element, options) {
        super();

        Translator.get()
            .load({
                "Copy": "Copy",
                "Text copied": "Text copied",
                "The image cannot be copied": "The image cannot be copied",
                "Image copied": "Image copied",
                "Error copying the image :": "Error copying the image :",
                "Clipboard": "Clipboard"
            }, "clipboard", "en")
            .load({
                "Copy": "Copier",
                "Text copied": "Texte copié",
                "The image cannot be copied": "L'image ne peux pas être copiée",
                "Image copied": "Image copiée",
                "Error copying the image :": "Erreur lors de la copie de l'image :",
                "Clipboard": "Presse-papier"
            }, "clipboard", "fr")

        this.element = element;

        if(!options) {
            this.options = {};
        } else {
            this.options = Object.assign({}, options);
        }

        const defaultOptions = {
            trigger: null,
        }

        for(let property in defaultOptions) {
            if (!this.options.hasOwnProperty(property) || this.options[property] == null) {
                this.options[property] = defaultOptions[property];
            }
        }
        this.build();
        this.binds();
    }

    build() {
        if(this.options.trigger && typeof this.options.trigger === "object") {
            this.options.trigger['element'] = document.createElement("button");
            this.options.trigger['element'].classList.add("clipboard-trigger");
            this.element.classList.add("clipboard-target");
            if(!this.element.id) {
                this.element.id = "mc_" + guid("xxxxxx");
            }
            this.options.trigger['element'].setAttribute("data-clipboard-target", "#" + this.element.id)
            if(this.options.trigger['text']) {
                this.options.trigger['element'].innerText = this.options.trigger['text'];
            } else {
                this.options.trigger['element'].innerText = Translator.get().trans("Copy", "clipboard");
            }
            if(this.options.trigger['class']) {
                this.options.trigger['element'].classList.add(this.options.trigger['class']);
            }

            this.element.append(this.options.trigger['element']);

            const cb = new ClipboardJS(this.options.trigger['element']);
            cb.on("success", () => {
                Clipboard.showModal(Translator.get().trans("Text copied", "clipboard"));
                const selection = window.getSelection();
                if(selection) {
                    selection.removeAllRanges();
                }
            });
        }
    }

    binds() {
        if(this.options.trigger && this.options.trigger instanceof HTMLElement) {
            this.options.trigger.addEventListener("click", (e) => {
                this.copy();
            })
        }
    }

    copy() {
        if(this.element.tagName.toLowerCase() == "img") {
            if(this.element.getAttribute("src")) {
                const src = this.element.getAttribute("src");
                this.copyImageFromURL(src);
            } else {
                alert(Translator.get().trans("The image cannot be copied", "clipboard"));
            }
        } else {
            const text = ClipboardJS.copy(this.element)
            if(text) {
                Clipboard.showModal(Translator.get().trans("Text copied", "clipboard"));
            }
        }
    }

    copyImageFromURL(url) {
        try {
            fetch(url).then((response) => {
                return response.blob()
            }).then((blob) => {

                const img = document.createElement('img');
                img.src = URL.createObjectURL(blob);

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);

                        canvas.toBlob((canvasBlob) => {
                            if (canvasBlob) {
                                const item = new ClipboardItem({'image/png': canvasBlob});
                                navigator.clipboard.write([item]);
                                Clipboard.showModal(Translator.get().trans("Image copied", "clipboard"))
                                this._dispatchEvent("copy", this, "image");
                            }
                        });
                    };
                }

            });

        } catch (error) {
            console.error(Translator.get().trans("Error copying the image :", "clipboard"), error);
        }
    }

    static showModal(message) {
        Translator.get()
            .load({"Clipboard": "Presse-papier"}, "clipboard-title", "fr")
            .load({"Clipboard": "Clipboard"}, "clipboard-title", "en");
        const modal = new Modal({
            title: Translator.get().trans("Clipboard", "clipboard-title"),
            icon: "fa-regular fa-clipboard-check",
            iconVariant: "info",
            iconSize: 48,
            content: `<p style="height: 48px; display: flex; align-items: center;">${message}</p>`,
            canClose: true,
            width: "400px",
            height: "150px",
            backdrop: false,
        });
        setTimeout(() => {
            modal.close();
        }, 4000);
    }
}
