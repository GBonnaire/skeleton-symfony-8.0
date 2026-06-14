import Translator from "../../../utils/translator";
import mime from 'mime/lite';
import {MimeIcons} from "./mime-icons";
import "./file-field.scss";
import {AbstractField} from "../abstract/abstract-field";

interface FileOptionsInterface {
    limit?: number,
    accept?: string,
    name?: string
}

export class FileField extends AbstractField {
    private mimetypes: any;
    private mimeIcons: MimeIcons;
    private options: FileOptionsInterface;
    private listFile: HTMLUListElement;
    private browser: HTMLInputElement;
    private errorElement: HTMLElement;

    constructor(private element: HTMLElement, options: FileOptionsInterface|null = null) {
        super();
        this.mimetypes = mime;
        this.mimeIcons = new MimeIcons();
        Translator.get()
            .load({
                "Drag & Drop": "Drag & Drop",
                "or": "or",
                "browse": "Click for browse",
                "Files accepted": "Files accepted",
                "File rejected": "File rejected",
                "Limit of files reached": "Limit of files reached"
            }, "file-field", "en")
            .load({
                "Drag & Drop": "Glisser & Déposer",
                "or": "ou",
                "browse": "Cliquer pour rechercher",
                "Files accepted": "Fichiers acceptés",
                "File rejected": "Fichier refusé",
                "Limit of files reached": "Limite de fichiers atteinte"
            }, "file-field", "fr")
        ;

        const defaultOptions = {
            limit: this.element.getAttribute("data-multiple") == "multiple" ? 5 : 1,
            accept: this.element.getAttribute("data-accept") ?? "",
            name: this.element.getAttribute("data-name") ?? "",
        }

        if(options == null) {
            this.options = {};
        } else {
            this.options = Object.assign({}, options);
        }


        for (let property in defaultOptions) {
            if (!this.options.hasOwnProperty(property) || this.options[property] == null) {
                this.options[property] = defaultOptions[property];
            }
        }

        this.build();
        this.binds();
    }

    private build(): void
    {
        this.browser = document.createElement("input");
        this.browser.type = "file";
        this.browser.hidden = true;
        this.browser.accept = this.options.accept ?? "";
        this.errorElement = document.createElement("div");
        this.errorElement.classList.add("errors");
        this.resetElement();
    }

    private resetElement(): void
    {
        this.element.innerHTML = "";
        this.element.append(this.browser);

        this.listFile = document.createElement("ul");
        this.listFile.classList.add("list-files");
        const inputs = this.element.querySelectorAll("input[type=file]") as NodeListOf<HTMLInputElement>;

        if(inputs.length > 1 || inputs[0].value !== "") {
            inputs.forEach((input: HTMLInputElement) => {
                if(input.files && input.files.length > 0) {
                    const listItemFile = this.createListItemFile(input.files[0], input);
                    this.addFileInList(listItemFile);
                }
            })

            this.element.append(this.listFile);
        } else {
            const row = document.createElement("div");
            row.classList.add("header");

            const iconElement = document.createElement("div");
            iconElement.classList.add("icon");

            const titleElement = document.createElement("div");
            titleElement.innerHTML += `
            <span class="placeholder">${Translator.get().trans("Drag & Drop", "file-field")}</span>
            <span class="placeholder">${Translator.get().trans("or", "file-field")}</span>
            <span class="placeholder browse">${Translator.get().trans("browse", "file-field")}</span>
        `;

            const mimesAccepted = this.getComputeMimesAccepted();
            if(mimesAccepted.length > 0) {
                titleElement.innerHTML += `
            <span class="support">${Translator.get().trans("Files accepted", "file-field")} : ${mimesAccepted.join(", ")}</span>
            `;
            }
            row.append(iconElement);
            row.append(titleElement);
            this.element.append(row);
        }

        this.resetError();
        this.element.append(this.errorElement);
    }

    private binds(): void
    {
        this.element.addEventListener("click", (e) => {
            if(this.listFile.children.length < this.options.limit!) {
                this.browser.click();
            } else {
                this.resetError();
                this.showError(Translator.get().trans("Limit of files reached", "file-field"));
            }
        });
        this.element.addEventListener("dragover", (e) => {
            e.preventDefault();
            this.element.classList.add("dragover");
        });
        this.element.addEventListener("dragleave", (e) => {
            e.preventDefault();
            this.element.classList.remove("dragover");
        });

        this.element.addEventListener("drop", (e) => {
            e.preventDefault();
            this.resetError();
            this.element.classList.remove("dragover");
            const items = e.dataTransfer?.items;
            if(items) {
                this.getFilesFromWebkitDataTransferItems(items)
                    .then(files => {
                        for(let i = 0; i < files.length; i++) {
                            if(this.listFile.children.length < this.options.limit!) {
                                const listItemFile = this.createListItemFile(files[i]);
                                this.addFileInList(listItemFile);
                            } else {
                                this.showError(Translator.get().trans("Limit of files reached", "file-field"));
                                break;
                            }
                        }
                    });
            }
        }, false)

        this.browser.addEventListener("change", (e) => {
            this.resetError();
            if(this.listFile.children.length < this.options.limit!) {
                if(this.browser.files && this.browser.files.length > 0) {
                    const listItemFile = this.createListItemFile(this.browser.files[0]);
                    this.addFileInList(listItemFile);
                } else {
                    this.showError(Translator.get().trans("Limit of files reached", "file-field"));
                }
            }
            this.browser.value = "";
        });
    }

    private getComputeMimesAccepted(): Array<string>
    {
        const mimes = [] as Array<string>;
        if(this.options.accept) {
            const mimesInAccept = this.options.accept.split(",");
            for(const mime of mimesInAccept) {
                const mimeProcessed = this.processMime(mime);
                if(mimes.indexOf(mimeProcessed) == -1) {
                    mimes.push(mimeProcessed);
                }
            }
        }

        return mimes;
    }

    private processMime(mime): string
    {
        mime = mime
            .toLowerCase()
            .trim();

        if(mime.indexOf("/*") == -1) {
            return this.mimetypes.getExtension(mime);
        } else {
            return mime.replace("/*", "");
        }
    }

    private createListItemFile(file: File, input: HTMLInputElement|null = null): HTMLLIElement|null {
        if (file) {
            const mime = file.type;
            if(!this.validateFileType(mime)) {
                this.showError(Translator.get().trans("File rejected", "file-field") + ": " + file.name);
                return null;
            }
            const li = document.createElement("li");
            li.classList.add("file-item");
            if(input) {
                input.hidden = true;
            } else {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                input = document.createElement("input");
                input.type = "file";
                input.hidden = true;
                if(this.options.name) {
                    input.setAttribute("name", this.options.name);
                }

                input.files = dataTransfer.files;
            }

            li.append(input);

            const iconElement = document.createElement("i");
            iconElement.classList.add(...this.mimeIcons.getIcon(mime).split(" "));
            li.append(iconElement);
            li.append(new Text(file.name))
            const removeButton = document.createElement("button");
            removeButton.classList.add("remove");
            removeButton.addEventListener("click", (e) => {
                li.remove();
                e.preventDefault();
                e.stopPropagation();
                if(this.listFile.children.length == 0) {
                    this.resetElement();
                }
            })
            li.append(removeButton);
            return li;
        }

        return null;
    }

    private addFileInList(listItemFile: HTMLLIElement|null): void
    {
        if(listItemFile) {
            if(this.listFile.parentElement == null) {
                this.element.innerHTML = "";
                this.element.append(this.browser);
                this.element.append(this.listFile);
                this.element.append(this.errorElement);
            }
            this.listFile.append(listItemFile)
        }
    }

    private validateFileType(type: string): boolean
    {
        if(this.options.accept=="") {
            return true;
        }
        type = type.toLowerCase().trim();
        for(let mime of this.options.accept!.split(",")) {
            mime = mime.toLowerCase().trim().replace("/*", "");
            if(type.indexOf(mime) == 0) {
                return true;
            }
        }

        return false;
    }

    private showError(message: string): void
    {
        this.errorElement.innerHTML += `<span class="error">${message}</span>`;
    }

    private resetError(): void
    {
        this.errorElement.innerHTML = "";
    }

    /** Manage files in folder **/
    private getFilesFromWebkitDataTransferItems(dataTransferItems: DataTransferItemList): Promise<File[]> {
        let files: File[] = [];

        function traverseFileTreePromise(item: any, path: string = ''): Promise<File[]> {
            return new Promise((resolve) => {
                if (item.isFile) {
                    item.file((file: File) => {
                        (file as any).filepath = path + file.name; // save full path
                        files.push(file);
                        resolve([file]);
                    });
                } else if (item.isDirectory) {
                    let dirReader = item.createReader();
                    dirReader.readEntries((entries: any[]) => {
                        let entriesPromises: Promise<File[]>[] = [];
                        for (let entry of entries) {
                            entriesPromises.push(traverseFileTreePromise(entry, path + item.name + "/"));
                        }
                        // Flatten the result of Promise.all
                        Promise.all(entriesPromises).then((nestedFiles) => {
                            resolve(nestedFiles.flat());
                        });
                    });
                } else {
                    resolve([]); // In case the item is neither a file nor a directory
                }
            });
        }

        return new Promise((resolve, reject) => {
            let entriesPromises: Promise<File[]>[] = [];
            for (let i = 0; i < dataTransferItems.length; i++) {
                let item = dataTransferItems[i].webkitGetAsEntry();
                if (item) {
                    entriesPromises.push(traverseFileTreePromise(item));
                }
            }
            Promise.all(entriesPromises)
                .then((nestedFiles) => {
                    resolve(nestedFiles.flat()); // Flatten the array of arrays to get a flat array of files
                })
                .catch(reject);
        });
    }
}