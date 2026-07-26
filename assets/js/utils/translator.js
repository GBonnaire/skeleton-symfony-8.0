import {Singleton} from "./singleton";

/**
 * Translator
 * Service de traduction global des modules JavaScript, organisé par domaines.
 * Singleton : toujours y accéder via Translator.get().
 *
 * Détection de la langue (à l'instanciation, dans cet ordre) :
 *   1. l'attribut lang de la balise <html>
 *   2. la langue du navigateur (2 premiers caractères)
 *   3. repli sur "en"
 *
 * Domaines :
 *   Chaque module charge ses textes dans son propre domaine ("clipboard", "file-field",
 *   "toaster"...) afin d'éviter les collisions de clés. Une clé absente du domaine
 *   demandé est cherchée dans le domaine global, puis retournée telle quelle en dernier
 *   recours — un texte non traduit s'affiche donc toujours, jamais une clé vide.
 *
 * Convention du projet :
 *   Un module déclare ses traductions dans son constructeur, en anglais et en français,
 *   puis n'utilise plus que trans() dans son code.
 *
 * Usage — déclarer les textes d'un module :
 *   import Translator from '../../utils/translator';
 *
 *   Translator.get()
 *       .load({
 *           "Copy": "Copy",
 *           "Text copied": "Text copied",
 *       }, "clipboard", "en")
 *       .load({
 *           "Copy": "Copier",
 *           "Text copied": "Texte copié",
 *       }, "clipboard", "fr");
 *
 * Usage — traduire :
 *   Translator.get().trans("Copy", "clipboard");        // "Copier" si la page est en fr
 *   Translator.get().trans("Unknown key", "clipboard"); // "Unknown key" — repli sur la clé
 *
 *   // Ajouter ou surcharger un texte unitaire
 *   Translator.get().set("Copy", "Dupliquer", "clipboard", "fr");
 *
 *   // Adapter un comportement à la langue courante
 *   if (Translator.get().isLang("fr")) {
 *       datatable.language = languageFr;
 *   }
 */
export default class Translator extends Singleton {
    static _singletonName = "tr";

    static get singletonName() {
        return this._singletonName;
    }

    constructor() {
        super();

        this.transDictionary = {};
        this.lang = document.documentElement.lang.toLowerCase();
        if(this.lang == "") {
            const userLang = navigator.language || navigator['userLanguage'];
            this.lang = userLang.substring(0, 2);
        }
        if(this.lang == "") {
            this.lang = "en";
        }
    }

    /**
     * Retourne le code de la langue courante (2 caractères, en minuscules).
     *
     * @returns {string} Ex: "fr"
     *
     * @example
     * const locale = Translator.get().getLang();      // "fr"
     * const formatter = new Intl.NumberFormat(locale);
     */
    getLang() {
        return this.lang;
    }

    /**
     * Indique si la langue courante correspond au code fourni (comparaison insensible à la casse).
     *
     * @param {string} lang Code langue à tester (ex: "fr", "EN")
     * @returns {boolean}
     *
     * @example
     * const language = Translator.get().isLang("fr") ? languageFr : languageEn;
     */
    isLang(lang) {
        return this.lang == lang.toLowerCase();
    }

    /**
     * Charge un lot de traductions dans un domaine et une langue.
     * Les clés déjà présentes sont écrasées, les autres conservées.
     *
     * @param {Object<string,string>} texts Dictionnaire clé source => texte traduit
     * @param {string} [domain=""] Domaine du module (vide = domaine global)
     * @param {string} [lang=""] Code langue (vide = langue courante)
     * @returns {this} Pour chaînage
     *
     * @example
     * Translator.get()
     *     .load({ "Save": "Save", "Cancel": "Cancel" }, "form", "en")
     *     .load({ "Save": "Enregistrer", "Cancel": "Annuler" }, "form", "fr");
     */
    load(texts, domain = "", lang = "") {
        if(!texts) {
            return this;
        }
        if(!domain) {
            domain = "__GLOBAL__";
        }

        if(!lang) {
            lang = this.lang;
        } else {
            lang = lang.toLowerCase();
        }

        if (!this.transDictionary[lang]) {
            this.transDictionary[lang] = {};
        }

        if(!this.transDictionary[lang][domain]) {
            this.transDictionary[lang][domain] = {};
        }
        for(const textKey in texts) {
            this.transDictionary[lang][domain][textKey] = texts[textKey];
        }

        return this;
    }

    /**
     * Définit ou surcharge une traduction unitaire.
     * Équivalent de load() pour une seule clé.
     *
     * @param {string} text Clé source
     * @param {string} textTranslated Texte traduit
     * @param {string} [domain=""] Domaine du module (vide = domaine global)
     * @param {string} [lang=""] Code langue (vide = langue courante)
     * @returns {this} Pour chaînage
     *
     * @example
     * // Surcharger un libellé du composant depuis la page
     * Translator.get().set("browse", "Parcourir mes documents", "file-field", "fr");
     */
    set(text, textTranslated, domain = "", lang = "") {
        if(!domain) {
            domain = "__GLOBAL__";
        }
        if(!lang) {
            lang = this.lang;
        } else {
            lang = lang.toLowerCase();
        }

        if (!this.transDictionary[lang]) {
            this.transDictionary[lang] = {};
        }
        if (!this.transDictionary[lang][domain]) {
            this.transDictionary[lang][domain] = {};
        }
        this.transDictionary[lang][domain][text] = textTranslated;

        return this;
    }

    /**
     * Traduit une clé dans le domaine et la langue demandés.
     *
     * Ordre de résolution : domaine demandé, puis domaine global, puis la clé
     * elle-même. Si la langue n'a aucune traduction chargée, repli sur l'anglais.
     * La méthode ne retourne donc jamais de valeur vide.
     *
     * @param {string} text Clé source
     * @param {string} [domain=""] Domaine du module (vide = domaine global)
     * @param {string} [lang=""] Code langue (vide = langue courante)
     * @returns {string} Texte traduit, ou la clé si aucune traduction n'existe
     *
     * @example
     * const label = Translator.get().trans("Files accepted", "file-field");
     * element.innerHTML = `<span class="support">${label} : ${mimes.join(', ')}</span>`;
     *
     * // Forcer une langue précise
     * Translator.get().trans("Copy", "clipboard", "en");     // "Copy"
     */
    trans(text, domain = "", lang = "") {
        if(!domain) {
            domain = "__GLOBAL__";
        }
        if(!lang) {
            lang = this.lang;
        }
        if(!this.transDictionary[lang]) {
            lang = "en";
        }
        if(!this.transDictionary[lang][domain]) {
            if(domain !== "__GLOBAL__") {
                if(this.transDictionary[lang]["__GLOBAL__"] && this.transDictionary[lang]["__GLOBAL__"][text]) {
                    return this.transDictionary[lang]["__GLOBAL__"][text];
                }
            }
            return text;
        }

        if(this.transDictionary[lang][domain][text]) {
            return this.transDictionary[lang][domain][text];
        }
        if(domain !== "__GLOBAL__") {
            if(this.transDictionary[lang]["__GLOBAL__"] && this.transDictionary[lang]["__GLOBAL__"][text]) {
                return this.transDictionary[lang]["__GLOBAL__"][text];
            }
        }
        return text;
    }
}
