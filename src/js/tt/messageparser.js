import { PingMessage } from "./pingmessage.js";
import { PongMessage } from "./pongmessage.js";
import { AchievementUnlockedMessage } from "./achievementunlockedmessage.js";
import { HandshakeMessage } from "./handshakemessage.js";
import { AuthenticateMessage } from "./authenticatemessage.js";
import { DeauthenticateMessage } from "./deauthenticatemessage.js";
import { ChatActivityMessage } from "./chatactivitymessage.js";
import { GlobalChatMessage } from "./globalchatmessage.js";
import { ChatMessage } from "./chatmessage.js";
import { UserChatMessage } from "./userchatmessage.js";
import { ReportChatMessage } from "./reportchatmessage.js";
import { ReportChatResultMessage } from "./reportchatresultmessage.js";
import { UndoChatReportMessage } from "./undochatreportmessage.js";
import { UndoChatReportResultMessage } from "./undochatreportresultmessage.js";
import { SystemChatMessage } from "./systemchatmessage.js";
import { HandshakeResultMessage } from "./handshakeresultmessage.js";
import { AuthenticateResultMessage } from "./authenticateresultmessage.js";
import { DeauthenticateResultMessage } from "./deauthenticateresultmessage.js";
import { CreateGameResultMessage } from "./creategameresultmessage.js";
import { CreateGameMessage } from "./creategamemessage.js";
import { CountDownMessage } from "./countdownmessage.js";
import { GameStateMessage } from "./gamestatemessage.js";
import { JoinGameMessage } from "./joingamemessage.js";
import { JoinGameResultMessage } from "./joingameresultmessage.js";
import { LeaveGameMessage } from "./leavegamemessage.js";
import { LeaveGameResultMessage } from "./leavegameresultmessage.js";
import { CancelLeaveGameMessage } from "./cancelleavegamemessage.js";
import { CancelLeaveGameResultMessage } from "./cancelleavegameresultmessage.js";
import { ListGamesMessage } from "./listgamesmessage.js";
import { ListGamesResultMessage } from "./listgamesresultmessage.js";
import { RequestMazeMessage } from "./requestmazemessage.js";
import { RequestMazeResultMessage } from "./requestmazeresultmessage.js";
import { TankStateMessage } from "./tankstatemessage.js";
import { TankDestroyedMessage } from "./tankdestroyedmessage.js";
import { TankKilledMessage } from "./tankkilledmessage.js";
import { ProjectileTimeoutMessage } from "./projectiletimeoutmessage.js";
import { ProjectileDestroyedMessage } from "./projectiledestroyedmessage.js";
import { TrapTrippedMessage } from "./traptrippedmessage.js";
import { TrapDestroyedMessage } from "./trapdestroyedmessage.js";
import { CollectibleDestroyedMessage } from "./collectibledestroyedmessage.js";
import { WeaponDestroyedMessage } from "./weapondestroyedmessage.js";
import { UpgradeDestroyedMessage } from "./upgradedestroyedmessage.js";
import { CounterDestroyedMessage } from "./counterdestroyedmessage.js";
import { ZoneDestroyedMessage } from "./zonedestroyedmessage.js";
import { PlayerKickedMessage } from "./playerkickedmessage.js";
import { PlayersBannedMessage } from "./playersbannedmessage.js";
import { PlayersUnbannedMessage } from "./playersunbannedmessage.js";
import { PlayerUpdatedMessage } from "./playerupdatedmessage.js";
import { PlayerUpdatedByAdminMessage } from "./playerupdatedbyadminmessage.js";
import { CelebrationStartedMessage } from "./celebrationstartedmessage.js";
import { RoundEndedMessage } from "./roundendedmessage.js";
import { RoundCreatedMessage } from "./roundcreatedmessage.js";
import { RoundStartedMessage } from "./roundstartedmessage.js";
import { StakesMessage } from "./stakesmessage.js";
import { RoundStateMessage } from "./roundstatemessage.js";
import { RoundStateDeltaMessage } from "./roundstatedeltamessage.js";
import { GameEndedMessage } from "./gameendedmessage.js";
import { ShutdownMessage } from "./shutdownmessage.js";
import { ContentUpdatedMessage } from "./contentupdatedmessage.js";
import { Log } from "./log.js";

export class MessageParser {
    static log = new Log("MessageParser");

    static messageClasses = [
        PingMessage,
        PongMessage,
        AchievementUnlockedMessage,
        HandshakeMessage,
        AuthenticateMessage,
        DeauthenticateMessage,
        ChatActivityMessage,
        GlobalChatMessage,
        ChatMessage,
        UserChatMessage,
        ReportChatMessage,
        ReportChatResultMessage,
        UndoChatReportMessage,
        UndoChatReportResultMessage,
        SystemChatMessage,
        HandshakeResultMessage,
        AuthenticateResultMessage,
        DeauthenticateResultMessage,
        CreateGameResultMessage,
        CreateGameMessage,
        CountDownMessage,
        GameStateMessage,
        JoinGameMessage,
        JoinGameResultMessage,
        LeaveGameMessage,
        LeaveGameResultMessage,
        CancelLeaveGameMessage,
        CancelLeaveGameResultMessage,
        ListGamesMessage,
        ListGamesResultMessage,
        RequestMazeMessage,
        RequestMazeResultMessage,
        TankStateMessage,
        TankDestroyedMessage,
        TankKilledMessage,
        ProjectileTimeoutMessage,
        ProjectileDestroyedMessage,
        TrapTrippedMessage,
        TrapDestroyedMessage,
        CollectibleDestroyedMessage,
        WeaponDestroyedMessage,
        UpgradeDestroyedMessage,
        CounterDestroyedMessage,
        ZoneDestroyedMessage,
        PlayerKickedMessage,
        PlayersBannedMessage,
        PlayersUnbannedMessage,
        PlayerUpdatedMessage,
        PlayerUpdatedByAdminMessage,
        CelebrationStartedMessage,
        RoundEndedMessage,
        RoundCreatedMessage,
        RoundStartedMessage,
        StakesMessage,
        RoundStateMessage,
        RoundStateDeltaMessage,
        GameEndedMessage,
        ShutdownMessage,
        ContentUpdatedMessage
    ];

    static messageClassesByTypeId = new Map();

    static {
        for (const messageClass of MessageParser.messageClasses) {
            if (MessageParser.messageClassesByTypeId.has(messageClass.typeId)) {
                throw new Error(`Duplicate message type id ${messageClass.typeId}`);
            }
            MessageParser.messageClassesByTypeId.set(messageClass.typeId, messageClass);
        }
    }

    static parse(data) {
        try {
            if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
                return MessageParser._parseBinary(data);
            } else if (typeof data === "string") {
                return MessageParser._parseJSON(data);
            } else {
                MessageParser.log.debug("Received message is not a buffer or string");
                return false;
            }
        } catch (error) {
            MessageParser.log.error(`Failed to parse received message: ${error.message}`);
            return false;
        }
    }

    static _parseBinary(buffer) {
        const [typeId] = new Uint8Array(buffer);

        return MessageParser._unpack(typeId, buffer, true);
    }

    static _parseJSON(string) {
        const object = JSON.parse(string);

        return MessageParser._unpack(object._typeId, object, false);
    }

    static _unpack(typeId, data, binary) {
        const MessageClass = MessageParser.messageClassesByTypeId.get(typeId);
        if (!MessageClass || Boolean(MessageClass.schema) !== binary) {
            MessageParser.log.error(`Unknown ${binary ? "binary " : ""}message type id: ${typeId}`);
            return false;
        }

        const msg = new MessageClass();
        msg.unpack(data);

        return msg;
    }
}
