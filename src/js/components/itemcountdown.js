import { Utils } from "../utils.js";

customElements.define("item-countdown", class extends HTMLElement {
    connectedCallback() {
        if (this.initialised) {
            return;
        }
        this.initialised = true;

        this.startTime = Number(this.getAttribute("start"));
        this.endTime = Number(this.getAttribute("end"));
        this.details = this.getAttribute("variant") === "details";
        this.countdownElement = $(this).find(".countdown");
        this.countdownToStartElement = $(this).find(".countdown.toStart");
        this.countdownToEndElement = $(this).find(".countdown.toEnd, .unavailable");
        this.buttons = $(this).closest(this.details ? ".shopItemDetails" : ".shopItem").find("button");

        this._update();
    }

    disconnectedCallback() {
        clearTimeout(this.timeout);
        this.initialised = false;
    }

    _update() {
        const now = new Date();
        const started = this.startTime - now < 1000;
        const ended = started && this.endTime - now < 1000;

        if (this.details) {
            this._updateDetails(now, started, ended);
        } else {
            this._updateItem(now, started, ended);
        }

        if ((!started || !ended) && this.isConnected) {
            this.timeout = setTimeout(() => {
                this._update();
            }, 1000);
        }
    }

    _updateDetails(now, started, ended) {
        if (!started) {
            this.countdownElement.text(`Get ready! Available in ${Utils.timeDiffToString(now, this.startTime)}`);
        } else if (!ended) {
            this.countdownElement.text(`Hurry up! Only available for ${Utils.timeDiffToString(now, this.endTime)}`);
            this.buttons.prop("disabled", false);
        } else {
            this.countdownElement.text("You missed it");
            this.buttons.prop("disabled", true);
        }
    }

    _updateItem(now, started, ended) {
        if (!started) {
            this.countdownToEndElement.hide();
            this.countdownToStartElement.find("text tspan:not(:first-child)").text(Utils.timeDiffToString(now, this.startTime));
        } else if (!ended) {
            this.countdownToStartElement.hide();
            this.countdownToEndElement.show();
            this.countdownToEndElement.find("text tspan:first-child").text(Utils.timeDiffToString(now, this.endTime));
            this.buttons.prop("disabled", false);
        } else {
            this.countdownToStartElement.hide();
            this.countdownToEndElement.show();
            this.countdownToEndElement.removeClass().addClass("unavailable");
            const endTextElement = this.countdownToEndElement.find("text tspan:first-child");
            endTextElement.text("MISSED IT!");
            endTextElement.attr("y", 0);
            endTextElement.siblings().hide();
            this.buttons.prop("disabled", true);
        }
    }
});
