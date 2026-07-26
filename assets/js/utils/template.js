/**
 * Template
 * Micro-moteur de gabarits HTML basé sur des variables au format `@{nom}`.
 * Le remplacement est effectué dès la construction ; l'instance sert ensuite
 * à récupérer le résultat sous forme de chaîne ou d'élément DOM.
 *
 * Syntaxe :
 *   Les variables s'écrivent `@{nom}` dans le HTML. Les noms sont insensibles à la casse
 *   (`@{Titre}` et `@{titre}` pointent la même valeur). Une variable non fournie est
 *   laissée telle quelle par défaut, ou retirée si `removeUnsedVar` vaut true.
 *
 * La source peut être une chaîne HTML ou un élément dont l'innerHTML est utilisé —
 * typiquement une balise <template> présente dans la page.
 *
 * Attention : les valeurs sont injectées sans échappement. Ne pas y passer directement
 * une saisie utilisateur non assainie.
 *
 * Usage — depuis une chaîne :
 *   import { Template } from '../../utils/template';
 *
 *   const tpl = new Template(
 *       '<div class="card"><h3>@{title}</h3><p>@{description}</p></div>',
 *       { title: 'Facture', description: 'Payée le 12/03' }
 *   );
 *
 *   container.append(tpl.getElement());     // élément DOM prêt à insérer
 *   console.log(tpl.getString());           // ou la chaîne HTML résultante
 *
 * Usage — depuis une balise <template> de la page :
 *   const tpl = new Template(
 *       document.querySelector('#row-template'),
 *       { id: user.id, name: user.name },
 *       true                                // retire les @{...} non renseignés
 *   );
 *   tableBody.append(tpl.getElement('tr')); // parenté correcte pour un <tr>
 */
export class Template {
    /**
     * @param {string|HTMLElement|null} html Chaîne HTML, élément source (son innerHTML est utilisé), ou null
     * @param {Object<string,string|number>} [vars] Valeurs des variables `@{nom}`
     * @param {boolean} [removeUnsedVar=false] Si true, les variables non fournies sont retirées
     *                                         au lieu d'être laissées visibles dans le HTML
     */
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

    /**
     * Repère toutes les variables `@{nom}` présentes dans le HTML source (usage interne).
     * Appelée par le constructeur avant processHTML().
     *
     * @returns {void}
     */
    parserHTML() {
        const regex = /\@\{(\s*[\w]+\s*)\}/g;
        let match;

        while ((match = regex.exec(this.html)) !== null) {
            this.varsInString.push(match[1]);
        }
    }

    /**
     * Remplace chaque variable repérée par sa valeur (usage interne).
     * Une variable sans valeur est retirée si removeUnsedVar est actif, sinon laissée en place.
     *
     * @returns {void}
     */
    processHTML() {
        this.varsInString.forEach((varInString) => {
            const regExp = new RegExp("\@\{"+varInString+"\}", "g");
            this.html = this.html.replace(regExp, (this.vars[varInString.toLowerCase().trim()] ?? (this.removeUnsedVar ? "" : "@{" + varInString + "}")));
        });
    }

    /**
     * Retourne le premier élément DOM du gabarit interprété.
     *
     * Le paramètre `parentTag` sert de conteneur de parsing : il est indispensable
     * pour les balises dont le parent est contraint par HTML (`tr` dans un `table`,
     * `option` dans un `select`...), sans quoi le navigateur les écarte au parsing.
     *
     * @param {string} [parentTag=""] Balise parente utilisée pour le parsing (ex: "table", "select")
     * @returns {Element|null} Premier élément du gabarit, ou null si le HTML est vide
     *
     * @example
     * // Cas courant
     * const card = new Template('<div class="card">@{title}</div>', { title: 'Bonjour' }).getElement();
     * container.append(card);
     *
     * // Ligne de tableau : préciser le parent
     * const row = new Template('<tr><td>@{name}</td></tr>', { name: 'Dupont' }).getElement('table');
     * tableBody.append(row);
     */
    getElement(parentTag = "") {
        return (new DOMParser)
            .parseFromString("<"+parentTag+">" + this.html + "</"+parentTag+">", "text/html")
            .body
            .firstElementChild;
    }

    /**
     * Retourne le gabarit interprété sous forme de chaîne HTML.
     *
     * @returns {string}
     *
     * @example
     * const html = new Template('<li>@{label}</li>', { label: 'Élément' }).getString();
     * list.innerHTML += html;
     */
    getString() {
        return this.html;
    }
}
