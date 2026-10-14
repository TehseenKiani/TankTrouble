import "prism-code-editor/prism/languages/markup";
import "prism-code-editor/prism/languages/css-extras";
import "prism-code-editor/prism/languages/javascript";
import "prism-code-editor/languages/html";
import "prism-code-editor/languages/css";
import "prism-code-editor/languages/clike";
import { defaultCommands, editHistory } from "prism-code-editor/commands";
import { highlightSelectionMatches, searchWidget, showInvisibles } from "prism-code-editor/search";
import { createEditor } from "prism-code-editor";
import { cursorPosition } from "prism-code-editor/cursor";
import { highlightBracketPairs } from "prism-code-editor/highlight-brackets";
import { matchBrackets } from "prism-code-editor/match-brackets";
import { matchTags } from "prism-code-editor/match-tags";

export class CodeEditor {
    constructor(textarea, language) {
        this.host = document.createElement("div");
        this.host.className = "codeEditor";
        textarea.insertAdjacentElement("afterend", this.host);
        textarea.style.display = "none";

        this.editor = createEditor(
            this.host,
            {
                language,
                lineNumbers: true,
                wordWrap: true,
                tabSize: 4,
                insertSpaces: false,
                value: textarea.value
            },
            defaultCommands(),
            editHistory(),
            cursorPosition(),
            matchBrackets(),
            highlightBracketPairs(),
            matchTags(),
            highlightSelectionMatches(),
            searchWidget(),
            showInvisibles()
        );

        this.placeholderElement = document.createElement("div");
        this.placeholderElement.className = "codeEditorPlaceholder";
        this.placeholderElement.textContent = textarea.placeholder;
        this.placeholderElement.hidden = textarea.value !== "";
        this.editor.container.append(this.placeholderElement);
        this.editor.on("update", value => {
            this.placeholderElement.hidden = value !== "";
        });
    }

    onChange(callback) {
        this.editor.on("update", () => {
            try {
                callback();
            } catch (error) {
                console.error(error);
            }
        });
    }

    getValue() {
        return this.editor.value;
    }

    setValue(value) {
        this.editor.setOptions({ value });
    }
}
