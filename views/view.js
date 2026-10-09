import HTML from "./htmlLoader.js";
import Display from "../utilities/display.js";

export default class View {
    htmlPath;
    html;
    viewContainer;
    titleContainer;
    contentContainer;

    constructor(htmlPath) {
        this.htmlPath = htmlPath;
    }

    async init() {
        await HTML.get(this.htmlPath || 'views/default.html').then(result =>
            this.html = result,
        ).finally(() => this.setElements());
    }

    setElements() {
        this.viewContainer = document.querySelector('.view-container');
        this.titleContainer = this.html.querySelector('.viewTitle');
        this.contentContainer = this.html.querySelector('.viewContent');
    }

    show() {
        this.resize();
        HTML.inject(this.viewContainer, this.html);
    }

    close() {
    }

    update() {
    }

    resize() {
        Display.setSize();
        this.html.style.height = Display.height + 'px';
        this.html.style.width = Display.width + 'px';

        this.titleContainer.style.height = (Display.height * 0.08) + 'px';
        this.titleContainer.style.fontSize = (10 * Display.scale) + 'px';

        this.contentContainer.style.height = (Display.height * 0.92) + 'px';
        this.contentContainer.style.fontSize = (10 * Display.scale) + 'px';
    }
}