export class VictoryAward {
    playerIds = null;
    experiencePerWinner = 0;
    goldAmountPerWinner = 0;
    rankChanges = null; // Array of {playerId, rank, change} tuples

    constructor(playerIds, experiencePerWinner, goldAmountPerWinner, rankChanges) {
        this.playerIds = playerIds;
        this.experiencePerWinner = experiencePerWinner;
        this.goldAmountPerWinner = goldAmountPerWinner;
        this.rankChanges = rankChanges;
    }

    getPlayerIds() {
        return this.playerIds;
    }

    getExperiencePerWinner() {
        return this.experiencePerWinner;
    }

    getGoldAmountPerWinner() {
        return this.goldAmountPerWinner;
    }

    getRankChanges() {
        return this.rankChanges;
    }
}
