import { FocusManager } from "./focusmanager.js";
import { UIConstants } from "./tt/ui/uiconstants.js";

export class QualityManager {
    static quality = null;
    static fpsSampleCount = 0;
    static averageFps = 0;
    static fpsTime = 0;
    static QUALITY_SETTINGS = {
        AUTO: "auto",
        HIGH: "high",
        LOW: "low"
    };

    static QUALITY_PARAMETERS = {
        TANK_EXPLOSION_SMOKE_COUNT: "tank explosion smoke count",
        TANK_EXPLOSION_FRAGMENT_COUNT: "tank explosion fragment count",
        MISSILE_LAUNCH_SMOKE_COUNT: "missile launch smoke count",
        MISSILE_SMOKE_FREQUENCY: "missile smoke frequency",
        MINE_EXPLOSION_SMOKE_COUNT: "mine explosion smoke count",
        CRATE_LAND_DUST_COUNT: "crate land dust count",
        AIMER_MIN_SEGMENT_LENGTH: "aimer min segment length",
        AIMER_OFF_MAX_SEGMENT_LENGTH: "aimer off max segment length",
        AIMER_ON_MAX_SEGMENT_LENGTH: "aimer on max segment length",
        BULLET_PUFF_COUNT: "bullet puff count",
        SHIELD_INVERSE_BOLT_PROBABILITY: "shield inverse bolt probability",
        SHIELD_SPARK_PARTICLES_PER_EMIT: "shield spark particles per emit",
        SPAWN_ZONE_INVERSE_UNSTABLE_PARTICLE_PROBABILITY: "spawn zone inverse unstable particle probability",
        SPAWN_ZONE_COLLAPSE_PARTICLE_COUNT: "spawn zone collapse particle count",
        STORM_ZONE_STORM_PARTICLE_COUNT: "storm zone storm particle count"
    };

    static QUALITY_VALUES = {
        auto: {
            "tank explosion smoke count": 5,
            "tank explosion fragment count": 15,
            "missile launch smoke count": 20,
            "missile smoke frequency": 50,                              // ms / particle
            "mine explosion smoke count": 3,
            "crate land dust count": 20,
            "aimer min segment length": 0.0,                            // m
            "aimer off max segment length": 1.0,                        // m
            "aimer on max segment length": 0.3,                         // m
            "bullet puff count": 10,
            "shield inverse bolt probability": 0.95,
            "shield spark particles per emit": 4,
            "spawn zone inverse unstable particle probability": 0.5,
            "spawn zone collapse particle count": 40,
            "storm zone storm particle count": 100
        },
        high: {
            "tank explosion smoke count": 5,
            "tank explosion fragment count": 15,
            "missile launch smoke count": 20,
            "missile smoke frequency": 50,                              // ms / particle
            "mine explosion smoke count": 3,
            "crate land dust count": 20,
            "aimer min segment length": 0.0,                            // m
            "aimer off max segment length": 1.0,                        // m
            "aimer on max segment length": 0.3,                         // m
            "bullet puff count": 10,
            "shield inverse bolt probability": 0.95,
            "shield spark particles per emit": 4,
            "spawn zone inverse unstable particle probability": 0.5,
            "spawn zone collapse particle count": 40,
            "storm zone storm particle count": 100
        },
        low: {
            "tank explosion smoke count": 2,
            "tank explosion fragment count": 7,
            "missile launch smoke count": 10,
            "missile smoke frequency": 120,                             // ms / particle
            "mine explosion smoke count": 1,
            "crate land dust count": 10,
            "aimer min segment length": 0.5,                            // m
            "aimer off max segment length": 2.0,                        // m
            "aimer on max segment length": 1.0,                         // m
            "bullet puff count": 4,
            "shield inverse bolt probability": 0.99,
            "shield spark particles per emit": 1,
            "spawn zone inverse unstable particle probability": 0.9,
            "spawn zone collapse particle count": 20,
            "storm zone storm particle count": 40
        }
    };

    static eventListeners = [];
    static EVENTS = {
        QUALITY_SET: "quality set",
        FPS_UPDATED: "fps updated"
    };

    static addEventListener(callback, context) {
        QualityManager.eventListeners.push({ callback, context });
    }

    static removeEventListener(callback, context) {
        for (let i = 0; i < QualityManager.eventListeners.length; i++) {
            if (QualityManager.eventListeners[i].callback === callback && QualityManager.eventListeners[i].context === context) {
                // Remove single entry from array, and return immediately
                // as continuing iteration is unsafe, as the underlying array
                // has been modified
                QualityManager.eventListeners.splice(i, 1);
                return;
            }
        }
    }

    static loadQualitySettings() {
        if (Cookies.get("quality")) {
            QualityManager.setQuality(Cookies.get("quality"));
        } else {
            QualityManager.setQuality(QualityManager.QUALITY_SETTINGS.AUTO);
        }
    }

    static init() {
        FocusManager.addEventListener(QualityManager._focusEventHandler, this);
    }

    static setQuality(quality) {
        // Store the selected quality.
        Cookies.set("quality", quality, { expires: 365 });
        QualityManager.quality = quality;

        QualityManager._notifyEventListeners(QualityManager.EVENTS.QUALITY_SET, quality);

        QualityManager.reset();
    }

    static getQuality() {
        return QualityManager.quality;
    }

    static getQualityValue(qualityParameter) {
        return QualityManager.QUALITY_VALUES[QualityManager.quality][qualityParameter];
    }

    static update() {
        if (QualityManager.quality === QualityManager.QUALITY_SETTINGS.AUTO) {
            const time = Date.now();
            if (QualityManager.fpsTime > 0) {
                const currentFps = 1000.0 / (time - QualityManager.fpsTime);
                QualityManager.averageFps *= 1.0 - UIConstants.SETTINGS_QUALITY_FPS_AVG_WEIGHT;
                QualityManager.averageFps += currentFps * UIConstants.SETTINGS_QUALITY_FPS_AVG_WEIGHT;
                QualityManager.fpsSampleCount++;
            }
            QualityManager.fpsTime = time;

            if (QualityManager.fpsSampleCount > UIConstants.SETTINGS_QUALITY_FPS_MIN_SAMPLES) {
                if (QualityManager.fpsSampleCount % UIConstants.SETTINGS_QUALITY_FPS_SAMPLE_UPDATE_INTERVAL === 0) {
                    QualityManager._notifyEventListeners(QualityManager.EVENTS.FPS_UPDATED, QualityManager.averageFps);
                }

                if (QualityManager.averageFps < UIConstants.SETTINGS_QUALITY_FPS_CHANGE_TO_LOW) {
                    QualityManager.setQuality(QualityManager.QUALITY_SETTINGS.LOW);
                }
            }
        }
    }

    static reset() {
        QualityManager.fpsSampleCount = 0;
        QualityManager.averageFps = 0;
        QualityManager.fpsTime = 0;
        QualityManager._notifyEventListeners(QualityManager.EVENTS.FPS_UPDATED, null);
    }

    static _focusEventHandler(self, evt, data) {
        switch (evt) {
            case FocusManager.EVENTS.FOCUS:
            case FocusManager.EVENTS.BLUR:
            {
                self.reset();

                break;
            }
        }
    }

    static _notifyEventListeners(evt, data) {
        for (let i = 0; i < QualityManager.eventListeners.length; i++) {
            QualityManager.eventListeners[i].callback(QualityManager.eventListeners[i].context, evt, data);
        }
    }
}
