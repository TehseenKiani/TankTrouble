import { TankTrouble } from "../tanktrouble.js";
import { AdminOverlayNavigation } from "../adminoverlaynavigation.js";
import { AdminOverlayUploadImage } from "../adminoverlayuploadimage.js";
import { Backend } from "../backend.js";
import { ButtonGroup } from "../buttongroup.js";
import { CodeEditor } from "../codeeditor.js";
import { Commands } from "../commands.js";
import { News } from "../news.js";
import { OverlayManager } from "../overlaymanager.js";
import { Utils } from "../utils.js";

TankTrouble.AdminNewsOverlay = {

    init() {
        Commands.register("--admin-news.edit", (button, data) => {
            OverlayManager.pushOverlay(TankTrouble.AdminNewsOverlay, { adminId: button.attr("data-admin-id"), newsPostId: data.newsPostId });
        });
    },

    // jQuery objects
    wrapper: null,
    select: null,
    navigation: null,
    preview: null,
    teaserContainer: null,
    newsPostContainer: null,
    form: null,
    time: null,
    expiration: null,
    teaser: null,
    title: null,
    content: null,
    type: null,
    styles: null,
    script: null,
    teaserScript: null,
    submit: null,
    cancel: null,
    new: null,
    delete: null,
    upload: null,

    // Code Mirror elements
    teaserCm: null,
    contentCm: null,
    stylesCm: null,
    scriptCm: null,
    teaserScriptCm: null,

    // State
    initialised: false,
    adminId: null,
    newsPost: null,

    _initialise() {
        this.wrapper = $("<div class='admin news'></div>");

        this.navigation = new AdminOverlayNavigation();

        this.select = new ButtonGroup(["News post", "Teaser", "Images"], this._selectFocus, this);

        this.preview = $("<div class='preview'></div>");
        this.teaserContainer = $("<div></div>");
        this.newsPostContainer = $("<div></div>");
        this.preview.append(this.teaserContainer, this.newsPostContainer, "<div></div>");

        this.form = $("<form class='newsPost'></form>");
        this.time = $("<input name='time' type='datetime-local'/>");
        this.expiration = $("<input name='expiration' type='datetime-local'/>");
        this.teaser = $("<textarea name='teaser' placeholder='HTML\nIf left empty no teaser is published'></textarea>");
        this.title = $("<input name='title' type='text' placeholder='HTML'/>");
        this.content = $("<textarea name='content' placeholder='HTML'></textarea>");
        this.type = $("<select name='type'></select>");
        this.type.append("<option value='standard'>Standard</option>");
        this.type.append("<option value='important'>Important</option>");
        this.type.append("<option value='kickstarter'>Kickstarter</option>");
        this.type.append("<option value='halloween'>Halloween</option>");
        this.styles = $("<textarea name='styles' placeholder='CSS'></textarea>");
        this.script = $("<textarea name='script' placeholder='JavaScript\nErrors are logged to console'></textarea>");
        this.teaserScript = $("<textarea name='teaserScript' placeholder='JavaScript\nErrors are logged to console'></textarea>");
        this.submit = $("<button class='small' type='submit'>Submit</button>");
        this.cancel = $("<button class='small' type='button'>Cancel</button>");
        this.new = $("<button class='small' type='button'>Create new</button>");
        this.delete = $("<button class='small warning' type='button'>Delete</button>");
        this.upload = new AdminOverlayUploadImage();

        this.form.append(
            $("<div class='table1'></div>").append(
                $("<div></div>").append(
                    $("<div></div>"),
                    $("<div><div class='label'>Title</div></div>").append(this.title),
                    $("<div></div>")
                )
            )
        );

        this.form.append(
            $("<div class='textareas'></div>").append(
                $("<div class='newsPostField'><div class='label'>Script</div></div>").append(this.script),
                $("<div class='newsPostField'><div class='label'>Content</div></div>").append(this.content),
                $("<div class='teaserField'><div class='label'>Script</div></div>").append(this.teaserScript),
                $("<div class='teaserField'><div class='label'>Content</div></div>").append(this.teaser),
                $("<div><div class='label'>Styles</div></div>").append(this.styles)
            )
        );

        this.form.append($("<div class='label small'>Use %ID% to reference id. In selectors: #newsPost-%ID%, #teaser-%ID%. In intervals and timeouts: newsPost_interval_n_%ID%, newsPost_timeout_n_%ID%, teaser_interval_n_%ID%, teaser_timeout_n_%ID%, where n starts from 0</div>"));

        this.form.append(
            $("<div class='timesAndType'></div>").append(
                $("<div><div class='label'>Publish</div></div>").append(this.time),
                $("<div><div class='label'>Expire</div></div>").append(this.expiration),
                $("<div><div class='label'>Type</div></div>").append(this.type)
            )
        );

        this.form.append(
            $("<div>").append(
                this.submit,
                this.cancel,
                this.new,
                this.delete
            )
        );

        this.wrapper.append(this.navigation.element);
        this.wrapper.append(this.select.element);
        this.wrapper.append(this.preview);
        this.wrapper.append(this.form);
        this.wrapper.append(this.upload.element);

        this.teaserCm = new CodeEditor(this.teaser[0], "html");

        this.contentCm = new CodeEditor(this.content[0], "html");

        this.stylesCm = new CodeEditor(this.styles[0], "css");

        this.scriptCm = new CodeEditor(this.script[0], "javascript");

        this.teaserScriptCm = new CodeEditor(this.teaserScript[0], "javascript");

        this.time.on("change", event => {
            const { value } = event.currentTarget;
            $("#newsPost-preview .time").html(value !== "" ? Utils.dateToDateValue(new Date(`${value}Z`)) : "");
        });

        this.teaserCm.onChange(() => {
            if (this.newsPost === null) {
                return;
            }

            const script = this.teaserScriptCm.getValue().replaceAll("%ID%", "preview");

            // Set content.
            this._updateTeaserVisibility();
            $("#teaser-preview .content").html(this.teaserCm.getValue().replaceAll("%ID%", this.newsPost.id ? this.newsPost.id : "[ID]"));

            // Remove all existing intervals and timeouts.
            this._removeTimers("teaser");

            // Evaluate script.
            // A partially typed script is a syntax error, which the closure's own try does not catch.
            try {
                window.eval(Utils.createClosure(script));
            } catch (error) {
                console.log(error);
            }
        });

        this.title.on("input", event => {
            $("#newsPost-preview .title").html($(event.currentTarget).val().replaceAll("%ID%", this.newsPost.id ? this.newsPost.id : "[ID]"));
        });

        this.contentCm.onChange(() => {
            if (this.newsPost === null) {
                return;
            }

            const script = this.scriptCm.getValue().replaceAll("%ID%", "preview");

            // Set content.
            $("#newsPost-preview .content").html(this.contentCm.getValue().replaceAll("%ID%", this.newsPost.id ? this.newsPost.id : "[ID]"));

            // Remove all existing intervals and timeouts.
            this._removeTimers("newsPost");

            // Evaluate script.
            // A partially typed script is a syntax error, which the closure's own try does not catch.
            try {
                window.eval(Utils.createClosure(script));
            } catch (error) {
                console.log(error);
            }
        });

        this.type.on("change", event => {
            $("#teaser-preview").removeClass().addClass(`snippet teaser ${$(event.currentTarget).val()}`);
            $("#newsPost-preview.newsPost").removeClass().addClass(`newsPost ${$(event.currentTarget).val()}`);
        });

        this.stylesCm.onChange(() => {
            if (this.newsPost === null) {
                return;
            }

            const css = this.stylesCm.getValue().replaceAll("%ID%", "preview");

            $("#newsPost-preview > style").html(css);
        });

        this.scriptCm.onChange(() => {
            if (this.newsPost === null) {
                return;
            }

            const script = this.scriptCm.getValue().replaceAll("%ID%", "preview");

            // Set script.
            $("#newsPost-preview > script").text(script);

            // Reset title and content.
            $("#newsPost-preview .title").html(this.title.val().replaceAll("%ID%", this.newsPost.id ? this.newsPost.id : "[ID]"));
            $("#newsPost-preview .content").html(this.contentCm.getValue().replaceAll("%ID%", this.newsPost.id ? this.newsPost.id : "[ID]"));

            // Remove all existing intervals and timeouts.
            this._removeTimers("newsPost");

            // Evaluate script.
            // A partially typed script is a syntax error, which the closure's own try does not catch.
            try {
                window.eval(Utils.createClosure(script));
            } catch (error) {
                console.log(error);
            }
        });

        this.teaserScriptCm.onChange(() => {
            if (this.newsPost === null) {
                return;
            }

            const script = this.teaserScriptCm.getValue().replaceAll("%ID%", "preview");

            $("#teaser-preview > script").text(script);

            // Reset content.
            $("#teaser-preview .content").html(this.teaserCm.getValue().replaceAll("%ID%", this.newsPost.id ? this.newsPost.id : "[ID]"));

            // Remove all existing intervals and timeouts.
            this._removeTimers("teaser");

            // A partially typed script is a syntax error, which the closure's own try does not catch.
            try {
                window.eval(Utils.createClosure(script));
            } catch (error) {
                console.log(error);
            }
        });

        this.initialised = true;
    },

    _hasChanged() {
        if (this.newsPost) {
            let result = false;
            result ||= this.newsPost.time !== Utils.dateTimeValueToEpoch(this.time.val());
            result ||= this.newsPost.expiration !== Utils.dateTimeValueToEpoch(this.expiration.val());
            result ||= this.newsPost.teaser !== (this.teaserCm.getValue() !== "" ? this.teaserCm.getValue() : null);
            result ||= this.newsPost.title !== this.title.val();
            result ||= this.newsPost.content !== this.contentCm.getValue();
            result ||= this.newsPost.type !== this.type.val();
            result ||= this.newsPost.styles !== this.stylesCm.getValue();
            result ||= this.newsPost.script !== this.scriptCm.getValue();
            result ||= this.newsPost.teaserScript !== this.teaserScriptCm.getValue();
            return result;
        } else {
            return false;
        }
    },

    _selectFocus(value) {
        if (value === 0) {
            this.preview.show();
            this.form.show();
            this.upload.element.hide();
            this.form.find(".newsPostField").show();
            this.form.find(".teaserField").hide();
        } else if (value === 1) {
            this.preview.show();
            this.form.show();
            this.upload.element.hide();
            this.form.find(".newsPostField").hide();
            this.form.find(".teaserField").show();
        } else if (value === 2) {
            this.preview.hide();
            this.form.hide();
            this.upload.element.show();
        }
    },

    _removeTimers(prefix) {
        let i = 0;
        while (window[`${prefix}_interval_${i}_preview`] !== undefined) {
            clearInterval(window[`${prefix}_interval_${i}_preview`]);
            delete window[`${prefix}_interval_${i}_preview`];
            ++i;
        }
        i = 0;
        while (window[`${prefix}_timeout_${i}_preview`] !== undefined) {
            clearTimeout(window[`${prefix}_timeout_${i}_preview`]);
            delete window[`${prefix}_timeout_${i}_preview`];
            ++i;
        }
    },

    _updateTeaserVisibility() {
        if (this.teaserCm.getValue() === "") {
            $("#teaser-preview").hide();
        } else {
            $("#teaser-preview").show();
        }
    },

    /**
     * Show overlay.
     * Expects string params.adminId
     * @param {Object} params
     */
    show(params) {
        if (!this.initialised) {
            this._initialise();
        }

        this.adminId = params.adminId;
        this.newsPost = null;

        this.navigation.update(this.adminId);

        this.select.setSelection(0);
        this.upload.reset();

        this.preview.hide();
        this.form.hide();

        // Reset form
        this.time.val("");
        this.expiration.val("");
        this.teaserCm.setValue("");
        this.title.val("");
        this.contentCm.setValue("");
        this.type.val("standard");
        this.stylesCm.setValue("");
        this.scriptCm.setValue("");
        this.teaserScriptCm.setValue("");

        this._updateTeaserVisibility();

        // If we have a news post id let's load that news post and setup UI to edit the news post
        if (params.newsPostId) {
            Backend.getNewsPostById(params.newsPostId)
                .then(result => {
                    if (typeof result === "object") {
                        this.newsPost = result;

                        this.preview.show();
                        this.form.show();

                        // Prepare teaser preview
                        const teaserPreview = $(this.newsPost.html.teaser);
                        teaserPreview.attr("id", "teaser-preview");
                        teaserPreview.find("script").text(Utils.createClosure(this.newsPost.teaserScript.replaceAll("%ID%", "preview")));
                        this.teaserContainer.html(teaserPreview);

                        // Prepare news post preview
                        const newsPostPreview = $(this.newsPost.html.newsPost);
                        newsPostPreview.attr("id", "newsPost-preview");
                        newsPostPreview.find(".action, .unpublishedInfo").remove();
                        newsPostPreview.find("style").html(this.newsPost.styles.replaceAll("%ID%", "preview"));
                        newsPostPreview.find("script").text(Utils.createClosure(this.newsPost.script.replaceAll("%ID%", "preview")));
                        this.newsPostContainer.html(newsPostPreview);

                        // Set input accordingly
                        this.time.val(Utils.epochToDateTimeValue(this.newsPost.time));
                        if (this.newsPost.expiration !== null) {
                            this.expiration.val(Utils.epochToDateTimeValue(this.newsPost.expiration));
                        }
                        this.teaserCm.setValue(this.newsPost.teaser !== null ? this.newsPost.teaser : "");
                        this.title.val(this.newsPost.title);
                        this.contentCm.setValue(this.newsPost.content);
                        this.type.val(this.newsPost.type);
                        this.stylesCm.setValue(this.newsPost.styles);
                        this.scriptCm.setValue(this.newsPost.script);
                        this.teaserScriptCm.setValue(this.newsPost.teaserScript);

                        this._updateTeaserVisibility();
                    }
                });

            // Setup form submit
            this.submit.html("Save changes");
            this.form.off("submit").on("submit", () => {
                Backend.editNewsPost(
                    params.newsPostId,
                    Utils.dateTimeValueToEpoch(this.time.val()),
                    Utils.dateTimeValueToEpoch(this.expiration.val()),
                    this.teaserCm.getValue() !== "" ? this.teaserCm.getValue() : null,
                    this.title.val(),
                    this.contentCm.getValue(),
                    this.type.val(),
                    this.stylesCm.getValue(),
                    this.scriptCm.getValue(),
                    this.teaserScriptCm.getValue()
                )
                    .then(result => {
                        if (typeof result === "string") {
                            alert(result);
                        } else {
                            this.newsPost = null;
                            OverlayManager.popOverlay(false, false);
                            News.load();
                        }
                    });
                return false;
            });

            // Setup cancel button
            this.cancel.show().off("click").on("click", event => {
                OverlayManager.popOverlay(true, false);
            });

            // Setup new button
            this.new.show().off("click").on("click", event => {
                OverlayManager.replaceOverlay(
                    TankTrouble.AdminNewsOverlay,
                    { adminId: params.adminId }
                );
            });

            // Setup delete button
            this.delete.show().off("click").on("click", event => {
                if (confirm("WARNING!\nYou are about to delete this news post.\nThis cannot be undone!")) {
                    Backend.deleteNewsPost(params.newsPostId)
                        .then(result => {
                            if (typeof result === "string") {
                                alert(result);
                            } else {
                                this.newsPost = null;
                                OverlayManager.popOverlay(false, false);
                                News.load();
                            }
                        });
                }
            });

        // If we don't have a news post id we load a news post placeholder and setup UI to create a new news post
        } else {
            Backend.getNewsPostPlaceholder()
                .then(result => {
                    if (typeof result === "object") {
                        this.newsPost = result;

                        this.preview.show();
                        this.form.show();

                        // Prepare teaser and news post for preview
                        const teaserPreview = $(this.newsPost.html.teaser);
                        teaserPreview.attr("id", "teaser-preview");
                        teaserPreview.find("script").empty();
                        this.teaserContainer.html(teaserPreview);

                        // Prepare teaser and news post for preview
                        const newsPostPreview = $(this.newsPost.html.newsPost);
                        newsPostPreview.attr("id", "newsPost-preview");
                        newsPostPreview.find("script").empty();
                        this.newsPostContainer.html(newsPostPreview);

                        // Set input accordingly
                        this.teaserCm.setValue(this.newsPost.teaser !== null ? this.newsPost.teaser : "");

                        this._updateTeaserVisibility();
                    }
                });

            // Setup form submit
            this.submit.html("Post news");
            this.form.off("submit").on("submit", () => {
                Backend.createNewsPost(
                    Utils.dateTimeValueToEpoch(this.time.val()),
                    Utils.dateTimeValueToEpoch(this.expiration.val()),
                    this.teaserCm.getValue() !== "" ? this.teaserCm.getValue() : null,
                    this.title.val(),
                    this.contentCm.getValue(),
                    this.type.val(),
                    this.stylesCm.getValue(),
                    this.scriptCm.getValue(),
                    this.teaserScriptCm.getValue()
                )
                    .then(result => {
                        if (typeof result === "string") {
                            alert(result);
                        } else {
                            this.newsPost = null;
                            OverlayManager.popOverlay(false, false);
                            News.load();
                        }
                    });
                return false;
            });

            this.new.hide();
            this.cancel.hide();
            this.delete.hide();
        }
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        // Remove all existing intervals and timeouts.
        this._removeTimers("newsPost");
        this._removeTimers("teaser");
    },

    getContents() {
        if (!this.initialised) {
            this._initialise();
        }

        return this.wrapper;
    },

    shouldHide() {
        return !this._hasChanged() || confirm("WARNING!\nChanges will be lost.");
    },

    canBeCancelled() {
        return true;
    }
};
