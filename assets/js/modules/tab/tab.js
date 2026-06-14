import "./tab.css";

export class TabManager {
    constructor(root = document) {
        this.root = root instanceof Element ? root : document;
        this.content = {};
        const tabsContent = this.root.querySelectorAll(".tab-content");

        tabsContent.forEach((tabContent) => {
            const id = tabContent.getAttribute("id");
            if (id) {
                this.content[id] = tabContent;
                tabContent.style.display = "none";
            }
        });

        this.bind();
    }

    bind() {
        const tabs = this.root.querySelectorAll(".tab");

        tabs.forEach((tab) => {
            const tabsLink = tab.querySelectorAll("[data-tab-target]");
            const tabLink = tab.querySelector("[data-tab-target].active");
            if (tabLink) {
                const idTab = tabLink.getAttribute("data-tab-target");
                if (idTab) {
                    const content = this.content[idTab];
                    content.style.display = "";
                }
            }
            tabsLink.forEach((tabLink) => {
                tabLink.addEventListener("click", () => {
                    const currentTab = tab.querySelector("[data-tab-target].active");
                    if (currentTab) {
                        const idCurrentTab = currentTab.getAttribute("data-tab-target");
                        if (idCurrentTab) {
                            const content = this.content[idCurrentTab];
                            content.style.display = "none";
                        }
                        currentTab.classList.remove("active");
                    }

                    tabLink.classList.add("active");
                    const nextIdTab = tabLink.getAttribute("data-tab-target");
                    if (nextIdTab) {
                        const content = this.content[nextIdTab];
                        content.style.display = "";
                    }
                });
            });
        });
    }
}
