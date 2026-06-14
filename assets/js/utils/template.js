export class Template {
    constructor(html, vars, removeUnsedVar = false) {
        if(typeof html == "string") {
            this.html = html;
        } else if(html != null) {
            this.html = html.innerHTML;
        } else {
            this.html = "";
        }

        if(vars) {
            this.vars = Object.entries(vars).reduce((o, [key, value]) => {
                o[key.toLowerCase()] = value;
                return o;
            }, {});
        } else {
            this.vars = {};
        }

        this.varsInString = [];
        this.removeUnsedVar = removeUnsedVar;
        this.parserHTML();
        this.processHTML();
    }

    parserHTML() {
        const regex = /\@\{(\s*[\w]+\s*)\}/g;
        let match;

        while ((match = regex.exec(this.html)) !== null) {
            this.varsInString.push(match[1]);
        }
    }

    processHTML() {
        this.varsInString.forEach((varInString) => {
            const regExp = new RegExp("\@\{"+varInString+"\}", "g");
            this.html = this.html.replace(regExp, (this.vars[varInString.toLowerCase().trim()] ?? (this.removeUnsedVar ? "" : "@{" + varInString + "}")));
        });
    }

    getElement(parentTag = "") {
        return (new DOMParser)
            .parseFromString("<"+parentTag+">" + this.html + "</"+parentTag+">", "text/html")
            .body
            .firstElementChild;
    }

    getString() {
        return this.html;
    }
}
