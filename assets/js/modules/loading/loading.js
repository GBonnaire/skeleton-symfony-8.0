import "./loading.css";

export class Loading {
    constructor(element) {
        this.element = element;
        this.build();
    }

    build() {
        this.loading = document.createElement('div');
        this.loading.className = 'loading';
        this.element.after(this.loading);
    }

    remove() {
        if(this.loading) {
            this.loading.remove();
        }
    }
}
