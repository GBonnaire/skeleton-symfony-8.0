import { Controller } from '@hotwired/stimulus';


export default class extends Controller {
    static values = {
        strenghtMode: Boolean,
    }
    connect() {
        this.#init();
        this.#bindEvents();
    }

    onChange() {
        if(this.strenghtModeValue) {
            this.#updateStrength();
        }
    }

    #init() {
        const parentElement = this.element.parentElement;
        parentElement.style.position = "relative";

        this.trigger = document.createElement("i");
        this.trigger.classList.add("fas", "fa-eye", "absolute", "right-3", "text-xl", "cursor-pointer", "text-gray-500", "inline-block");
        this.element.after(this.trigger);

        // calculate position
        const coordElement = this.element.getBoundingClientRect();
        const coordParentElement = parentElement.getBoundingClientRect();
        const topOfTrigger = (coordElement.top - coordParentElement.top) + (coordElement.height / 2) - 10 /* Icon size /2 */;

        this.trigger.style.top = topOfTrigger+"px";

        if(this.strenghtModeValue) {
            this.strenghtElement = document.createElement("div");
            //this.strenghtElement.classList.add("flex", "items-center");
            this.element.after(this.strenghtElement);
            this.strengthFillElement = document.createElement("div");
            this.strengthLabelElement = document.createElement("div");

            this.strenghtElement.append(this.strengthFillElement);
            this.strenghtElement.append(this.strengthLabelElement);
        }


    }

    #bindEvents(){
        this.trigger.addEventListener('click', () => this.#toggle());
    }

    #toggle(){
        if(this.element.getAttribute("type") === "password"){
            this.element.setAttribute("type", "text");
            this.trigger.classList.remove("fa-eye");
            this.trigger.classList.add("fa-eye-slash");
        } else {
            this.element.setAttribute("type", "password");
            this.trigger.classList.add("fa-eye");
            this.trigger.classList.remove("fa-eye-slash");
        }
    }

    #scorePassword(p) {
        let score = 0;
        if (!p) return 0;
        // length
        if (p.length >= 8) score += 1;
        if (p.length >= 12) score += 1;
        // variety
        if (/[0-9]/.test(p)) score += 1;
        if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
        if (/[^A-Za-z0-9]/.test(p)) score += 1;
        return Math.min(score, 5);
    }

     #updateStrength() {
        const val = this.element.value || '';
        const s = val ? this.#scorePassword(val) : -1;
        let width = '0%';
        let cls = '';
        let labelcls = '';
        let label = '';

        if (s === -1) { width = '0%'; cls = ''; label = ''; }
        else if (s <= 1) { width = '20%'; cls = 'bg-danger-500'; label = 'Votre mot de passe est faible'; }
        else if (s === 2) { width = '40%'; cls = 'bg-warning-500'; labelcls = 'text-warning-500'; label = 'Votre mot de passe est moyen'; }
        else if (s === 3) { width = '60%'; cls = 'bg-warning-600'; labelcls = 'text-warning-600'; label = 'Votre mot de passe est correct'; }
        else if (s === 4) { width = '80%'; cls = 'bg-success-500'; labelcls = 'text-success-500'; label = 'Votre mot de passe est bon'; }
        else if (s >= 5) { width = '100%'; cls = 'bg-success-600'; labelcls = 'text-success-600'; label = 'Votre mot de passe est fort'; }

        this.strengthFillElement.style.width = width;
        // Preserve base Tailwind classes while updating the color indicator
        this.strengthFillElement.className = 'block h-1 rounded transition-all duration-300 ease-in-out ' + cls;
        this.strengthLabelElement.textContent = label;
        this.strengthLabelElement.className = 'mt-1 text-xs text-gray-600 ' + labelcls;
    }
}
