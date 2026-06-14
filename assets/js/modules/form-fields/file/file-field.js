import Translator from '../../../utils/translator';
import mime from 'mime/lite';
import { MimeIcons } from './mime-icons';
import './file-field.css';
import {EventsDispatcher} from "../../../utils/events-dispatcher";

export class FileField extends EventsDispatcher {

    #mimetypes;
    #mimeIcons;
    #options;
    #listFile;
    #browser;
    #errorElement;

    constructor(element, options = null) {
        super();
        this.element = element;
        this.#mimetypes = mime;
        this.#mimeIcons = new MimeIcons();

        Translator.get()
            .load({
                'Drag & Drop': 'Drag & Drop',
                'or': 'or',
                'browse': 'Click for browse',
                'Files accepted': 'Files accepted',
                'File rejected': 'File rejected',
                'Limit of files reached': 'Limit of files reached'
            }, 'file-field', 'en')
            .load({
                'Drag & Drop': 'Glisser & Déposer',
                'or': 'ou',
                'browse': 'Cliquer pour rechercher',
                'Files accepted': 'Fichiers acceptés',
                'File rejected': 'Fichier refusé',
                'Limit of files reached': 'Limite de fichiers atteinte'
            }, 'file-field', 'fr');

        const defaultOptions = {
            limit: element.getAttribute('data-limit')
                ? parseInt(element.getAttribute('data-limit'), 10)
                : (element.getAttribute('data-multiple') === 'multiple' ? 5 : 1),
            accept: element.getAttribute('data-accept') ?? '',
            name: element.getAttribute('data-name') ?? '',
        };

        this.#options = options == null ? {} : Object.assign({}, options);

        for (const property in defaultOptions) {
            if (!Object.prototype.hasOwnProperty.call(this.#options, property) || this.#options[property] == null) {
                this.#options[property] = defaultOptions[property];
            }
        }

        this.#build();
        this.#binds();
    }

    #build() {
        this.#browser = document.createElement('input');
        this.#browser.type = 'file';
        this.#browser.hidden = true;
        this.#browser.accept = this.#options.accept ?? '';
        this.#errorElement = document.createElement('div');
        this.#errorElement.classList.add('errors');
        this.#resetElement();
    }

    #resetElement() {
        this.element.innerHTML = '';
        this.element.append(this.#browser);

        this.#listFile = document.createElement('ul');
        this.#listFile.classList.add('list-files');
        const inputs = this.element.querySelectorAll('input[type=file]');

        if (inputs.length > 1 || inputs[0]?.value !== '') {
            inputs.forEach((input) => {
                if (input.files && input.files.length > 0) {
                    const listItemFile = this.#createListItemFile(input.files[0], input);
                    this.#addFileInList(listItemFile);
                }
            });
            this.element.append(this.#listFile);
        } else {
            const row = document.createElement('div');
            row.classList.add('header');

            const iconElement = document.createElement('div');
            iconElement.classList.add('icon');

            const titleElement = document.createElement('div');
            titleElement.innerHTML += `
            <span class="placeholder">${Translator.get().trans('Drag & Drop', 'file-field')}</span>
            <span class="placeholder">${Translator.get().trans('or', 'file-field')}</span>
            <span class="placeholder browse">${Translator.get().trans('browse', 'file-field')}</span>
            `;

            const mimesAccepted = this.#getComputeMimesAccepted();
            if (mimesAccepted.length > 0) {
                titleElement.innerHTML += `<span class="support">${Translator.get().trans('Files accepted', 'file-field')} : ${mimesAccepted.join(', ')}</span>`;
            }

            row.append(iconElement);
            row.append(titleElement);
            this.element.append(row);
        }

        this.#resetError();
        this.element.append(this.#errorElement);
    }

    #binds() {
        this.element.addEventListener('click', () => {
            if (this.#listFile.children.length < this.#options.limit) {
                this.#browser.click();
            } else {
                this.#resetError();
                this.#showError(Translator.get().trans('Limit of files reached', 'file-field'));
            }
        });

        this.element.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.element.classList.add('dragover');
        });

        this.element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.element.classList.remove('dragover');
        });

        this.element.addEventListener('drop', (e) => {
            e.preventDefault();
            this.#resetError();
            this.element.classList.remove('dragover');
            const items = e.dataTransfer?.items;
            if (items) {
                this.#getFilesFromWebkitDataTransferItems(items).then(files => {
                    for (let i = 0; i < files.length; i++) {
                        if (this.#listFile.children.length < this.#options.limit) {
                            const listItemFile = this.#createListItemFile(files[i]);
                            this.#addFileInList(listItemFile);
                        } else {
                            this.#showError(Translator.get().trans('Limit of files reached', 'file-field'));
                            break;
                        }
                    }
                });
            }
        }, false);

        this.#browser.addEventListener('change', () => {
            this.#resetError();
            if (this.#listFile.children.length < this.#options.limit) {
                if (this.#browser.files && this.#browser.files.length > 0) {
                    const listItemFile = this.#createListItemFile(this.#browser.files[0]);
                    this.#addFileInList(listItemFile);
                } else {
                    this.#showError(Translator.get().trans('Limit of files reached', 'file-field'));
                }
            }
            this.#browser.value = '';
        });
    }

    #getComputeMimesAccepted() {
        const mimes = [];
        if (this.#options.accept) {
            for (const m of this.#options.accept.split(',')) {
                const mimeProcessed = this.#processMime(m);
                if (mimes.indexOf(mimeProcessed) === -1) {
                    mimes.push(mimeProcessed);
                }
            }
        }
        return mimes;
    }

    #processMime(mimeType) {
        mimeType = mimeType.toLowerCase().trim();
        if (mimeType.indexOf('/*') === -1) {
            return this.#mimetypes.getExtension(mimeType);
        }
        return mimeType.replace('/*', '');
    }

    #createListItemFile(file, input = null) {
        if (!file) return null;

        const mimeType = file.type;
        if (!this.#validateFileType(mimeType)) {
            this.#showError(Translator.get().trans('File rejected', 'file-field') + ': ' + file.name);
            return null;
        }

        const li = document.createElement('li');
        li.classList.add('file-item');

        if (input) {
            input.hidden = true;
        } else {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input = document.createElement('input');
            input.type = 'file';
            input.hidden = true;
            if (this.#options.name) {
                input.setAttribute('name', this.#options.name);
            }
            input.files = dataTransfer.files;
        }

        li.append(input);

        const iconElement = document.createElement('i');
        iconElement.classList.add(...this.#mimeIcons.getIcon(mimeType).split(' '));
        li.append(iconElement);
        li.append(new Text(file.name));

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove');
        removeButton.addEventListener('click', (e) => {
            li.remove();
            e.preventDefault();
            e.stopPropagation();
            if (this.#listFile.children.length === 0) {
                this.#resetElement();
            }
        });
        li.append(removeButton);
        return li;
    }

    #addFileInList(listItemFile) {
        if (!listItemFile) return;
        if (this.#listFile.parentElement == null) {
            this.element.innerHTML = '';
            this.element.append(this.#browser);
            this.element.append(this.#listFile);
            this.element.append(this.#errorElement);
        }
        this.#listFile.append(listItemFile);
    }

    #validateFileType(type) {
        if (this.#options.accept === '') return true;
        type = type.toLowerCase().trim();
        for (let m of this.#options.accept.split(',')) {
            m = m.toLowerCase().trim().replace('/*', '');
            if (type.indexOf(m) === 0) return true;
        }
        return false;
    }

    #showError(message) {
        this.#errorElement.innerHTML += `<span class="error">${message}</span>`;
    }

    #resetError() {
        this.#errorElement.innerHTML = '';
    }

    #getFilesFromWebkitDataTransferItems(dataTransferItems) {
        const files = [];

        function traverseFileTreePromise(item, path = '') {
            return new Promise((resolve) => {
                if (item.isFile) {
                    item.file((file) => {
                        file.filepath = path + file.name;
                        files.push(file);
                        resolve([file]);
                    });
                } else if (item.isDirectory) {
                    const dirReader = item.createReader();
                    dirReader.readEntries((entries) => {
                        const entriesPromises = entries.map(entry =>
                            traverseFileTreePromise(entry, path + item.name + '/')
                        );
                        Promise.all(entriesPromises).then(nestedFiles => resolve(nestedFiles.flat()));
                    });
                } else {
                    resolve([]);
                }
            });
        }

        return new Promise((resolve, reject) => {
            const entriesPromises = [];
            for (let i = 0; i < dataTransferItems.length; i++) {
                const item = dataTransferItems[i].webkitGetAsEntry();
                if (item) entriesPromises.push(traverseFileTreePromise(item));
            }
            Promise.all(entriesPromises)
                .then(nestedFiles => resolve(nestedFiles.flat()))
                .catch(reject);
        });
    }
}
