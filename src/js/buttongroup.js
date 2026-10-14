export class ButtonGroup {
    /**
     * Creates button group where only one button can be selected at a time.
     */
    constructor(labels, callback, callbackContext) {
        const buttonGroup = $("<div class='buttonGroup'></div>");

        $.each(labels, (index, label) => {
            const button = $(`<button class='medium' type='button' tabindex='-1'>${label}</button>`);

            button.on("click", event => {
                $(event.currentTarget).parent().siblings().removeClass("selected");
                $(event.currentTarget).parent().addClass("selected");
                callback.call(callbackContext, index);
            });

            const buttonWrapper = $("<div/>").append(button);
            if (index === 0) {
                buttonWrapper.addClass("selected");
            }

            buttonGroup.append(buttonWrapper);
        });

        this.element = buttonGroup;
        this.callback = callback;
        this.callbackContext = callbackContext;
    }

    setSelection(index) {
        this.element.children().removeClass("selected");
        this.element.children(`:nth-child(${index + 1})`).addClass("selected");
        this.callback.call(this.callbackContext, index);
    }

    getSelectionIndex() {
        const selectedButton = this.element.find(".selected");
        return selectedButton.index();
    }

    getSelectionLabel() {
        const selectedButton = this.element.find(".selected");
        return selectedButton.text();
    }

    disable() {
        this.element.find("button").prop("disabled", true);
    }

    disableIndex(index) {
        this.element.find(`:nth-child(${index + 1}) button`).prop("disabled", true);
    }

    enable() {
        this.element.find("button").prop("disabled", false);
    }

    enableIndex(index) {
        this.element.find(`:nth-child(${index + 1}) button`).prop("disabled", false);
    }
}
