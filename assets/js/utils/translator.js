import {Singleton} from "./singleton";

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

    getLang() {
        return this.lang;
    }

    isLang(lang) {
        return this.lang == lang.toLowerCase();
    }

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
