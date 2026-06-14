import "./rating.scss";
import {AbstractField} from "../abstract/abstract-field";

interface RatingOptions {
    number: number,
    readonly?: boolean | null,
    showScore?: boolean | null
}

export class Rating extends AbstractField {
    private options: RatingOptions;
    private stars: Array<HTMLElement>;
    private score: number;
    private element: HTMLElement;
    private inputElement?: HTMLInputElement|null;
    private scoreElement?: HTMLElement|null;


    constructor(element: HTMLElement|HTMLInputElement, options?: RatingOptions) {
        super(true);
        if(element.tagName == "INPUT") {
            this.inputElement = element as HTMLInputElement;
            this.element = document.createElement("div") as HTMLElement;
            this.initInput();
        } else {
            this.inputElement = null;
            this.element = element;
        }

        this.buildOptions(options);
        this.init();
    }

    public setValue(value: number) {
        if(this.options.readonly) {
            return;
        }

        this.score = value;

        this.render();

        if(this.inputElement) {
            console.log("Set value in input");
            this.inputElement.value = this.score.toString();
        }

        this._dispatchEvent("change", this, value);
    }

    public getValue() {
        return this.score;
    }

    public render() {
        if(this.scoreElement) {
            this.scoreElement.innerText = this.score + "/" + this.options.number;
        }
        console.log(this.score);
        for(let i = 0; i < this.options.number; i++) {
            const star = this.stars[i];
            if(this.score >= (+i + 1)) {
                star.classList.add("active");
                star.classList.remove("half-active");
            } else if(this.score >= (+i + 0.5) && this.score < (+i + 1)) {
                star.classList.remove("active");
                star.classList.add("half-active");
            } else {
                star.classList.remove("active");
                star.classList.remove("half-active");
            }
        }
    }

    private shadowRender(score: number) {
        for(let i = 0; i < this.options.number; i++) {
            const star = this.stars[i];
            if(score >= (+i + 1)) {
                star.classList.add("active");
                star.classList.remove("half-active");
            } else if(score >= (+i + 0.5) && score < (+i + 1)) {
                star.classList.remove("active");
                star.classList.add("half-active");
            } else {
                star.classList.remove("active");
                star.classList.remove("half-active");
            }
        }
    }

    private createStars() {
        this.stars = [];
        for(let i = 0; i < this.options.number; i++) {
            this.stars.push(this.createStar(+i + 1));
        }
    }

    private createStar(index): HTMLElement {
        const star = document.createElement("div");
        star.className = "star";
        star.setAttribute("data-index", index);

        this.element.append(star);

        star.addEventListener("click", () => { this.setValue(index); });
        star.addEventListener("mouseover", () => { this.shadowRender(index); })
        star.addEventListener("mouseleave", () => { this.shadowRender(this.score); })
        return star;
    }


    private buildOptions(options?: RatingOptions){
        // Options - default value
        const defaultOptions = {
            number: 5,
            readonly: null,
            showScore: null,
        }

        // Manage Options
        this.options = Object.assign({},options);

        for(let property in defaultOptions) {
            if (!this.options.hasOwnProperty(property) || this.options[property]==null ) {
                this.options[property] = defaultOptions[property];
            }
        }
    }

    private initInput() {
        if(!this.inputElement) {
            return ;
        }
        this.inputElement.style.display = "none";

        this.element.className = this.inputElement.className;
        this.inputElement?.after(this.element);


        this.element.setAttribute("data-score", this.inputElement.value);
        if(this.inputElement?.hasAttribute("data-showscore")) {
            this.element.setAttribute("data-showscore", this.inputElement?.getAttribute("data-showscore") ?? "false");
        } else {
            this.element.setAttribute("data-showscore", "false");
        }
        if(this.inputElement?.hasAttribute("readonly")) {
            this.element.setAttribute("readonly", "readonly");
        }
    }

    private init() {
        this.element.classList.add("rating-score");

        if(this.inputElement) {
            this.score = parseFloat(this.inputElement!.value ?? "0");
        } else if(this.element.hasAttribute("data-score")) {
            this.score = parseFloat(this.element.getAttribute("data-score") ?? "0");
        } else {
            this.score = 0;
        }

        if(this.options.showScore === null) {
            if(this.element.hasAttribute("data-showscore")) {
                this.options.showScore = this.element.getAttribute("data-showscore")?.toLowerCase() === 'true' || this.element.getAttribute("data-showscore") === '1';
            } else {
                this.options.showScore = false;
            }
        }

        if(this.options.readonly === null) {
            if(this.element.hasAttribute("readonly")) {
                this.options.readonly = true;
            } else {
                this.options.readonly = false;
            }
        }

        if(this.options.readonly) {
            this.element.classList.add("readonly");
        }

        if(this.options.showScore) {
            this.scoreElement = document.createElement("span");
            this.scoreElement.className = "rating-score-value";
            this.element.append(this.scoreElement);
        } else {
            this.scoreElement = null;
        }
        this.createStars();
        this.render();
    }


}