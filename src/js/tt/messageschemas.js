import * as schemapack from "schemapack";

export class MessageSchemas {
    static roundState = {
        tankStates: [{ playerId: "string", x: "float32", y: "float32", forward: "bool", back: "bool", rotation: "float32", left: "bool", right: "bool", fireDown: "bool", locked: "bool" }],
        projectileStates: [{ id: "string", playerId: "string", type: "int8", x: "float32", y: "float32", speedX: "float32", speedY: "float32" }],
        trapStates: [{ id: "string", playerId: "string", type: "int8", x: "float32", y: "float32", speedX: "float32", speedY: "float32", fieldsJSON: "string" }],
        collectibleStates: [{ id: "string", type: "uint8", x: "float32", y: "float32", rotation: "float32" }],
        weaponStates: [{ id: "string", playerId: "string", type: "int8", fieldsJSON: "string" }],
        upgradeStates: [{ id: "string", playerId: "string", type: "uint8", fieldsJSON: "string" }],
        counterStates: [{ id: "string", type: "uint8", fieldsJSON: "string" }],
        zoneStates: [{ id: "string", type: "uint8", tiles: [{ x: "uint8", y: "uint8" }], fieldsJSON: "string" }]
    };

    static roundStateMessage = {
        typeId: 1,
        schema: schemapack.build({
            _typeId: "uint8", /* The underscore makes the typeId come first */
            roundState: MessageSchemas.roundState
        }, false)
    };

    static roundStateDeltaMessage = {
        typeId: 59,
        schema: schemapack.build({
            _typeId: "uint8", /* The underscore makes the typeId come first */
            roundState: MessageSchemas._withOptionalFields(MessageSchemas.roundState)
        }, false)
    };

    static _withOptionalFields(roundState) {
        const optionalRoundState = {};
        for (const statesName in roundState) {
            const [state] = roundState[statesName];
            const optionalState = {};
            for (const key in state) {
                optionalState[`${key}?`] = state[key];
            }
            optionalRoundState[statesName] = [optionalState];
        }

        return optionalRoundState;
    }

    static tankStateMessage = {
        typeId: 2,
        schema: schemapack.build({
            _typeId: "uint8", /* The underscore makes the typeId come first */
            tankState: { playerId: "string", x: "float32", y: "float32", forward: "bool", back: "bool", rotation: "float32", left: "bool", right: "bool", fireDown: "bool", locked: "bool" }
        }, false)
    };

    static tankKilledMessage = { typeId: 3 };
    static projectileTimeoutMessage = { typeId: 4 };
    static projectileDestroyedMessage = { typeId: 5 };
    static trapTrippedMessage = { typeId: 6 };
    static trapDestroyedMessage = { typeId: 7 };
    static collectibleDestroyedMessage = { typeId: 8 };
    static weaponDestroyedMessage = { typeId: 9 };
    static upgradeDestroyedMessage = { typeId: 10 };
    static counterDestroyedMessage = { typeId: 11 };
    static zoneDestroyedMessage = { typeId: 12 };
    static requestMazeMessage = { typeId: 13 };
    static gameEndedMessage = { typeId: 14 };
    static pingMessage = { typeId: 15 };
    static chatActivityMessage = { typeId: 16 };
    static globalChatMessage = { typeId: 17 };
    static chatMessage = { typeId: 18 };
    static userChatMessage = { typeId: 19 };
    static reportChatMessage = { typeId: 202 };
    static undoChatReportMessage = { typeId: 21 };
    static systemChatMessage = { typeId: 22 };
    static authenticateMessage = { typeId: 23 };
    static deauthenticateMessage = { typeId: 24 };
    static countDownMessage = { typeId: 25 };
    static gameStateMessage = { typeId: 26 };
    static listGamesMessage = { typeId: 27 };
    static pongMessage = { typeId: 28 };
    static roundEndedMessage = { typeId: 29 };
    static roundCreatedMessage = { typeId: 30 };
    static roundStartedMessage = { typeId: 31 };
    static createGameMessage = { typeId: 32 };
    static joinGameMessage = { typeId: 33 };
    static leaveGameMessage = { typeId: 34 };
    static cancelLeaveGameMessage = { typeId: 35 };
    static playerKickedMessage = { typeId: 36 };
    static playersBannedMessage = { typeId: 37 };
    static playersUnbannedMessage = { typeId: 38 };
    static playerUpdatedMessage = { typeId: 39 };
    static playerUpdatedByAdminMessage = { typeId: 40 };
    static achievementUnlockedMessage = { typeId: 41 };
    static tankDestroyedMessage = { typeId: 42 };
    static celebrationStartedMessage = { typeId: 43 };
    static stakesMessage = { typeId: 44 };
    static handshakeMessage = { typeId: 45 };
    static shutdownMessage = { typeId: 46 };
    static contentUpdatedMessage = { typeId: 47 };

    static requestMazeResultMessage = {
        typeId: 48,
        schema: schemapack.build({
            _typeId: "uint8", /* The underscore makes the typeId come first */
            result: "bool",
            message: "string",
            maze: {
                theme: "uint8",
                tiles: [[["uint8"]]],
                borders: [{ x: "int8", y: "int8", number: "uint8", orientation: "int8", flip: "bool" }],
                floors: [{ x: "uint8", y: "uint8", number: "uint8", orientation: "uint8" }],
                spaces: [{ x: "uint8", y: "uint8", number: "uint8", orientation: "uint8" }],
                walls: [{ x: "uint8", y: "uint8", number: "uint8", rotate: "bool", flipX: "bool", flipY: "bool" }],
                wallDecorations: [{ x: "uint8", y: "uint8", number: "uint8", orientation: "uint8" }]
            }
        }, false)
    };

    static reportChatResultMessage = { typeId: 49 };
    static undoChatReportResultMessage = { typeId: 50 };
    static authenticateResultMessage = { typeId: 51 };
    static deauthenticateResultMessage = { typeId: 52 };
    static createGameResultMessage = { typeId: 53 };
    static joinGameResultMessage = { typeId: 54 };
    static leaveGameResultMessage = { typeId: 55 };
    static cancelLeaveGameResultMessage = { typeId: 56 };
    static listGamesResultMessage = { typeId: 57 };
    static handshakeResultMessage = { typeId: 58 };
}
