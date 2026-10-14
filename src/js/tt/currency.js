export class Currency {
    data = {
        playerId: null,
        gold: 0,
        diamonds: 0
    };

    static withObject(object) {
        const instance = new this();
        instance.data = object;
        return instance;
    }

    getPlayerId() {
        return this.data.playerId;
    }

    getGold() {
        return this.data.gold;
    }

    getDiamonds() {
        return this.data.diamonds;
    }

    toObject() {
        return this.data;
    }
}
