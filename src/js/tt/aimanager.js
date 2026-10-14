import { AI } from "./ai.js";

export class AIManager {
    aiId = null;
    gameController = null;
    ai = null;
    storedStates = {};

    constructor(aiId, config, gameController) {
        this.aiId = aiId;
        this.gameController = gameController;

        this.ai = new AI(aiId, config, gameController);

        this.reset();
    }

    getAIId() {
        return this.aiId;
    }

    getGameId() {
        return this.gameController.getId();
    }

    update(deltaTime) {
        this.ai.update(deltaTime);

        const newInputState = this.ai.getInputState();

        let stateChanged = false;
        stateChanged |= this.storedStates.forward !== newInputState.getForward();
        stateChanged |= this.storedStates.back !== newInputState.getBack();
        stateChanged |= this.storedStates.left !== newInputState.getLeft();
        stateChanged |= this.storedStates.right !== newInputState.getRight();
        stateChanged |= this.storedStates.fire !== newInputState.getFire();

        if (stateChanged) {
            this.gameController.setInputState(newInputState);
        }

        this.storedStates.forward = newInputState.getForward();
        this.storedStates.back = newInputState.getBack();
        this.storedStates.left = newInputState.getLeft();
        this.storedStates.right = newInputState.getRight();
        this.storedStates.fire = newInputState.getFire();
    }

    shutdown() {
        this.ai.shutdown();
    }

    reset() {
        this.storedStates.forward = false;
        this.storedStates.back = false;
        this.storedStates.left = false;
        this.storedStates.right = false;
        this.storedStates.fire = false;
    }
}
