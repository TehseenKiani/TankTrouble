import { Backend } from "./backend.js";
import { Commands } from "./commands.js";
import { Utils } from "./utils.js";

export class AdminOverlayUploadImage {
    /**
     * Creates admin image upload form
     */
    constructor() {
        const upload = $("<div></div>");
        const form = $("<form enctype='multipart/form-data' action='/uploadimage.php' method='post'></form>");

        const id = Date.now();

        const file1x = $(`<input class='hidden' name='file1x' id='file1x-${id}' type='file' accept='image/gif,image/jpeg,image/jpg,image/png'/>`);
        const file1xLabel = $(`<label for='file1x-${id}'>Select image @1x</label>`);
        const file1xPreview = $("<img class='uploadPreview' src='' height='30'/>");
        const file1xPlaceholder = $("<div class='uploadPlaceholder'/>");
        const file1xSize = $("<span class='label'></span>");
        const file2x = $(`<input class='hidden' name='file2x' id='file2x-${id}' type='file' accept='image/gif,image/jpeg,image/jpg,image/png'/>`);
        const file2xLabel = $(`<label for='file2x-${id}'>Select image @2x</label>`);
        const file2xPreview = $("<img class='uploadPreview' src='' height='30'/>");
        const file2xPlaceholder = $("<div class='uploadPlaceholder'/>");
        const file2xSize = $("<span class='label'></span>");
        const submit = $("<button class='small' type='submit'>Upload</button>");
        const status = $("<div class='label'>Upload new image</div>");

        const browser = $("<div class='imageBrowser'></div>");

        Utils.addOverlayFormRow(form, status);
        Utils.addOverlayFormRow(form, $("<div></div>").append(file1x, file1xLabel, file2x, file2xLabel, submit));
        Utils.addOverlayFormRow(form, $("<div></div>").append(file1xSize, file1xPreview, file1xPlaceholder, file2xPlaceholder, file2xPreview, file2xSize));

        upload.append(form);
        upload.append($("<div class='label'>Uploaded images</div>"));
        upload.append(browser);

        file1x.on("change", event => {
            const element = event.currentTarget;
            if (element.files.length === 1) {
                const reader = new FileReader();
                reader.addEventListener("load", () => {
                    file1xPreview.attr("src", reader.result);
                    file1xPreview.show();
                    file1xPlaceholder.hide();
                }, false);

                reader.readAsDataURL(element.files[0]);

                file1xPreview.off("load").on("load", () => {
                    file1xSize.text(`${file1xPreview[0].naturalWidth} x ${file1xPreview[0].naturalHeight}`);
                    file1xSize.show();
                });
            } else {
                file1xPreview.hide();
                file1xPlaceholder.show();
                file1xSize.hide();
            }
        });

        file2x.on("change", event => {
            const element = event.currentTarget;
            if (element.files.length === 1) {
                const reader = new FileReader();
                reader.addEventListener("load", () => {
                    file2xPreview.attr("src", reader.result);
                    file2xPreview.show();
                    file2xPlaceholder.hide();
                }, false);

                reader.readAsDataURL(element.files[0]);

                file2xPreview.off("load").on("load", () => {
                    file2xSize.text(`${file2xPreview[0].naturalWidth} x ${file2xPreview[0].naturalHeight}`);
                    file2xSize.show();
                });
            } else {
                file2xPreview.hide();
                file2xPlaceholder.show();
                file2xSize.hide();
            }
        });

        file1xPreview.hide();
        file1xSize.hide();
        file2xPreview.hide();
        file2xSize.hide();

        form.on("submit", event => {
            event.preventDefault();

            if (file1x.val() === "") {
                status.text("Select an @1x image");
                return;
            }
            if (file2x.val() === "") {
                status.text("Select an @2x image");
                return;
            }

            status.text("Uploading");
            submit.prop("disabled", true);

            fetch(form.attr("action"), { method: "POST", body: new FormData(form[0]) })
                .then(response => {
                    if (!response.ok) {
                        return Promise.reject();
                    }

                    return response.json();
                })
                .then(result => {
                    if (result.result) {
                        status.text("Images uploaded");
                        this.getUploadedImage(result.data);
                    } else {
                        status.text(result.message);
                    }
                })
                .catch(() => {
                    status.text("Internal server error");
                })
                .finally(() => {
                    submit.prop("disabled", false);
                });
        });

        this.element = upload;
        this.resetInputs = file1x.add(file2x);
        this.hideOnReset = file1xSize.add(file1xPreview).add(file2xSize).add(file2xPreview);
        this.showOnReset = file1xPlaceholder.add(file2xPlaceholder);
        this.status = status;
        this.submit = submit;
        this.browser = browser;

        this.loadUploadedImages();
    }

    reset() {
        this.resetInputs.val("");
        this.hideOnReset.hide();
        this.showOnReset.show();
        this.status.text("Upload new image");
        this.submit.prop("disabled", false);
    }

    loadUploadedImages() {
        const { browser } = this;
        browser.empty();
        Backend.getUploadedImages()
            .then(result => {
                if (typeof result === "object") {
                    result.forEach(image => {
                        browser.append($(image.html.image));
                    });
                }
            });
    }

    getUploadedImage(id) {
        const { browser } = this;
        Backend.getUploadedImage(id)
            .then(result => {
                if (typeof result === "object") {
                    browser.prepend(result.html.image);
                }
            });
    }

    static init() {
        Commands.register("--admin-news.delete-image", (button, data) => {
            AdminOverlayUploadImage.deleteUploadedImage(data.imageId);
        });
    }

    static deleteUploadedImage(id) {
        if (confirm("WARNING!\nYou are about to delete this image.\nThis cannot be undone!")) {
            Backend.deleteUploadedImage(id)
                .then(result => {
                    if (typeof result === "number") {
                        // Remove image
                        $(`#uploadedImage-${result}`).remove();
                    }
                });
        }
    }
}
