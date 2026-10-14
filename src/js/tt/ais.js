import { Log } from "./log.js";
import { AIManager } from "./aimanager.js";
import { Backend } from "./backend.js";

export class AIs {
    static aiManagers = [];
    static ais = {};
    static aisInUse = {};
    static initialised = false;
    static log = new Log("AIs");

    static init() {
        // Fetch AIs from backend.
        Backend.getAIs()
            .then(result => {
                if (Array.isArray(result)) {
                    for (const ai of result) {
                        AIs.ais[ai.playerId] = ai.config;
                    }
                    AIs.initialised = true;
                } else {
                    AIs.log.error("Failed to initialise AIs");
                }
            }, () => {
                AIs.log.error("Failed to initialise AIs");
            });
    }

    static isReady() {
        return AIs.initialised;
    }

    static isAI(aiId) {
        return AIs.ais[aiId] !== undefined;
    }

    static getAI(aiId) {
        return AIs.ais[aiId];
    }

    static getAvailableAIId(gameId, difficulty) {
        // FIXME Look for difficulty.
        // Find available AI.
        const aiIds = Object.keys(AIs.ais);
        const aiIdsInUse = AIs.aisInUse[gameId];

        if (aiIdsInUse === undefined) {
            return aiIds[0];
        }

        for (const aiId of aiIds) {
            if (!aiIdsInUse.includes(aiId)) {
                return aiId;
            }
        }

        return null;
    }

    static getAllAIIds() {
        return Object.keys(AIs.ais);
    }

    static getUnavailableAIIds(gameId) {
        const aiIdsInUse = AIs.aisInUse[gameId];

        if (aiIdsInUse === undefined) {
            return [];
        }

        // Find all unavailable AIs.
        return Object.keys(AIs.ais).filter(aiId => aiIdsInUse.includes(aiId));
    }

    static addAIManager(gameController, aiId) {
        const aiConfig = AIs.ais[aiId];
        AIs.aiManagers.push(new AIManager(aiId, aiConfig, gameController));
        if (AIs.aisInUse[gameController.getId()] === undefined) {
            AIs.aisInUse[gameController.getId()] = [];
        }
        AIs.aisInUse[gameController.getId()].push(aiId);

        return true;
    }

    static removeAIManager(gameId, aiId) {
        const aiManagerIndex = AIs.aiManagers.findIndex(aiManager => aiManager.getAIId() === aiId && aiManager.getGameId() === gameId);
        if (aiManagerIndex !== -1) {
            AIs.aiManagers[aiManagerIndex].shutdown();
            AIs.aiManagers.splice(aiManagerIndex, 1);
        }

        const aiIdIndex = AIs.aisInUse[gameId].indexOf(aiId);
        if (aiIdIndex !== -1) {
            AIs.aisInUse[gameId].splice(aiIdIndex, 1);
        }

        if (AIs.aisInUse[gameId].length === 0) {
            delete AIs.aisInUse[gameId];
        }
    }

    static removeAllAIManagers() {
        for (const aiManager of AIs.aiManagers) {
            AIs.removeAIManager(aiManager.getGameId(), aiManager.getAIId());
        }
    }

    static update(deltaTime) {
        for (const aiManager of AIs.aiManagers) {
            aiManager.update(deltaTime);
        }
    }

    static reset() {
        for (const aiManager of AIs.aiManagers) {
            aiManager.reset();
        }
    }
}
