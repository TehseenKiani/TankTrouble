import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { Images } from "./images.js";
import { UIConstants } from "./tt/ui/uiconstants.js";
import { Users } from "./users.js";

export class Utils {
    static svgMeasurementContainer = null;
    static svgMeasurementHelper = null;

    /**
     * Wraps a JavaScript string with a closure.
     * The string is also wrapped in a try-catch statement.
     *
     * @param {string} jsString
     */
    static createClosure(jsString) {
        return `(function() { try { ${jsString} } catch(error) { console.log(error); } })();`;
    }

    static hexToRGB(hex) {
        const hexValue = parseInt(hex, 16);
        const r = (hexValue >> 16) & 255;
        const g = (hexValue >> 8) & 255;
        const b = hexValue & 255;

        return { r, g, b };
    }

    static dateToDateValue(date) {
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${date.getFullYear()}-${month}-${day}`;
    }

    static epochToDateTimeValue(epochSeconds) {
        return new Date(epochSeconds * 1000).toISOString().slice(0, 16);
    }

    static dateTimeValueToEpoch(value) {
        return value !== "" ? Math.floor(new Date(`${value}Z`).getTime() / 1000) : null;
    }

    static restrictInput(input, allowedSpecialChars, maxLength) {
        input.attr("maxlength", maxLength);
        Utils._sanitiseInputOn(input, char => /[a-zA-Z0-9]/.test(char) || allowedSpecialChars.includes(char));
    }

    static restrictInputToDigits(input) {
        Utils._sanitiseInputOn(input, char => /[0-9]/.test(char));
    }

    static _sanitiseInputOn(input, isCharAllowed) {
        input.off("input.restrict").on("input.restrict", event => {
            const element = event.currentTarget;
            const characters = [...element.value];
            const sanitised = characters.filter(isCharAllowed).join("");
            if (sanitised !== element.value) {
                const caretPosition = characters.slice(0, element.selectionStart).filter(isCharAllowed).length;
                element.value = sanitised;
                element.setSelectionRange(caretPosition, caretPosition);
            }
        });
    }

    static utf8ToBase64(string) {
        const bytes = new TextEncoder().encode(string);
        let binary = "";
        for (let i = 0; i < bytes.length; ++i) {
            binary += String.fromCodePoint(bytes[i]);
        }
        return btoa(binary);
    }

    static measureSVGText(text, settings) {
        if (Utils.svgMeasurementContainer === null) {
            Utils.svgMeasurementContainer = $("<div></div>");
            $("body").append(Utils.svgMeasurementContainer);

            Utils.svgMeasurementContainer.svg({ settings: { width: 0, height: 0, overflow: "hidden" } });
            Utils.svgMeasurementHelper = Utils.svgMeasurementContainer.svg("get");
        }

        Utils.svgMeasurementContainer.show();

        Utils.svgMeasurementHelper.clear();
        const result = Utils.svgMeasurementHelper.text(0, 100, text, settings).getComputedTextLength();

        Utils.svgMeasurementContainer.hide();

        return result;
    }

    static getSVGScaleAndTranslateToFit(containerWidth, textWidth, textHeight, horizontalAlignment) {
        if (horizontalAlignment === undefined) { horizontalAlignment = "centre"; }

        let result = "";

        const scale = Math.min(1.0, containerWidth / textWidth);

        result += `scale(${scale})`;
        switch (horizontalAlignment) {
            case "centre":
            {
                result += ` translate(${Math.round(((containerWidth / scale) - containerWidth) * 0.5)}, ${Math.round(((textHeight / scale) - textHeight) * 0.5)})`;
                break;
            }
            case "left":
            {
                result += ` translate(0, ${Math.round(((textHeight / scale) - textHeight) * 0.5)})`;
                break;
            }
            case "right":
            {
                result += ` translate(${Math.round((containerWidth / scale) - containerWidth)}, ${Math.round(((textHeight / scale) - textHeight) * 0.5)})`;
                break;
            }
        }

        return result;
    }

    static createFixedWidthButton(label, sizeAndTypeClasses, width) {
        const button = $(`<button class='${sizeAndTypeClasses}' type='button' tabindex='-1' title=''></button>`);
        button.text(label);
        button.css("min-width", width);

        // FIXME Does not currently work.
        /*        // Temporarily append to body to enable styling.
        $("body").append(button);

        var fontSize = parseFloat(button.css("font-size"));

        while(button.width() > width) {
            fontSize -= 0.2;
            button.css("font-size", fontSize)
        }

        // Detach again.
        button.detach();*/

        return button;
    }

    /**
     * Create an jquery object with span elements with player names
     * @param {string[]} playerIds
     * @param {Function} callback
     */
    static createPlayerNames(playerIds, callback) {
        const names = $("<span></span>");
        let count = 0;

        const detailsPromises = playerIds.map((playerId, index) => {
            const span = $("<span class='username'></span>");
            names.append(span);

            if (index === playerIds.length - 2) {
                names.append(" and ");
            } else if (index < playerIds.length - 2) {
                names.append(", ");
            }

            return Backend.getPlayerDetails(playerId, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        span.text(result.getUsername());
                        count++;
                    }
                })
                .catch(() => {});
        });

        // When we have all responses, hand over the names if all players were found.
        Promise.all(detailsPromises).then(() => {
            if (count === playerIds.length) {
                callback(names);
            }
        });
    }

    static addOverlayFormRow(form, content) {
        const rowDiv = $("<div class='row'></div>");
        const rowContentDiv = $("<div class='rowContent'></div>");
        rowContentDiv.append(content);
        rowDiv.append(rowContentDiv);
        form.append(rowDiv);

        return rowContentDiv;
    }

    static addSuffix(container, suffix, willCollapse) {
        const suffixDiv = $(`<div class='suffix${willCollapse ? " collapse" : ""}'></div>`);
        suffixDiv.append(suffix);
        container.append(suffixDiv);

        return container;
    }

    static addPrefix(container, prefix, willCollapse) {
        const prefixDiv = $(`<div class='prefix${willCollapse ? " collapse" : ""}'></div>`);
        prefixDiv.append(prefix);
        container.prepend(prefixDiv);

        return container;
    }

    static addImageWithClasses(container, classes, path, alt) {
        const image = $(`<img class='${classes}' ${Images.attributes(path, alt)}/>`);

        container.append(image);

        return container;
    }

    static initTooltips() {
        $.tooltipster._env.hasTouchCapability = false;

        $.tooltipster.setDefaults({
            distance: 17,
            delay: [200, 0],
            zIndex: 10000,
            updateAnimation: "pulse",
            repositionOnScroll: true,
            trackerInterval: 200,
            selfDestruction: false,
            debug: false,
            trigger: "custom",
            triggerOpen: { mouseenter: true },
            triggerClose: { mouseleave: true },
            functionInit: instance => {
                // Never shrink to fit
                instance.on("positionTest", event => {
                    if (event.mode === "constrained") {
                        event.takeTest(false);
                    }
                });
                // Force layout so the tooltipster fades in
                instance.on("ready", () => {
                    instance.elementTooltip().getBoundingClientRect();
                });
            }
        });
    }

    static updateTooltip(element, message) {
        if (message === "") {
            element.tooltipster("disable");
        } else {
            if (element.tooltipster("content") !== message) {
                element.tooltipster("content", message);
            }
            element.tooltipster("enable");
            element.tooltipster("open");
        }
    }

    static addAutomaticTextAreaResize(elements) {
        elements.attr("style", "overflow-y: hidden;")
            .on("input.resize", event => {
            // Ignore resize if scrollHeight is zero.
            // scrollHeight will be zero the second time input
            // is triggered while the textarea is hidden.
                if (event.currentTarget.scrollHeight > 0) {
                    event.currentTarget.style.height = "auto";
                    const borderHeight = $(event.currentTarget).outerHeight() - $(event.currentTarget).innerHeight();
                    event.currentTarget.style.height = `${event.currentTarget.scrollHeight + borderHeight}px`;
                }
            });
    }

    static removeAutomaticTextAreaResize(elements) {
        elements.removeAttr("style");
        elements.off("input.resize");
    }

    static arrayToNaturalString(input) {
        let result = "";

        for (let i = 0; i < input.length; ++i) {
            result += input[i];
            if (i === input.length - 2) {
                result += " and ";
            } else if (i < input.length - 2) {
                result += ", ";
            }
        }

        return result;
    }

    static timeDiffToString(now, then) {
        if (now > then) {
            return "no time";
        } else {
            const diff = then - now;
            if (diff > 2 * 604800000) { // 2 weeks in ms
                const weeks = Math.floor(diff / 604800000);
                return `${weeks} weeks`;
            }
            if (diff > 2 * 86400000) { // 2 days in ms
                const days = Math.floor(diff / 86400000);
                return `${days} days`;
            }
            if (diff > 2 * 3600000) { // 2 hours in ms
                const hours = Math.floor(diff / 3600000);
                return `${hours} hours`;
            }
            if (diff > 2 * 60000) { // 2 minutes in ms
                const minutes = Math.floor(diff / 60000);
                return `${minutes} minutes`;
            }

            const seconds = Math.floor(diff / 1000);
            return `${seconds} second${seconds !== 1 ? "s" : ""}`;
        }
    }

    static placeBoxBestLocation(element, x, y, preferredDirections, preferredRadiusHorizontal, preferredRadiusVertical, tabSize, verticalTabPosition, margins, collision) {
        if (margins === undefined) {
            margins = [0, 0, 0, 0];
        }

        let foundPlacement = false;
        let bestFit = "";
        let highestRatioVisible = 0.0;

        for (let i = 0; i < preferredDirections.length; ++i) {
            Utils.placeBox(element, x, y, preferredDirections[i], preferredRadiusHorizontal, preferredRadiusVertical, 30, 35, collision);

            // Check if element fits in viewport
            if (Utils.containedInViewport(element, margins)) {
                foundPlacement = true;
                break;
            } else {
                const ratioVisible = Utils.computeVisibleRatio(element, margins);

                if (ratioVisible > highestRatioVisible) {
                    bestFit = preferredDirections[i];
                    highestRatioVisible = ratioVisible;
                }
            }
        }

        // If not placed, place at best fit.
        if (!foundPlacement) {
            Utils.placeBox(element, x, y, bestFit, preferredRadiusHorizontal, preferredRadiusVertical, 30, 35, collision);
        }
    }

    static placeBox(element, x, y, direction, preferredRadiusHorizontal, preferredRadiusVertical, tabSize, verticalTabPosition, collision) {
        if (collision === undefined) {
            collision = "none";
        }

        element.removeClass("left right top bottom");
        switch (direction) {
            case "right":
            {
                element.position({ my: "left top", at: `left+${x + preferredRadiusHorizontal + tabSize} top+${y - verticalTabPosition}`, of: $(document), collision });
                element.addClass("left");
                element.css({ transformOrigin: "-15% 35px" });
                break;
            }
            case "left":
            {
                element.position({ my: "right top", at: `left+${x - preferredRadiusHorizontal - tabSize} top+${y - verticalTabPosition}`, of: $(document), collision });
                element.addClass("right");
                element.css({ transformOrigin: "115% 35px" });
                break;
            }
            case "top":
            {
                element.position({ my: "center bottom", at: `left+${x} top+${y - preferredRadiusVertical - tabSize}`, of: $(document), collision });
                element.addClass("bottom");
                element.css({ transformOrigin: "50% 110%" });
                break;
            }
            case "bottom":
            {
                element.position({ my: "center top", at: `left+${x} top+${y + preferredRadiusVertical}`, of: $(document), collision });
                element.addClass("top");
                element.css({ transformOrigin: "50% -10%" });
                break;
            }
        }
    }

    static containedInViewport(element, margins) {
        const clientRect = element[0].getBoundingClientRect();
        if (clientRect.left - margins[3] < 0 || clientRect.top - margins[0] < 0) {
            return false;
        }

        const width = $(window).width();
        const height = $(window).height();
        if (clientRect.right + margins[1] > width || clientRect.bottom + margins[2] > height) {
            return false;
        }

        return true;
    }

    static computeVisibleRatio(element, margins) {
        const clientRect = element[0].getBoundingClientRect();
        const totalArea = (clientRect.width + margins[1] + margins[3]) * (clientRect.height + margins[0] + margins[2]);

        const width = $(window).width();
        const height = $(window).height();

        const left = Math.max(clientRect.left - margins[3], 0);
        const top = Math.max(clientRect.top - margins[0], 0);
        const right = Math.min(clientRect.right + margins[1], width);
        const bottom = Math.min(clientRect.bottom + margins[2], height);
        const visibleArea = (right - left) * (bottom - top);

        return visibleArea / totalArea;
    }

    static maskUnapprovedUsername(playerDetails) {
        if (Users.isAnyUser(playerDetails.getPlayerId())) {
            return playerDetails.getUsername();
        } else if (Users.getHighestGmLevel() >= UIConstants.ADMIN_LEVEL_PLAYER_LOOKUP && playerDetails.getUsernameApproved() !== true) {
            return `× ${playerDetails.getUsername()} ×`;
        } else if (playerDetails.getUsernameApproved() !== true) {
            return "× × ×";
        } else {
            return playerDetails.getUsername();
        }
    }
}
