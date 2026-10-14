import { UIConstants } from "../uiconstants.js";
import { Utils } from "../../../utils.js";

export class UISprayCanParticle extends Phaser.Particle {
    constructor(game, x, y) {
        // Call super.
        super(game, x, y, game.cache.getBitmapData(`spray${UISprayCanParticle.currentEmitter}`));

        // Kill particle.
        this.kill();
    }

    update() {
        this.alpha = Math.max(0.0, this.alpha - (0.01 - (Math.random() * 0.004)));
        this.scale.set(this.scale.x + 0.0125, this.scale.y + 0.0125);
    }

    retire() {
        // Kill particle.
        this.kill();
    }

    // Ugly hack to set state to make the two spray emitters use different bitmaps.
    static setCurrentEmitter(currentEmitter) {
        UISprayCanParticle.currentEmitter = currentEmitter;
    }

    static setColour(game, colour) {
        const spray = game.cache.getBitmapData(`spray${UISprayCanParticle.currentEmitter}`);
        spray.clear();
        const radGrad = spray.context.createRadialGradient(UIConstants.SPRAY_RADIUS, UIConstants.SPRAY_RADIUS, UIConstants.SPRAY_INNER_RADIUS, UIConstants.SPRAY_RADIUS, UIConstants.SPRAY_RADIUS, UIConstants.SPRAY_RADIUS);
        const rgbColour = Utils.hexToRGB(colour.numericValue);
        radGrad.addColorStop(0, `rgba(${rgbColour.r}, ${rgbColour.g}, ${rgbColour.b}, 1)`);
        radGrad.addColorStop(1, `rgba(${rgbColour.r}, ${rgbColour.g}, ${rgbColour.b}, 0)`);
        spray.context.fillStyle = radGrad;
        spray.context.fillRect(0, 0, UIConstants.SPRAY_RADIUS * 2, UIConstants.SPRAY_RADIUS * 2);
        spray.dirty = true;
    }
}
