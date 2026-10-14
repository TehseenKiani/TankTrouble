import { Backend } from "../../backend.js";
import { Caches } from "../../caches.js";
import { Images } from "../../images.js";
import { UIConstants } from "./uiconstants.js";

export class UITankIconLoader {
    static imageCache = {};

    canvas = null;
    size = null;
    imagePromises = [];
    parts = {};
    colours = {};
    accessories = {};

    constructor(canvas, size) {
        this.canvas = canvas;
        this.size = size;

        for (const partKey in UIConstants.TANK_ICON_PARTS) {
            const part = UIConstants.TANK_ICON_PARTS[partKey];
            this._queueImage(part, this.parts, part);
        }
    }

    queueColour(tintPart, colour) {
        if (colour.type === "numeric") {
            // Reformat number to make it edible for canvas operations.
            let hashColour = colour.numericValue.slice(2);
            hashColour = `#${new Array(6 - hashColour.length + 1).join("0")}${hashColour}`;

            // Store colour in output colours.
            this.colours[tintPart] = hashColour;
        } else {
            this._queueImage(`colours/colour${colour.imageValue}`, this.colours, tintPart);
        }
    }

    queueAccessory(part, accessory) {
        if (accessory !== null && accessory !== undefined && accessory !== "0") {
            this._queueImage(`accessories/${part}${accessory}`, this.accessories, part);
        }
    }

    load() {
        return Promise.all(this.imagePromises).then(() => {
            UITankIcon.drawTankIcon(this.canvas,
                this.colours[UIConstants.TANK_ICON_TINT_PARTS.TURRET], this.colours[UIConstants.TANK_ICON_TINT_PARTS.TREAD], this.colours[UIConstants.TANK_ICON_TINT_PARTS.BASE],
                this.parts[UIConstants.TANK_ICON_PARTS.TURRET], this.parts[UIConstants.TANK_ICON_PARTS.BARREL],
                this.parts[UIConstants.TANK_ICON_PARTS.LEFT_TREAD], this.parts[UIConstants.TANK_ICON_PARTS.RIGHT_TREAD],
                this.parts[UIConstants.TANK_ICON_PARTS.BASE],
                this.parts[UIConstants.TANK_ICON_PARTS.TURRET_SHADE], this.parts[UIConstants.TANK_ICON_PARTS.BARREL_SHADE],
                this.parts[UIConstants.TANK_ICON_PARTS.LEFT_TREAD_SHADE], this.parts[UIConstants.TANK_ICON_PARTS.RIGHT_TREAD_SHADE],
                this.parts[UIConstants.TANK_ICON_PARTS.BASE_SHADE],
                this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.TURRET], this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.BARREL],
                this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.FRONT], this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.BACK],
                this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.TREAD], this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.BACKGROUND],
                this.accessories[UIConstants.TANK_ICON_ACCESSORY_PARTS.BADGE]);
        });
    }

    _queueImage(name, output, key) {
        const imageUrl = UITankIcon.getImageUrl(name, this.size);

        // Check image cache.
        const cachedImage = UITankIconLoader.imageCache[imageUrl];
        if (cachedImage === undefined) {
            // Make request for image.
            this.imagePromises.push(new Promise(resolve => {
                const imageElement = $(`<img src='${imageUrl}'/>`);

                imageElement.on("load", () => {
                    // Store image in output.
                    output[key] = imageElement[0];

                    // Store image in cache.
                    UITankIconLoader.imageCache[imageUrl] = imageElement[0];

                    resolve();
                });
                imageElement.on("error", () => {
                    // Draw without the image, but make sure that the icon is loaded again next time.
                    delete this.canvas.dataset.tankIconSignature;

                    resolve();
                });
            }));
        } else {
            // Store image in output.
            output[key] = cachedImage;
        }
    }
}

export class UITankIcon {
    static compositedBuffer = $("<canvas></canvas>")[0];
    static tintedBuffer = $("<canvas></canvas>")[0];
    static outlineBuffer = $("<canvas></canvas>")[0];

    static getImageUrl(name, size) {
        return Images.url(`tankIcon/${name}.png@${UIConstants.TANK_ICON_WIDTHS[size]}`);
    }

    static loadPlayerTankIcon(canvas, size, playerId) {
        return new Promise(resolve => {
            Backend.getPlayerDetails(playerId, Caches.getPlayerDetailsCache())
                .then(result => {
                    let coloursAndAccessories = null;
                    if (typeof result === "object") {
                        coloursAndAccessories = [
                            result.getTurretColour(), result.getTreadColour(), result.getBaseColour(),
                            result.getTurretAccessory(), result.getBarrelAccessory(), result.getFrontAccessory(), result.getBackAccessory()
                        ];

                        if (coloursAndAccessories.some(value => !value)) {
                            return;
                        }
                    } else {
                        coloursAndAccessories = [UIConstants.TANK_UNAVAILABLE_COLOUR, UIConstants.TANK_UNAVAILABLE_COLOUR, UIConstants.TANK_UNAVAILABLE_COLOUR, null, null, null, null];
                    }

                    // Skip rendering if the same icon is already drawn on the canvas.
                    const signature = JSON.stringify([playerId, size, coloursAndAccessories]);
                    if (canvas.dataset.tankIconSignature === signature) {
                        resolve();
                        return;
                    }
                    canvas.dataset.tankIconSignature = signature;

                    resolve(UITankIcon.loadTankIcon(canvas, size, ...coloursAndAccessories, null, null, null));
                });
        });
    }

    static loadTankIcon(canvas, size, turretColour, treadColour, baseColour,
        turretAccessory, barrelAccessory, frontAccessory, backAccessory, treadAccessory, backgroundAccessory, badge) {
        const loader = new UITankIconLoader(canvas, size);

        loader.queueColour(UIConstants.TANK_ICON_TINT_PARTS.TURRET, turretColour);
        loader.queueColour(UIConstants.TANK_ICON_TINT_PARTS.TREAD, treadColour);
        loader.queueColour(UIConstants.TANK_ICON_TINT_PARTS.BASE, baseColour);

        loader.queueAccessory(UIConstants.TANK_ICON_ACCESSORY_PARTS.TURRET, turretAccessory);
        loader.queueAccessory(UIConstants.TANK_ICON_ACCESSORY_PARTS.BARREL, barrelAccessory);
        loader.queueAccessory(UIConstants.TANK_ICON_ACCESSORY_PARTS.FRONT, frontAccessory);
        loader.queueAccessory(UIConstants.TANK_ICON_ACCESSORY_PARTS.BACK, backAccessory);
        loader.queueAccessory(UIConstants.TANK_ICON_ACCESSORY_PARTS.TREAD, treadAccessory);
        loader.queueAccessory(UIConstants.TANK_ICON_ACCESSORY_PARTS.BACKGROUND, backgroundAccessory);
        loader.queueAccessory(UIConstants.TANK_ICON_ACCESSORY_PARTS.BADGE, badge);

        return loader.load();
    }

    static drawTankIcon(canvas, turretColour, treadColour, baseColour, turret, barrel, leftTread, rightTread, base,
        turretShade, barrelShade, leftTreadShade, rightTreadShade, baseShade,
        turretAccessory, barrelAccessory, frontAccessory, backAccessory, treadAccessory, backgroundAccessory, badge) {
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        // setup offscreen buffer for composited tank
        if (canvas.width !== this.compositedBuffer.width || canvas.height !== this.compositedBuffer.height) {
            this.compositedBuffer.width = canvas.width;
            this.compositedBuffer.height = canvas.height;
        }

        const compositedContext = this.compositedBuffer.getContext("2d");
        compositedContext.clearRect(0, 0, canvas.width, canvas.height);

        // setup offscreen buffer for tinted components.
        if (canvas.width !== this.tintedBuffer.width || canvas.height !== this.tintedBuffer.height) {
            this.tintedBuffer.width = canvas.width;
            this.tintedBuffer.height = canvas.height;
        }
        const tintedContext = this.tintedBuffer.getContext("2d");
        tintedContext.clearRect(0, 0, canvas.width, canvas.height);

        // Composite back accessory into buffer.
        if (backAccessory instanceof HTMLImageElement) {
            compositedContext.drawImage(backAccessory, 0, 0, canvas.width, canvas.height);
        }

        // Draw tinted left tread
        tintedContext.globalCompositeOperation = "copy";
        if (treadColour instanceof HTMLImageElement) {
            tintedContext.drawImage(treadColour, 0, 0, canvas.width, canvas.height);
        } else {
            tintedContext.fillStyle = treadColour;
            tintedContext.fillRect(0, 0, canvas.width, canvas.height);
        }

        tintedContext.globalCompositeOperation = "destination-atop";
        tintedContext.drawImage(leftTread, 0, 0, canvas.width, canvas.height);

        // Composite into buffer.
        compositedContext.drawImage(this.tintedBuffer, 0, 0);
        compositedContext.drawImage(leftTreadShade, 0, 0, canvas.width, canvas.height);

        // Draw tinted turret.
        tintedContext.globalCompositeOperation = "copy";
        if (turretColour instanceof HTMLImageElement) {
            tintedContext.drawImage(turretColour, 0, 0, canvas.width, canvas.height);
        } else {
            tintedContext.fillStyle = turretColour;
            tintedContext.fillRect(0, 0, canvas.width, canvas.height);
        }

        tintedContext.globalCompositeOperation = "destination-atop";
        tintedContext.drawImage(turret, 0, 0, canvas.width, canvas.height);

        // Composite into buffer.
        compositedContext.drawImage(this.tintedBuffer, 0, 0);
        compositedContext.drawImage(turretShade, 0, 0, canvas.width, canvas.height);

        // Draw tinted base.
        tintedContext.globalCompositeOperation = "copy";
        if (baseColour instanceof HTMLImageElement) {
            tintedContext.drawImage(baseColour, 0, 0, canvas.width, canvas.height);
        } else {
            tintedContext.fillStyle = baseColour;
            tintedContext.fillRect(0, 0, canvas.width, canvas.height);
        }

        tintedContext.globalCompositeOperation = "destination-atop";
        tintedContext.drawImage(base, 0, 0, canvas.width, canvas.height);

        // Composite into buffer.
        compositedContext.drawImage(this.tintedBuffer, 0, 0);
        compositedContext.drawImage(baseShade, 0, 0, canvas.width, canvas.height);

        // Draw tinted right tread.
        tintedContext.globalCompositeOperation = "copy";
        if (treadColour instanceof HTMLImageElement) {
            tintedContext.drawImage(treadColour, 0, 0, canvas.width, canvas.height);
        } else {
            tintedContext.fillStyle = treadColour;
            tintedContext.fillRect(0, 0, canvas.width, canvas.height);
        }

        tintedContext.globalCompositeOperation = "destination-atop";
        tintedContext.drawImage(rightTread, 0, 0, canvas.width, canvas.height);

        // Composite into buffer.
        compositedContext.drawImage(this.tintedBuffer, 0, 0);
        compositedContext.drawImage(rightTreadShade, 0, 0, canvas.width, canvas.height);

        // Draw tinted barrel.
        tintedContext.globalCompositeOperation = "copy";
        if (turretColour instanceof HTMLImageElement) {
            tintedContext.drawImage(turretColour, 0, 0, canvas.width, canvas.height);
        } else {
            tintedContext.fillStyle = turretColour;
            tintedContext.fillRect(0, 0, canvas.width, canvas.height);
        }

        tintedContext.globalCompositeOperation = "destination-atop";
        tintedContext.drawImage(barrel, 0, 0, canvas.width, canvas.height);

        // Composite into buffer.
        compositedContext.drawImage(this.tintedBuffer, 0, 0);
        compositedContext.drawImage(barrelShade, 0, 0, canvas.width, canvas.height);

        // Composite turret accessory into buffer.
        if (turretAccessory instanceof HTMLImageElement) {
            compositedContext.drawImage(turretAccessory, 0, 0, canvas.width, canvas.height);
        }

        // Composite front accessory into buffer.
        if (frontAccessory instanceof HTMLImageElement) {
            compositedContext.drawImage(frontAccessory, 0, 0, canvas.width, canvas.height);
        }

        // Composite barrel accessory into buffer.
        if (barrelAccessory instanceof HTMLImageElement) {
            compositedContext.drawImage(barrelAccessory, 0, 0, canvas.width, canvas.height);
        }

        // setup offscreen buffer for outline
        if (canvas.width !== this.outlineBuffer.width || canvas.height !== this.outlineBuffer.height) {
            this.outlineBuffer.width = canvas.width;
            this.outlineBuffer.height = canvas.height;
        }
        const outlineContext = this.outlineBuffer.getContext("2d");

        outlineContext.globalCompositeOperation = "copy";
        outlineContext.fillStyle = "rgba(0,0,0, 0.8)";
        outlineContext.fillRect(0, 0, canvas.width, canvas.height);

        outlineContext.globalCompositeOperation = "destination-atop";
        outlineContext.drawImage(this.compositedBuffer, 0, 0);

        const width = UIConstants.TANK_ICON_OUTLINE_WIDTH;
        const diagWidth = Math.sqrt((width * width) / 2.0);

        context.drawImage(this.outlineBuffer, -width, 0);
        context.drawImage(this.outlineBuffer, -diagWidth, -diagWidth);
        context.drawImage(this.outlineBuffer, -diagWidth, diagWidth);
        context.drawImage(this.outlineBuffer, 0, width);
        context.drawImage(this.outlineBuffer, 0, -width);
        context.drawImage(this.outlineBuffer, diagWidth, -diagWidth);
        context.drawImage(this.outlineBuffer, diagWidth, diagWidth);
        context.drawImage(this.outlineBuffer, width, 0);

        context.drawImage(this.compositedBuffer, 0, 0);
    }
}
