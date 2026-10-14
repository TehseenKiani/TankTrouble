import { TouchControls } from "./mobilecontrols.js";
import { TankTrouble } from "./tanktrouble.js";
import { KeyboardInputManager } from "./keyboardinputmanager.js";
import { MouseInputManager } from "./mouseinputmanager.js";
import { OverlayManager } from "./overlaymanager.js";
import { Users } from "./users.js";

export class Inputs {
    static inputManagers = [];
    static INPUT_TYPES = {
        KEYBOARD: "keyboard",
        MOUSE: "mouse",
        TOUCH: "touch"
    };

    static _inputSets = {
        touch: {type: "touch", data: null},
        WASDKeys: {
            type: "keyboard",
            data: {
                forwardKey: Phaser.Keyboard.W,
                backKey: Phaser.Keyboard.S,
                leftKey: Phaser.Keyboard.A,
                rightKey: Phaser.Keyboard.D,
                fireKey: Phaser.Keyboard.Q
            }
        },
        arrowKeys: {
            type: "keyboard",
            data: {
                forwardKey: Phaser.Keyboard.UP,
                backKey: Phaser.Keyboard.DOWN,
                leftKey: Phaser.Keyboard.LEFT,
                rightKey: Phaser.Keyboard.RIGHT,
                fireKey: Phaser.Keyboard.SPACEBAR
            }
        },
        mouse: {
            type: "mouse",
            data: null
        }
    };

    static _unassignedPlayerIds = [];
    static _inputSetsInUse = {};
    static _playerIdInputSetId = {};

    static init() {
        Users.addEventListener(Inputs._authenticationEventHandler, Inputs);
        if (TouchControls.isEnabled()) { for (const id of Users.getAllPlayerIds()) Inputs.addInputManager(id, "touch"); return; }

        // Assign controls to unassigned players.
        for (let i = 0; i < Inputs._unassignedPlayerIds.length; ++i) {
            OverlayManager.enqueueOverlay(
                TankTrouble.ControlsOverlay,
                {
                    playerId: Inputs._unassignedPlayerIds[i],
                    count: Inputs._unassignedPlayerIds.length > 1 ? i + 1 : undefined
                }
            );
        }
    }

    /**
     * Loads input set assignments from cookie.
     * @param {string[]} playerIds The player ids of players that are present.
     * @returns {Array} Player ids of players that need to be assigned a new input.
     */
    static loadInputSetAssignments(playerIds) {
        Inputs._unassignedPlayerIds = [];
        if (TouchControls.isEnabled()) { for (const id of playerIds) Inputs.addInputManager(id, "touch"); return []; }

        const inputSetAssigments = Cookies.getJSON("inputSetAssignments");
        if (inputSetAssigments) {
            const storedPlayerIds = Object.keys(inputSetAssigments);
            // Load and assign all stored input assignments.
            for (let i = 0; i < storedPlayerIds.length; ++i) {
                // Only assign inputs to players that are present.
                if (playerIds.includes(storedPlayerIds[i])) {
                    Inputs._assignInput(storedPlayerIds[i], inputSetAssigments[storedPlayerIds[i]]);
                }
            }

            // Check if any players are present that had no stored input assignment.
            for (let i = 0; i < playerIds.length; ++i) {
                if (!storedPlayerIds.includes(playerIds[i])) {
                    Inputs._unassignedPlayerIds.push(playerIds[i]);
                }
            }
        } else {
            // Queue up input assignment for present players.
            for (let i = 0; i < playerIds.length; ++i) {
                Inputs._unassignedPlayerIds.push(playerIds[i]);
            }
        }

        // Store cleaned up version of input set assignments.
        Inputs._storeInputSetAssignments();

        return Inputs._unassignedPlayerIds;
    }

    static getAvailableInputSetId() {
        // Find available input set.
        const inputSetIds = Object.keys(Inputs._inputSets).filter(id => id !== "touch");
        for (let i = 0; i < inputSetIds.length; ++i) {
            if (Inputs._inputSetsInUse[inputSetIds[i]] === undefined) {
                return inputSetIds[i];
            }
        }

        return null;
    }

    static getAllInputSetIds() {
        const inputSetIds = Object.keys(Inputs._inputSets).filter(id => id !== "touch");
        return inputSetIds;
    }

    static getUnavailableInputSetIds() {
        // Find all unavailable input sets.
        const unavilableInputSetIds = [];
        const inputSetIds = Object.keys(Inputs._inputSets).filter(id => id !== "touch");
        for (let i = 0; i < inputSetIds.length; ++i) {
            if (Inputs._inputSetsInUse[inputSetIds[i]] !== undefined) {
                unavilableInputSetIds.push(inputSetIds[i]);
            }
        }
        return unavilableInputSetIds;
    }

    static getAssignedInputSetId(playerId) {
        return Inputs._playerIdInputSetId[playerId];
    }

    static getInputSetType(inputSetId) {
        return Inputs._inputSets[inputSetId].type;
    }

    static getFireKey(inputSetId) {
        if (Inputs._inputSets[inputSetId].type === "keyboard") {
            return Inputs._inputSets[inputSetId].data.fireKey;
        }

        return null;
    }

    static addInputManager(playerId, inputSetId) {
        Inputs._releaseInput(playerId);
        Inputs._assignInput(playerId, inputSetId);

        Inputs._storeInputSetAssignments();
    }

    static removeInputManager(playerId) {
        Inputs._releaseInput(playerId);

        Inputs._storeInputSetAssignments();
    }

    static reassignInputManager(oldPlayerId, newPlayerId) {
        const inputSetId = Inputs._playerIdInputSetId[oldPlayerId];

        Inputs._releaseInput(oldPlayerId);
        Inputs._assignInput(newPlayerId, inputSetId);

        Inputs._storeInputSetAssignments();
    }

    static update() {
        for (let i = 0; i < Inputs.inputManagers.length; ++i) {
            Inputs.inputManagers[i].update();
        }
    }

    static reset() {
        for (let i = 0; i < Inputs.inputManagers.length; ++i) {
            Inputs.inputManagers[i].reset();
        }
    }

    static _assignInput(playerId, inputSetId) {
        if (!Inputs._inputSets[inputSetId] || (inputSetId === "touch" && !TouchControls.isEnabled())) inputSetId = Inputs.getAvailableInputSetId();
        const inputSet = Inputs._inputSets[inputSetId];
        if (!inputSet) return;
        switch (inputSet.type) {
            case Inputs.INPUT_TYPES.TOUCH: Inputs.inputManagers.push(TouchControls.createInputManager(playerId)); break;
            case Inputs.INPUT_TYPES.KEYBOARD:
            {
                Inputs.inputManagers.push(new KeyboardInputManager(playerId, inputSet.data));
                break;
            }
            case Inputs.INPUT_TYPES.MOUSE:
            {
                Inputs.inputManagers.push(new MouseInputManager(playerId));
                break;
            }
        }

        Inputs._inputSetsInUse[inputSetId] = true;
        Inputs._playerIdInputSetId[playerId] = inputSetId;
    }

    static _releaseInput(playerId) {
        for (let i = 0; i < Inputs.inputManagers.length; ++i) {
            const inputManager = Inputs.inputManagers[i];
            if (inputManager.getPlayerId() === playerId) {
                inputManager.reset();
                Inputs.inputManagers.splice(i, 1);
                break;
            }
        }
        const released = Inputs._playerIdInputSetId[playerId];
        delete Inputs._playerIdInputSetId[playerId];
        if (!Object.values(Inputs._playerIdInputSetId).includes(released)) delete Inputs._inputSetsInUse[released];
    }

    static _storeInputSetAssignments() {
        Cookies.set("inputSetAssignments", Inputs._playerIdInputSetId);
    }

    static _authenticationEventHandler(self, evt, data) {
        if (TouchControls.isEnabled() && [Users.EVENTS.PLAYER_AUTHENTICATED, Users.EVENTS.GUEST_ADDED, Users.EVENTS.GUESTS_ADDED].includes(evt)) {
            for (const id of (Array.isArray(data) ? data : [data])) Inputs.addInputManager(id, "touch");
            return;
        }
        switch (evt) {
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            case Users.EVENTS.GUEST_ADDED:
            {
                // Assign controls to player.
                OverlayManager.enqueueOverlay(
                    TankTrouble.ControlsOverlay,
                    { playerId: data }
                );

                break;
            }
            case Users.EVENTS.GUESTS_ADDED:
            {
                // Assign controls to players.
                for (let i = 0; i < data.length; ++i) {
                    OverlayManager.enqueueOverlay(
                        TankTrouble.ControlsOverlay,
                        { playerId: data[i], count: data.length > 1 ? i + 1 : undefined }
                    );
                }

                break;
            }
            case Users.EVENTS.PLAYER_DEAUTHENTICATED:
            case Users.EVENTS.GUEST_REMOVED:
            {
                Inputs.removeInputManager(data);
                break;
            }
        }
    }
}
