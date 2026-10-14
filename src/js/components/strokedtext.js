import { Utils } from "../utils.js";

customElements.define("stroked-text", class extends HTMLElement {
    static observedAttributes = ["text"];

    connectedCallback() {
        if (this.initialised) {
            return;
        }
        this.initialised = true;

        this.textWidth = Number(this.getAttribute("width"));
        this.textHeight = Number(this.getAttribute("height"));
        this.fontSize = Number(this.getAttribute("font-size"));

        const shadow = this.attachShadow({ mode: "closed" });

        const style = document.createElement("style");
        style.textContent = ":host { display: inline-block; }";
        shadow.appendChild(style);

        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", this.textWidth);
        this.svg.setAttribute("height", this.textHeight);

        this.textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.textElement.setAttribute("x", this.textWidth / 2);
        this.textElement.setAttribute("y", this.fontSize);
        this.textElement.setAttribute("text-anchor", "middle");
        this.textElement.setAttribute("font-family", "TankTrouble");
        this.textElement.setAttribute("font-weight", "normal");
        this.textElement.setAttribute("font-size", this.fontSize);
        this.textElement.setAttribute("fill", "white");
        this.textElement.setAttribute("stroke", "black");
        this.textElement.setAttribute("stroke-linejoin", "round");
        this.textElement.setAttribute("stroke-width", Number(this.getAttribute("stroke-width")));
        this.textElement.setAttribute("paint-order", "stroke");

        this.svg.appendChild(this.textElement);
        shadow.appendChild(this.svg);

        this._render();
    }

    attributeChangedCallback() {
        if (this.initialised) {
            this._render();
        }
    }

    _render() {
        const text = this.getAttribute("text") || "";
        this.textElement.textContent = text;

        const textLength = Utils.measureSVGText(text, { fontFamily: "TankTrouble", fontWeight: "normal", fontSize: this.fontSize });

        // Plus four to account for stroke width.
        this.textElement.setAttribute("transform", Utils.getSVGScaleAndTranslateToFit(this.textWidth, textLength + 4, this.fontSize + 5));
    }
});
