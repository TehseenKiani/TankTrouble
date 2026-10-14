import { Message } from "./message.js";
import { MessageSchemas } from "./messageschemas.js";

export class RoundEndedMessage extends Message {
    static typeId = MessageSchemas.roundEndedMessage.typeId;

    winnerPlayerIds = [];
    victoryExperiencePerWinner = 0;
    victoryGoldAmountPerWinner = 0;
    rankChanges = [];

    setWinnerPlayerIds(winnerPlayerIds) {
        this.winnerPlayerIds = winnerPlayerIds;
    }

    getWinnerPlayerIds() {
        return this.winnerPlayerIds;
    }

    setVictoryExperiencePerWinner(victoryExperiencePerWinner) {
        this.victoryExperiencePerWinner = victoryExperiencePerWinner;
    }

    getVictoryExperiencePerWinner() {
        return this.victoryExperiencePerWinner;
    }

    setVictoryGoldAmountPerWinner(victoryGoldAmountPerWinner) {
        this.victoryGoldAmountPerWinner = victoryGoldAmountPerWinner;
    }

    getVictoryGoldAmountPerWinner() {
        return this.victoryGoldAmountPerWinner;
    }

    setRankChanges(rankChanges) {
        this.rankChanges = rankChanges;
    }

    getRankChanges() {
        return this.rankChanges;
    }

    _toObject() {
        return {
            winnerPlayerIds: this.winnerPlayerIds,
            victoryExperiencePerWinner: this.victoryExperiencePerWinner,
            victoryGoldAmountPerWinner: this.victoryGoldAmountPerWinner,
            rankChanges: this.rankChanges
        };
    }

    _fromObject(object) {
        this.setWinnerPlayerIds(object.winnerPlayerIds);
        this.setVictoryExperiencePerWinner(object.victoryExperiencePerWinner);
        this.setVictoryGoldAmountPerWinner(object.victoryGoldAmountPerWinner);
        this.setRankChanges(object.rankChanges);
    }
}
