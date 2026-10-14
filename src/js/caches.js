import { Cache } from "./tt/cache.js";

export class Caches {
    static caches = {};

    static _createCacheInstance(cacheName) {
        if (Caches.caches[cacheName] === undefined) {
            // console.log("Creating cache: " + cacheName);
            Caches.caches[cacheName] = new Cache();
        }

        return Caches.caches[cacheName];
    }

    static getCurrencyCache() {
        return Caches._createCacheInstance("currency");
    }

    static getFavouritesCache() {
        return Caches._createCacheInstance("favourites");
    }

    static getGarageContentCache() {
        return Caches._createCacheInstance("garage content");
    }

    static getPlayerDetailsCache() {
        return Caches._createCacheInstance("player details");
    }

    static getPlayerDetailsByUsernameCache() {
        return Caches._createCacheInstance("player details by username");
    }

    static getEmailCache() {
        return Caches._createCacheInstance("email");
    }

    static getTempBanValidityCache() {
        return Caches._createCacheInstance("temp ban validity");
    }

    static getUnseenAchievementsCache() {
        return Caches._createCacheInstance("unseen achievements");
    }

    static getVirtualShopCache() {
        return Caches._createCacheInstance("virtual shop");
    }
}
