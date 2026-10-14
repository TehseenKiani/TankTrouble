export class PlayerDetails {
    data = {
        playerId: null,
        username: null,
        victories: 0,
        kills: 0,
        deaths: 0,
        suicides: 0,
        surrenders: 0,
        experience: 0,
        turretColour: null,
        treadColour: null,
        baseColour: null,
        turretAccessory: null,
        barrelAccessory: null,
        frontAccessory: null,
        backAccessory: null,
        treadAccessory: null,
        backgroundAccessory: null,
        badge: null,
        email: null,
        lastLogin: null,
        created: null,
        realName: null,
        birthYear: null,
        country: null,
        newsSubscriber: false,
        gmLevel: 0,
        beta: false,
        verified: false,
        banned: null,
        usernameApproved: null,
        premium: false,
        guest: false,
        rank: 0,
        xp: 0,
        lastForumPost: 0
    };

    static withObject(object) {
        const instance = new this();
        instance.data = object;
        return instance;
    }

    getPlayerId() {
        return this.data.playerId;
    }

    getUsername() {
        return this.data.username;
    }

    getVictories() {
        return this.data.victories;
    }

    getKills() {
        return this.data.kills;
    }

    getDeaths() {
        return this.data.deaths;
    }

    getSuicides() {
        return this.data.suicides;
    }

    getSurrenders() {
        return this.data.surrenders;
    }

    getExperience() {
        return this.data.experience;
    }

    getTurretColour() {
        return this.data.turretColour;
    }

    getTreadColour() {
        return this.data.treadColour;
    }

    getBaseColour() {
        return this.data.baseColour;
    }

    getTurretAccessory() {
        return this.data.turretAccessory;
    }

    getBarrelAccessory() {
        return this.data.barrelAccessory;
    }

    getFrontAccessory() {
        return this.data.frontAccessory;
    }

    getBackAccessory() {
        return this.data.backAccessory;
    }

    getTreadAccessory() {
        return this.data.treadAccessory;
    }

    getBackgroundAccessory() {
        return this.data.backgroundAccessory;
    }

    getBadge() {
        return this.data.badge;
    }

    getEmail() {
        return this.data.email;
    }

    getLastLogin() {
        return this.data.lastLogin;
    }

    getCreated() {
        return this.data.created;
    }

    getRealName() {
        return this.data.realName;
    }

    getBirthYear() {
        return this.data.birthYear;
    }

    getCountry() {
        return this.data.country;
    }

    getNewsSubscriber() {
        return this.data.newsSubscriber;
    }

    getGmLevel() {
        return this.data.gmLevel;
    }

    getBeta() {
        return this.data.beta;
    }

    getVerified() {
        return this.data.verified;
    }

    getBanned() {
        return this.data.banned;
    }

    getUsernameApproved() {
        return this.data.usernameApproved;
    }

    getPremium() {
        return this.data.premium;
    }

    getGuest() {
        return this.data.guest;
    }

    getRank() {
        return this.data.rank;
    }

    getXP() {
        return this.data.xp;
    }

    getLastForumPost() {
        return this.data.lastForumPost;
    }

    toObject() {
        return this.data;
    }
}
