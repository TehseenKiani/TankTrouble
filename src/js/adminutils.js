import { TankTrouble } from "./tanktrouble.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { Images } from "./images.js";
import { OverlayManager } from "./overlaymanager.js";
import { UIConstants } from "./tt/ui/uiconstants.js";

export class AdminUtils {
    /**
     * Create a jQuery object with span elements with player names and links to admin player lookup overlay.
     * @param {string[]} playerIds
     * @param {string} adminId
     * @returns {Promise<Object>} jQuery object with the player names.
     */
    static createPlayerNamesWithLookupByPlayerIds(playerIds, adminId) {
        const playerNameMap = {};

        const detailsPromises = playerIds.map(playerId => {
            return Backend.getPlayerDetails(playerId, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        playerNameMap[result.getPlayerId()] = result.getUsername();
                    }
                })
                .catch(() => {});
        });

        return Promise.all(detailsPromises).then(() => this.createPlayerNamesWithLookup(playerIds, playerNameMap, adminId));
    }

    /**
     * Create a jQuery object with span elements with player names and links to admin player lookup overlay.
     * @param {string[]} playerIds
     * @param {Object} playerNameMap
     * @param {string} adminId
     * @returns {Object}
     */
    static createPlayerNamesWithLookup(playerIds, playerNameMap, adminId) {
        const names = $("<span/>");

        for (let i = 0; i < playerIds.length; i++) {
            const playerName = playerNameMap[playerIds[i]];
            if (playerName) {
                const span = $(`<span class='username adminLookup'>${playerName}</span>`);

                const playerId = playerIds[i];
                span.on("click", () => {
                    OverlayManager.replaceOverlay(
                        TankTrouble.AdminPlayerLookupOverlay,
                        { adminId, playerId }
                    );
                });

                names.append(span);
            } else {
                const span = $("<span class='warning'>scrapped</span>");
                names.append(span);
            }

            if (i === playerIds.length - 2) {
                names.append(" and ");
            } else if (i < playerIds.length - 2) {
                names.append(", ");
            }
        }

        return names;
    }

    /**
     * Create paginator.
     * @param {number} offset
     * @param {number} limit
     * @param {number} total
     * @param {Function} callback A function which accepts (offset, limit, page).
     */
    static createPaginator(offset, limit, total, callback) {
        const paginator = $('<div class="paginator"/>');

        let min = Math.max(1, (offset / limit) - 9);
        const max = Math.min(min + 20, Math.ceil(total / limit));
        min = Math.max(1, max - 20);

        for (let i = min; i <= max; i++) {
            const page = i;
            const button = $(`<button class='small' type='button' data-page='${page}' tabindex='-1'>${page}</div>`);
            if ((offset / limit) + 1 === page) {
                button.prop("disabled", true);
            } else {
                button.on("click", () => {
                    callback((page - 1) * limit, limit, page);
                });
            }
            paginator.append(button);
        }

        return paginator;
    }

    /**
     * Create a jQuery object with the administrator codex.
     * @returns {Object}
     */
    static getCodex() {
        const codex = $("<div class='attention'/>");
        codex.append("<div class='subHeader'>The Administrator Codex</div>");
        codex.append("<p>It is the foremost objective of the admins to make TankTrouble a friendly and fun place for everyone.</p>");
        codex.append("<p>Admins do so by using good judgement and common sense. It is why they were chosen as admins and it is why other players look up to them.</p>");
        codex.append("<p>Destructive behaviour is often driven by the attention it generates. So we deal with it by giving it none. We simply remove it quietly and swiftly. And we do so without punishing players or making threats. Instead we direct our attention to, and spend our time on, all the fun-loving TankTroublers.</p>");
        codex.append("<p>As an admin, your common sense is your most important weapon!</p>");
        return codex;
    }

    /**
     * Create a jQuery object with the forum guidelines.
     * @param {number} adminLevel
     * @returns {Object}
     */
    static getForumGuidelines(adminLevel) {
        const guidelines = $("<div>");
        guidelines.append("<div class='subHeader'>Forum guidelines</div>");

        const forum = $("<div class='forum'/>");
        forum.append("<div class='reply approvable deletable bannable likeable'/>");
        forum.find(".reply").append("<div class='container'/>");
        forum.find(".reply .container").append("<div class='bubble'/>");
        forum.find(".reply .container .bubble").append("<div class='pointer border left'/>");
        forum.find(".reply .container .bubble").append("<div class='pointer inner left'/>");
        forum.find(".reply .container .bubble").append("<div class='content'>Hello! Yellow bubbles like this one need your attention - either approve it or delete it.</div>");
        forum.find(".reply .container").append("<div class='actions right'/>");
        forum.find(".reply .container .actions").append("<div class='action like'>");
        forum.find(".reply .container .actions .like").append(`<img class='standard' ${Images.attributes("forum/like.png")}/>`);
        forum.find(".reply .container .actions").append("<div class='moderatorActions'/>");
        let actionCount = 1;
        if (adminLevel >= UIConstants.ADMIN_LEVEL_APPROVE_THREAD_OR_REPLY) {
            forum.find(".reply .container .actions .moderatorActions").append("<div class='action approve'>");
            forum.find(".reply .container .actions .moderatorActions .approve").append(`<img class='off' ${Images.attributes("forum/approve.png")}/>`);
            actionCount++;
        }
        if (adminLevel >= UIConstants.ADMIN_LEVEL_LOCK_THREAD) {
            forum.find(".reply .container .actions .moderatorActions").append("<div class='action lock'>");
            forum.find(".reply .container .actions .moderatorActions .lock").append(`<img class='off' ${Images.attributes("forum/lock.png")}/>`);
            actionCount++;
        }
        if (adminLevel >= UIConstants.ADMIN_LEVEL_PIN_THREAD) {
            forum.find(".reply .container .actions .moderatorActions").append("<div class='action pin'>");
            forum.find(".reply .container .actions .moderatorActions .pin").append(`<img class='off' ${Images.attributes("forum/pin.png")}/>`);
            actionCount++;
        }
        if (adminLevel >= UIConstants.ADMIN_LEVEL_DELETE_THREAD_OR_REPLY) {
            forum.find(".reply .container .actions .moderatorActions").append("<div class='action delete'>");
            forum.find(".reply .container .actions .moderatorActions .delete").append(`<img class='off' ${Images.attributes("forum/delete.png")}/>`);
            actionCount++;
        }
        if (adminLevel >= UIConstants.ADMIN_LEVEL_BAN_THREAD_OR_REPLY) {
            forum.find(".reply .container .actions .moderatorActions").append("<div class='action ban'>");
            forum.find(".reply .container .actions .moderatorActions .ban").append(`<img class='off' ${Images.attributes("forum/ban.png")}/>`);
            actionCount++;
        }
        forum.find(".reply .container, .reply .container .actions").addClass(`actionCount${actionCount}`);
        if (actionCount > 1) {
            guidelines.append(forum);
        } else {
            return "";
        }

        if (adminLevel >= UIConstants.ADMIN_LEVEL_APPROVE_THREAD_OR_REPLY) {
            const approveGuidelines = $("<div class='forumGuidelines'/>");
            approveGuidelines.append("<div class='subHeader'>Approve a bubble...</div>");
            approveGuidelines.find(".subHeader").prepend(`<img ${Images.attributes("forum/approveSelected.png")}/>`);
            const list = $("<ul/>");
            list.append("<li>If the discussion contributes in whichever large or small fashion.</li>");
            list.append("<li>If the reply is relevant to the discussion it is posted within.</li>");
            list.append("<li>If it is a genuine question. No matter how often it is asked, no matter how basic it might be, and no matter if the answer can be found in the F.A.Q. All genuine questions are valid.</li>");
            list.append("<li>If it is a convivial announcement (e.g. \"Happy New Year\").</li>");
            list.append("<li>If it links to other websites except for sites with offensive content.</li>");
            list.append("<li>Regardless what languages it is.</li>");
            list.append("<li>Forgiving imperfect English and spelling mistakes - there should be room for everyone.</li>");
            list.append("<li>Forgiving light swearing and cursing at a reasonable level.</li>");
            list.append("<li>Even if it criticises TankTrouble. Just as long as it is constructive.</li>");
            approveGuidelines.append(list);
            guidelines.append(approveGuidelines);
        }

        if (adminLevel >= UIConstants.ADMIN_LEVEL_DELETE_THREAD_OR_REPLY) {
            const deleteGuidelines = $("<div class='forumGuidelines'/>");
            deleteGuidelines.append("<div class='subHeader'>Delete a bubble...</div>");
            deleteGuidelines.find(".subHeader").prepend(`<img ${Images.attributes("forum/deleteSelected.png")}/>`);
            const list = $("<ul/>");
            list.append("<li>If it is intentionally provocative or hateful.</li>");
            list.append("<li>If it contains foul language.</li>");
            list.append("<li>If it is non-constructive complaining (e.g. \"TankTrouble is shit\").</li>");
            list.append("<li>If the content is too passive to foster any meaningful replies (e.g. \"TankTrouble is awesome\" and \"Hi, I'm new\" are allowed, \"Hi\" and \"What's up?\" are too passive). Use good judgement.</li>");
            list.append("<li>If it is a duplicate that can be found on the same page.</li>");
            list.append("<li>If it is not related to TankTrouble whatsoever. For special occasions and events this can be ignored. Use good judgement.</li>");
            deleteGuidelines.append(list);
            guidelines.append(deleteGuidelines);
        }

        if (adminLevel >= UIConstants.ADMIN_LEVEL_BAN_THREAD_OR_REPLY) {
            const banGuidelines = $("<div class='forumGuidelines'/>");
            banGuidelines.append("<div class='subHeader'>Ban a player for 12 hours from posting in the forum...</div>");
            banGuidelines.find(".subHeader").prepend(`<img ${Images.attributes("forum/banSelected.png")}/>`);
            const list = $("<ul/>");
            list.append("<li>If the player has intentionally and repeatedly violated good behaviour AND is likely to continue.</li>");
            banGuidelines.append(list);
            guidelines.append(banGuidelines);
        }

        if (adminLevel >= UIConstants.ADMIN_LEVEL_LOCK_THREAD) {
            const lockGuidelines = $("<div class='forumGuidelines'/>");
            lockGuidelines.append("<div class='subHeader'>Lock a discussion...</div>");
            lockGuidelines.find(".subHeader").prepend(`<img ${Images.attributes("forum/lockSelected.png")}/>`);
            const list = $("<ul/>");
            list.append("<li>If it has been concluded satisfyingly after which new posts continuously keep derailing from the original topic.</li>");
            list.append("<li>A discussion must not be locked just because it seems to be concluded - the player posting the discussion or other players who follow the discussion might have further, clarifying questions.</li>");
            list.append("<li>Use the lock sparingly!</li>");
            lockGuidelines.append(list);
            guidelines.append(lockGuidelines);
        }

        if (adminLevel >= UIConstants.ADMIN_LEVEL_PIN_THREAD) {
            const pinGuidelines = $("<div class='forumGuidelines'/>");
            pinGuidelines.append("<div class='subHeader'>Pin a discussion...</div>");
            pinGuidelines.find(".subHeader").prepend(`<img ${Images.attributes("forum/pinSelected.png")}/>`);
            const list = $("<ul/>");
            list.append("<li>If an important post keeps drowning.</li>");
            list.append("<li>Don't forget to unpin the discussion when it is no longer relevant.</li>");
            list.append("<li>Keep pinned discussions at a minimum!</li>");
            pinGuidelines.append(list);
            guidelines.append(pinGuidelines);
        }

        return guidelines.children();
    }
}
