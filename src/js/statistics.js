import { TankTrouble } from "./tanktrouble.js";
import { Backend } from "./backend.js";

TankTrouble.Statistics = {
    init() {
        this._updateStatistics();

        setInterval(() => {
            this._updateStatistics();
        }, 30000);
    },

    _updateStatistics() {
        Backend.getStatistics()
            .then(result => {
                //$("#visits").text(response.result.data.visits);
                //$("#visitsToday").text(response.result.data.visitsToday);
                //self._updateNumber($("#tankOwners"), result.tankOwners, "player");
                this._updateNumber($("#onlinePlayerCount"), result.onlineStatistics.playerCount);
                this._updateNumber($("#onlineGameCount"), result.onlineStatistics.gameCount, "game");
                $("#statisticsSnippet").css("display", "inline-block");
            });
    },

    _updateNumber(element, newValue, suffix) {
        const textContent = element.text();
        const number = parseInt(textContent, 10);
        if (!isNaN(number)) {
            if (number !== newValue) {
                if (newValue > number) {
                    $({ value: number }).animate({ value: newValue }, {
                        duration: 2000,
                        easing: "easeOutQuad",
                        step() {
                            // Update the element's text with ceiled value.
                            const ceiledValue = Math.ceil(this.value);
                            let finalSuffix = "";
                            if (suffix) {
                                finalSuffix = suffix + (ceiledValue !== 1 ? "s" : "");
                            }
                            element.text(`${ceiledValue} ${finalSuffix}`);
                        }
                    });
                    element.addClass("positive");
                    element.switchClass("positive", "", 2000, "easeOutQuad");
                    /*element.css('color', 'lawngreen');
                    element.prop('glowSize', 20);
                    element.animate({color: oldColour, glowSize: 0}, {
                        duration: 2000,
                        easing: 'easeOutCubic',
                        step: function() {
                            element.css('text-shadow', '0px 0px ' + element.prop('glowSize') + 'px ' + element.css('color'));
                        },
                        complete: function() {
                            element.css('text-shadow', 'none');
                        }
                    });*/
                } else {
                    $({ value: number }).animate({ value: newValue }, {
                        duration: 2000,
                        easing: "easeOutQuad",
                        step() {
                            // Update the element's text with floored value.
                            const flooredValue = Math.floor(this.value);
                            let finalSuffix = "";
                            if (suffix) {
                                finalSuffix = suffix + (flooredValue !== 1 ? "s" : "");
                            }
                            element.text(`${flooredValue} ${finalSuffix}`);
                        }
                    });
                    element.addClass("negative");
                    element.switchClass("negative", "", 2000, "easeOutQuad");
                    /*                    element.css('color', 'red');
                    element.prop('glowSize', 20);
                    element.animate({color: oldColour, glowSize: 0}, {
                        duration: 2000,
                        easing: 'easeOutCubic',
                        step: function() {
                            element.css('text-shadow', '0px 0px ' + element.prop('glowSize') + 'px ' + element.css('color'));
                        },
                        complete: function() {
                            element.css('text-shadow', 'none');
                        }
                    });*/
                }
            }
        } else {
            let finalSuffix = "";
            if (suffix) {
                finalSuffix = suffix + (newValue !== 1 ? "s" : "");
            }
            element.text(`${newValue} ${finalSuffix}`);
        }
    }
};
