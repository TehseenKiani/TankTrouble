import { TankTrouble } from "./tanktrouble.js";
import { Backend } from "./backend.js";
import { Caches } from "./caches.js";
import { Commands } from "./commands.js";
import { HistoryManager } from "./historymanager.js";
import { Log } from "./tt/log.js";
import { UIConstants } from "./tt/ui/uiconstants.js";
import { UIPlayerPanel } from "./tt/ui/playerpanel/uiplayerpanel.js";
import { Users } from "./users.js";
import { Utils } from "./utils.js";

export class ForumModel {
    replyListChangeListeners = [];
    threadListChangeListeners = [];
    currentThreads = [];
    currentReplies = [];
    currentThreadWindowMinTime = Number.POSITIVE_INFINITY;
    currentThreadWindowMaxTime = Number.NEGATIVE_INFINITY;
    currentThreadWindowMinPinned = Number.POSITIVE_INFINITY;
    currentThreadWindowMaxPinned = Number.NEGATIVE_INFINITY;
    currentThreadWindowNewestId = 0;
    currentThreadWindowOldestId = 0;
    currentReplyWindowNewestId = 0;
    currentReplyWindowOldestId = 0;
    threadCount = 0;
    threadOffset = 0;
    threadRequestSize = 10;
    trackingNewestThreads = false;
    selectedThread = null;
    selectedThreadReplyCount = 0;
    selectedThreadReplyOffset = 0;
    threadBeingEdited = null;
    replyRequestSize = 10;
    trackingNewestReplies = false;
    replyBeingEdited = null;

    addThreadListChangeListener(listener) {
        this.threadListChangeListeners.push(listener);
    }

    addReplyListChangeListener(listener) {
        this.replyListChangeListeners.push(listener);
    }

    getCurrentThreadWindowNewestThreadId() {
        return this.currentThreadWindowNewestId;
    }

    getCurrentReplyWindowOldestId() {
        return this.currentReplyWindowOldestId;
    }

    getThreadRequestSize() {
        return this.threadRequestSize;
    }

    getReplyRequestSize() {
        return this.replyRequestSize;
    }

    getTrackingNewestThreads() {
        return this.trackingNewestThreads;
    }

    getTrackingNewestReplies() {
        return this.trackingNewestReplies;
    }

    notifyThreadListChangeListenersReplyUpdated(reply) {
        for (let i = 0; i < this.replyListChangeListeners.length; i++) {
            this.replyListChangeListeners[i].replyUpdated(reply);
        }
    }

    notifyThreadListChangeListenersThreadListChanged(animate) {
        for (let i = 0; i < this.threadListChangeListeners.length; i++) {
            this.threadListChangeListeners[i].threadListChanged(this.currentThreads, animate);
        }
    }

    notifyThreadListChangeListenersThreadUpdated(thread) {
        for (let i = 0; i < this.threadListChangeListeners.length; i++) {
            this.threadListChangeListeners[i].threadUpdated(thread);
        }
    }

    notifyThreadListChangeListenersThreadSelected(threadId) {
        for (let i = 0; i < this.threadListChangeListeners.length; i++) {
            this.threadListChangeListeners[i].threadSelected(threadId);
        }
    }

    notifyThreadListChangeListenersThreadDeselected() {
        for (let i = 0; i < this.threadListChangeListeners.length; i++) {
            this.threadListChangeListeners[i].threadDeselected();
        }
    }

    notifyThreadListChangeListenersThreadEditStarted(threadId) {
        for (let i = 0; i < this.threadListChangeListeners.length; i++) {
            this.threadListChangeListeners[i].threadEditStarted(threadId);
        }
    }

    notifyThreadListChangeListenersThreadEditFinished(thread) {
        for (let i = 0; i < this.threadListChangeListeners.length; i++) {
            this.threadListChangeListeners[i].threadEditFinished(thread);
        }
    }

    notifyThreadListChangeListenersThreadEditCancelled() {
        for (let i = 0; i < this.threadListChangeListeners.length; i++) {
            this.threadListChangeListeners[i].threadEditCancelled();
        }
    }

    notifyReplyListChangeListenersReplyListChanged(animate) {
        for (let i = 0; i < this.replyListChangeListeners.length; i++) {
            this.replyListChangeListeners[i].replyListChanged(this.currentReplies, animate);
        }
    }

    notifyReplyListChangeListenersReplyEditStarted(replyId) {
        for (let i = 0; i < this.replyListChangeListeners.length; i++) {
            this.replyListChangeListeners[i].replyEditStarted(replyId);
        }
    }

    notifyReplyListChangeListenersReplyEditFinished(reply) {
        for (let i = 0; i < this.replyListChangeListeners.length; i++) {
            this.replyListChangeListeners[i].replyEditFinished(reply);
        }
    }

    notifyReplyListChangeListenersReplyEditCancelled() {
        for (let i = 0; i < this.replyListChangeListeners.length; i++) {
            this.replyListChangeListeners[i].replyEditCancelled();
        }
    }

    /**
     * Merge a list of loaded threads into the currently displayed list of
     * threads.
     *
     * @param {Object[]} newThreads
     * @param {boolean} animate Tell the listeners to update using animation
     */
    mergeLoadedThreads(newThreads, animate) {
        Forum.log.debug(`Loaded thread list length ${newThreads.length}`);

        // This assumes that editing disables synchronisation.
        // Reset any editing from previous page.
        this.threadBeingEdited = null;

        // Remove threads that are no longer present.
        for (let i = 0; i < this.currentThreads.length; i++) {
            const thread = this.currentThreads[i];
            let foundThread = false;
            for (let j = 0; j < newThreads.length; j++) {
                const t = newThreads[j];
                if (t.id === thread.id) {
                    foundThread = true;
                    break;
                }
            }
            if (!foundThread) {
                this.currentThreads.splice(i, 1);
                i--;
            }
        }

        // Remove threads that are already showing if they are in fact older.
        // If the new thread is older than what is already present, then remove the new thread in preparation for the merging step.
        for (let i = 0; i < newThreads.length; i++) {
            const thread = newThreads[i];
            for (let j = 0; j < this.currentThreads.length; j++) {
                const t = this.currentThreads[j];
                if (t.id === thread.id) {
                    if (t.time < thread.time) {
                        this.currentThreads.splice(j, 1);
                    } else {
                        Forum.log.debug("OUTDATED NEW THREAD");
                        newThreads.splice(i, 1);
                        i--;
                    }
                    break;
                }
            }
        }

        // Merge new threads into existing threads.
        for (let i = 0; i < newThreads.length; i++) {
            const thread = newThreads[i];
            let inserted = false;
            for (let j = this.currentThreads.length - 1; j >= 0; j--) {
                const t = this.currentThreads[j];
                if (t.pinned > thread.pinned || t.latestPost >= thread.latestPost) {
                    this.currentThreads.splice(j + 1, 0, thread);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                this.currentThreads.splice(0, 0, thread);
            }
        }

        this.updateCurrentThreadWindow();
        this.notifyThreadListChangeListenersThreadListChanged(animate);
    }

    updateCurrentThreadWindow() {
        this.currentThreadWindowMinTime = Number.POSITIVE_INFINITY;
        this.currentThreadWindowMaxTime = Number.NEGATIVE_INFINITY;

        this.currentThreadWindowMinPinned = Number.POSITIVE_INFINITY;
        this.currentThreadWindowMaxPinned = Number.NEGATIVE_INFINITY;

        for (let i = 0; i < this.currentThreads.length; i++) {
            if ((
                this.currentThreads[i].pinned === this.currentThreadWindowMaxPinned &&
                    this.currentThreads[i].latestPost > this.currentThreadWindowMaxTime
            ) || this.currentThreads[i].pinned > this.currentThreadWindowMaxPinned) {
                this.currentThreadWindowMaxPinned = this.currentThreads[i].pinned;
                this.currentThreadWindowMaxTime = this.currentThreads[i].latestPost;
                this.currentThreadWindowNewestId = this.currentThreads[i].id;
            }
            if ((
                this.currentThreads[i].pinned === this.currentThreadWindowMinPinned &&
                    this.currentThreads[i].latestPost < this.currentThreadWindowMinTime
            ) || this.currentThreads[i].pinned < this.currentThreadWindowMinPinned) {
                this.currentThreadWindowMinPinned = this.currentThreads[i].pinned;
                this.currentThreadWindowMinTime = this.currentThreads[i].latestPost;
                this.currentThreadWindowOldestId = this.currentThreads[i].id;
            }
        }
    }

    mergeLoadedReplies(newReplies, animate) {
        Forum.log.debug(`Loaded reply list length ${newReplies.length}`);

        // This assumes that editing disables synchronisation.
        // Reset any editing from previous page.
        this.threadBeingEdited = null;
        this.replyBeingEdited = null;

        // Remove replies that are no longer present.
        for (let i = 0; i < this.currentReplies.length; i++) {
            const reply = this.currentReplies[i];
            let foundReply = false;
            for (let j = 0; j < newReplies.length; j++) {
                const r = newReplies[j];
                if (r.id === reply.id) {
                    foundReply = true;
                    break;
                }
            }
            if (!foundReply) {
                this.currentReplies.splice(i, 1);
                i--;
            }
        }

        // Remove replies that are already showing if they are in fact older.
        // If the new reply is older than what is already present, then remove the new reply in preparation for the merging step.
        for (let i = 0; i < newReplies.length; i++) {
            const reply = newReplies[i];
            for (let j = 0; j < this.currentReplies.length; j++) {
                const r = this.currentReplies[j];
                if (r.id === reply.id) {
                    if (r.time < reply.time) {
                        this.currentReplies.splice(j, 1);
                    } else {
                        Forum.log.debug("OUTDATED NEW REPLY");
                        newReplies.splice(i, 1);
                        i--;
                    }
                    break;
                }
            }
        }

        // Merge new replies into existing replies.
        for (let i = 0; i < newReplies.length; i++) {
            const reply = newReplies[i];
            let inserted = false;
            for (let j = this.currentReplies.length - 1; j >= 0; j--) {
                const r = this.currentReplies[j];
                if (r.id < reply.id) {
                    this.currentReplies.splice(j + 1, 0, reply);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                this.currentReplies.splice(0, 0, reply);
            }
        }

        this.updateCurrentReplyWindow();
        this.notifyReplyListChangeListenersReplyListChanged(animate);
    }

    updateCurrentReplyWindow() {
        if (this.currentReplies.length > 0) {
            this.currentReplyWindowOldestId = Number.POSITIVE_INFINITY;
            this.currentReplyWindowNewestId = Number.NEGATIVE_INFINITY;

            for (let i = 0; i < this.currentReplies.length; i++) {
                if (this.currentReplies[i].created > this.currentReplyWindowNewestId) {
                    this.currentReplyWindowNewestId = this.currentReplies[i].id;
                }
                if (this.currentReplies[i].created < this.currentReplyWindowOldestId) {
                    this.currentReplyWindowOldestId = this.currentReplies[i].id;
                }
            }
        } else {
            this.currentReplyWindowOldestId = 0;
            this.currentReplyWindowNewestId = 0;
        }
    }

    getThreadById(threadId) {
        for (let i = 0; i < this.currentThreads.length; i++) {
            if (this.currentThreads[i].id === threadId) {
                return this.currentThreads[i];
            }
        }
        if (this.selectedThread.id === threadId) {
            return this.selectedThread;
        }
        return null;
    }

    getReplyById(replyId) {
        for (let i = 0; i < this.currentReplies.length; i++) {
            if (this.currentReplies[i].id === replyId) {
                return this.currentReplies[i];
            }
        }
        return null;
    }

    getThreadCount() {
        return this.threadCount;
    }

    getThreadOffset() {
        return this.threadOffset;
    }

    getSelectedThreadReplyCount() {
        return this.selectedThreadReplyCount;
    }

    getSelectedThreadReplyOffset() {
        return this.selectedThreadReplyOffset;
    }

    getSelectedThread() {
        return this.selectedThread;
    }

    selectThread(threadId) {
        if (!this.selectedThread) {
            this.selectedThread = this.getThreadById(threadId);
            this.trackingNewestThreads = false;
            this.threadBeingEdited = null;
            this.notifyThreadListChangeListenersThreadSelected(threadId);
        }
    }

    deselectThread() {
        if (this.selectedThread) {
            this.selectedThread = null;
            this.trackingNewestReplies = false;
            this.threadBeingEdited = null;
            this.replyBeingEdited = null;
            this.notifyThreadListChangeListenersThreadDeselected();
        }
    }

    getThreadBeingEdited() {
        return this.threadBeingEdited;
    }

    startThreadEdit(threadId) {
        this.threadBeingEdited = this.getThreadById(threadId);
        this.replyBeingEdited = null;
        this.notifyThreadListChangeListenersThreadEditStarted(threadId);
    }

    finishThreadEdit(thread) {
        this.threadBeingEdited = null;
        this.notifyThreadListChangeListenersThreadEditFinished();
        this.updateThread(thread);
    }

    cancelThreadEdit() {
        this.threadBeingEdited = null;
        this.notifyThreadListChangeListenersThreadEditCancelled();
    }

    getReplyBeingEdited() {
        return this.replyBeingEdited;
    }

    startReplyEdit(replyId) {
        this.replyBeingEdited = this.getReplyById(replyId);
        this.threadBeingEdited = null;
        this.notifyReplyListChangeListenersReplyEditStarted(replyId);
    }

    finishReplyEdit(reply) {
        this.replyBeingEdited = null;
        this.notifyReplyListChangeListenersReplyEditFinished();
        this.updateReply(reply);
    }

    cancelReplyEdit() {
        this.replyBeingEdited = null;
        this.notifyReplyListChangeListenersReplyEditCancelled();
    }

    /**
     * Update thread already in list of loaded threads. If for some reason, the thread is not present, simply ignore it.
     * If the updated thread for some reason is outdated, ignore it.
     * Does not update current thread window.
     *
     * @param {Object} thread
     */
    updateThread(thread) {
        if (this.currentThreads.length > 0) {
            for (let j = 0; j < this.currentThreads.length; j++) {
                const t = this.currentThreads[j];
                if (t.id === thread.id) {
                    if (t.time < thread.time) {
                        this.currentThreads.splice(j, 1, thread);
                        this.updateCurrentThreadWindow();
                        this.notifyThreadListChangeListenersThreadUpdated(thread);
                    } else {
                        Forum.log.debug("OUTDATED THREAD UPDATE");
                    }
                    break;
                }
            }
        } else if (this.selectedThread) {
            const t = this.selectedThread;
            if (t.id === thread.id) {
                if (t.time < thread.time) {
                    this.selectedThread = thread;
                    this.notifyThreadListChangeListenersThreadUpdated(thread);
                } else {
                    Forum.log.debug("OUTDATED THREAD UPDATE");
                }
            }
        }
    }

    /**
     * Update reply already in list of loaded replies. If for some reason, the reply is not present, simply ignore it.
     * If the updated reply for some reason is outdated, ignore it.
     * Does not update current reply window.
     *
     * @param {Object} reply
     */
    updateReply(reply) {
        for (let j = 0; j < this.currentReplies.length; j++) {
            const r = this.currentReplies[j];
            if (r.id === reply.id) {
                if (r.time < reply.time) {
                    this.currentReplies.splice(j, 1, reply);
                    this.notifyThreadListChangeListenersReplyUpdated(reply);
                } else {
                    Forum.log.debug(`OUTDATED REPLY UPDATE: ${r.time} ${reply.time}`);
                }
                break;
            }
        }
    }

    loadNewestReplies(threadId) {
        Backend.getForumReplies(threadId, Number.MAX_SAFE_INTEGER, "older", 0, this.replyRequestSize)
            .then(result => {
                if (typeof result === "object") {
                    this.selectedThread = result.thread;
                    this.selectedThreadReplyCount = result.count;
                    this.selectedThreadReplyOffset = result.offset;
                    this.trackingNewestReplies = result.offset >= result.count - this.replyRequestSize;
                    const newReplies = result.replies;
                    this.mergeLoadedReplies(newReplies, false);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                    // Handle that the thread was deleted.
                    Forum.leaveThread();
                }
            })
            .catch(message => {
                TankTrouble.ErrorBox.show(message);
            });
    }

    loadOldestReplies(threadId) {
        Backend.getForumReplies(threadId, 1, "newer", 0, this.replyRequestSize)
            .then(result => {
                if (typeof result === "object") {
                    this.selectedThread = result.thread;
                    this.selectedThreadReplyCount = result.count;
                    this.selectedThreadReplyOffset = result.offset;
                    this.trackingNewestReplies = result.offset >= result.count - this.replyRequestSize;
                    const newReplies = result.replies;
                    this.mergeLoadedReplies(newReplies, false);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                    // Handle that the thread was deleted.
                    Forum.leaveThread();
                }
            });
    }

    loadNewerReplies(threadId, offset) {
        Backend.getForumReplies(threadId, this.currentReplyWindowNewestId + 1, "newer", offset, this.replyRequestSize)
            .then(result => {
                if (typeof result === "object") {
                    // Handle that we reached the end unexpectedly.
                    if (result.replies.length < this.replyRequestSize) {
                        this.loadNewestReplies(threadId);
                        return;
                    }
                    this.selectedThread = result.thread;
                    this.selectedThreadReplyCount = result.count;
                    this.selectedThreadReplyOffset = result.offset;
                    this.trackingNewestReplies = result.offset >= result.count - this.replyRequestSize;
                    const newReplies = result.replies;
                    this.mergeLoadedReplies(newReplies, false);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                    // Handle that the thread was deleted.
                    Forum.leaveThread();
                }
            });
    }

    loadOlderReplies(threadId, offset) {
        Backend.getForumReplies(threadId, this.currentReplyWindowOldestId - 1, "older", offset, this.replyRequestSize)
            .then(result => {
                if (typeof result === "object") {
                    // Handle that we reached the end unexpectedly.
                    if (result.replies.length < this.replyRequestSize) {
                        this.loadOldestReplies(threadId);
                        return;
                    }
                    this.selectedThread = result.thread;
                    this.selectedThreadReplyCount = result.count;
                    this.selectedThreadReplyOffset = result.offset;
                    this.trackingNewestReplies = result.offset >= result.count - this.replyRequestSize;
                    const newReplies = result.replies;
                    this.mergeLoadedReplies(newReplies, false);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                    // Handle that the thread was deleted.
                    Forum.leaveThread();
                }
            });
    }

    refreshReplies(threadId) {
        Backend.getForumReplies(threadId, Number.MAX_SAFE_INTEGER, "older", 0, this.replyRequestSize)
            .then(result => {
                // Ignore refresh if we have stopped synchronising.
                if (!Forum.isSynchronising()) {
                    return;
                }

                if (typeof result === "object") {
                    this.selectedThread = result.thread;
                    this.selectedThreadReplyCount = result.count;
                    this.selectedThreadReplyOffset = result.offset;
                    this.trackingNewestReplies = result.offset >= result.count - this.replyRequestSize;
                    const newReplies = result.replies;
                    this.mergeLoadedReplies(newReplies, true);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                    // Handle that the thread was deleted.
                    Forum.leaveThread();
                }
            });
    }

    loadRepliesById(threadId, replyId) {
        Backend.getForumReplies(threadId, replyId, "newer", 0, this.replyRequestSize)
            .then(result => {
                if (typeof result === "object") {
                    // Handle that we reached the end unexpectedly.
                    if (result.replies.length < this.replyRequestSize) {
                        this.loadNewestReplies(threadId);
                        return;
                    }
                    this.selectedThread = result.thread;
                    this.selectedThreadReplyCount = result.count;
                    this.selectedThreadReplyOffset = result.offset;
                    this.trackingNewestReplies = result.offset >= result.count - this.replyRequestSize;
                    const newReplies = result.replies;
                    this.mergeLoadedReplies(newReplies, false);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                    // Handle that the thread was deleted.
                    Forum.leaveThread();
                }
            });
    }

    loadNewestThreads() {
        Backend.getForumThreads(
            2147483647, // Maximum timestamp in a 32bit environment. FIXME Update to 64bit value.
            //100000000*86400000,
            2147483647, // Maximum value in a 32bit environment. FIXME Update to 64bit value.
            "older",
            0,
            this.threadRequestSize
        )
            .then(result => {
                if (typeof result === "object") {
                    this.selectedThread = null;
                    this.threadCount = result.count;
                    this.threadOffset = result.offset;
                    this.trackingNewestThreads = Number(result.offset) === result.count;
                    const newThreads = result.threads;
                    this.mergeLoadedThreads(newThreads, false);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                }
            });
    }

    loadNewerThreads(offset) {
        Backend.getForumThreads(this.currentThreadWindowMaxTime + 1, this.currentThreadWindowMaxPinned, "newer", offset, this.threadRequestSize)
            .then(result => {
                if (typeof result === "object") {
                    // Handle that we reached the end unexpectedly.
                    if (result.threads.length < this.threadRequestSize) {
                        this.loadNewestThreads();
                        return;
                    }
                    this.selectedThread = null;
                    this.threadCount = result.count;
                    this.threadOffset = result.offset;
                    this.trackingNewestThreads = Number(result.offset) === result.count;
                    const newThreads = result.threads;
                    this.mergeLoadedThreads(newThreads, false);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                }
            });
    }

    loadOlderThreads(offset) {
        Backend.getForumThreads(this.currentThreadWindowMinTime - 1, this.currentThreadWindowMinPinned, "older", offset, this.threadRequestSize)
            .then(result => {
                if (typeof result === "object") {
                    this.selectedThread = null;
                    this.threadCount = result.count;
                    this.threadOffset = result.offset;
                    this.trackingNewestThreads = Number(result.offset) === result.count;
                    const newThreads = result.threads;
                    this.mergeLoadedThreads(newThreads, false);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                }
            });
    }

    refreshThreads() {
        Backend.getForumThreads(
            2147483647, // Maximum timestamp in a 32bit environment. FIXME Update to 64bit value.
            //100000000*86400000,
            2147483647, // Maximum value in a 32bit environment. FIXME Update to 64bit value.
            "older",
            0,
            this.threadRequestSize
        )
            .then(result => {
                // Ignore refresh if we have stopped synchronising.
                if (!Forum.isSynchronising()) {
                    return;
                }

                if (typeof result === "object") {
                    this.selectedThread = null;
                    this.threadCount = result.count;
                    this.threadOffset = result.offset;
                    this.trackingNewestThreads = Number(result.offset) === result.count;
                    const newThreads = result.threads;
                    this.mergeLoadedThreads(newThreads, true);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                }
            });
    }

    loadThreadsById(threadId) {
        Backend.getForumThreadsById(threadId, this.threadRequestSize)
            .then(result => {
                if (typeof result === "object") {
                    this.selectedThread = null;
                    this.threadCount = result.count;
                    this.threadOffset = result.offset;
                    this.trackingNewestThreads = Number(result.offset) === result.count;
                    const newThreads = result.threads;
                    this.mergeLoadedThreads(newThreads, false);
                } else {
                    // Handle messages.
                    TankTrouble.ErrorBox.show(result);
                }
            });
    }
}

export class ForumView {
    static STATE_THREADLIST = "threadlist";
    static STATE_REPLYLIST = "replylist";

    model = null;
    state = ForumView.STATE_THREADLIST;
    composeShowing = true;
    statusShowing = true;
    threadPageFunctions = null;
    replyPageFunctions = null;
    /**
     * When set to true, the view will replace the next history item rather
     * than pushing and set to false
     */
    replaceNextHistory = false;
    /**
     * When set to true, the view will not animate paginator updates
     */
    suppressNextUpdateAnimation = false;

    constructor(model) {
        // Store model reference
        this.model = model;

        this.threadPageFunctions = {
            newest() { Forum.loadNewestThreads(); },
            oldest() { Forum.loadOldestThreads(); },
            newer(offset) { Forum.loadNewerThreads(offset); },
            older(offset) { Forum.loadOlderThreads(offset); }
        };

        this.replyPageFunctions = {
            newest() { Forum.loadNewestReplies(); },
            oldest() { Forum.loadOldestReplies(); },
            newer(offset) { Forum.loadNewerReplies(offset); },
            older(offset) { Forum.loadOlderReplies(offset); }
        };
    }

    hideComposeStatusAndSynchronisationInfo() {
        this.composeShowing = false;
        this.statusShowing = false;
        this.synchronisationInfoShowing = false;

        $("#threadsWrapper .status").hide();
        $("#repliesWrapper .status").hide();
        $("#threadsWrapper .compose").hide();
        $("#repliesWrapper .compose").hide();
        $("#threadsWrapper .synchronisation").hide();
        $("#repliesWrapper .synchronisation").hide();
    }

    setReplaceNextHistory() {
        this.replaceNextHistory = true;
    }

    setSuppressNextUpdateAnimation() {
        this.suppressNextUpdateAnimation = true;
    }

    threadUpdated(thread) {
        const existingThread = $(`#thread-${thread.id}`);
        const t = existingThread.data();
        if (t && thread.id === t.id) {
            Forum.log.debug("VIEW THREAD UPDATE SINGLE");
            const threadHtml = $(thread.html.threadlist);
            const newHeader = threadHtml.find("div.header"); // div is necessary to avoid selecting input field.
            const newContent = threadHtml.find(".content");
            const newDetails = threadHtml.find(".details");
            existingThread.find("div.header").replaceWith(newHeader); // div is necessary to avoid selecting input field.
            existingThread.find(".content").replaceWith(newContent);
            existingThread.find(".details").replaceWith(newDetails);
            existingThread.removeClass().addClass(threadHtml.attr("class"));
            existingThread.data(thread);

            this.updateSingleBubbleAndActionWidth(existingThread);

            if (this.state === ForumView.STATE_THREADLIST) {
                // Make the content ellipsized.
                newContent.addClass("truncated");
            } else {
                // Make sure it is not selectable
                existingThread.removeClass("selectable");
            }

            this.updateModerationTooltip(existingThread);

            // This will also update compose and status.
            Forum.checkCooldown(true);
        }
    }

    replyUpdated(reply) {
        const existingReply = $(`#reply-${reply.id}`);
        const r = existingReply.data();
        if (r && reply.id === r.id) {
            Forum.log.debug("VIEW REPLY UPDATE SINGLE");
            const replyHtml = $(reply.html.replylist);
            const newContent = replyHtml.find(".content");
            const newDetails = replyHtml.find(".details");
            existingReply.find(".content").replaceWith(newContent);
            existingReply.find(".details").replaceWith(newDetails);
            existingReply.removeClass("banned deleted approved moderatable approvable deletable bannable editable likeable liked").addClass(replyHtml.attr("class"));
            existingReply.data(reply);

            this.updateSingleBubbleAndActionWidth(existingReply);
            this.updateModerationTooltip(existingReply);

            // This will also update compose and status.
            Forum.checkCooldown(true);
        }
    }

    removeEditingFromAll() {
        // Remove editing capabilities on all other threads and replies.
        const allThreads = $(".forum .thread");
        allThreads.removeClass("editing");
        Utils.removeAutomaticTextAreaResize(allThreads.find(".edit textarea"));
        const allReplies = $(".forum .reply");
        allReplies.removeClass("editing");
        Utils.removeAutomaticTextAreaResize(allReplies.find(".edit textarea"));
    }

    threadEditStarted(threadId) {
        const thread = this.model.getThreadBeingEdited();

        // Remove editing capabilities on all other threads and replies.
        this.removeEditingFromAll();

        Forum.updateComposeAndStatus(true, false);

        // Add editing capability to thread.
        const editingThread = $(`#thread-${threadId}`);
        const editingInput = editingThread.find(".edit input");
        const editingTextArea = editingThread.find(".edit textarea");
        editingThread.addClass("editing");
        Utils.addAutomaticTextAreaResize(editingTextArea);

        this.updateBubbleAndActionWidths();

        editingInput.val(thread.header);

        editingTextArea.val(thread.message);
        editingTextArea.trigger("input");

        editingTextArea.focus();
    }

    threadEditFinished() {
        // Remove editing.
        this.removeEditingFromAll();

        Forum.updateComposeAndStatus(true, false);
    }

    threadEditCancelled() {
        this.threadEditFinished();

        this.updateBubbleAndActionWidths();
    }

    replyEditStarted(replyId) {
        const reply = this.model.getReplyBeingEdited();

        // Remove editing capabilities on all other threads and replies.
        this.removeEditingFromAll();

        Forum.updateComposeAndStatus(true, false);

        // Add editing capability to reply.
        const editingReply = $(`#reply-${replyId}`);
        const editingTextArea = editingReply.find(".edit textarea");
        editingReply.addClass("editing");
        Utils.addAutomaticTextAreaResize(editingTextArea);

        this.updateBubbleAndActionWidths();

        editingTextArea.val(reply.message);
        editingTextArea.trigger("input");

        editingTextArea.focus();
    }

    replyEditFinished() {
        // Remove editing.
        this.removeEditingFromAll();

        Forum.updateComposeAndStatus(true, false);
    }

    replyEditCancelled() {
        this.replyEditFinished();

        this.updateBubbleAndActionWidths();
    }

    mergeReply(reply, i, animate) {
        // Loop over divs displaying replies
        let inserted = false;
        $(".forum .reply").each((index, element) => {
            const r = $(element).data();
            if (reply.id === r.id) {
                Forum.log.debug("VIEW REPLY UPDATE");
                // reply is already stored here, so update it.
                const replyHtml = $(reply.html.replylist);
                const newContent = replyHtml.find(".content");
                const newDetails = replyHtml.find(".details");
                $(element).find(".content").replaceWith(newContent);
                $(element).find(".details").replaceWith(newDetails);
                $(element).removeClass("banned deleted approved moderatable approvable deletable bannable editable likeable liked").addClass(replyHtml.attr("class"));
                $(element).data(reply);

                inserted = true;
                return false;
            } else if (reply.id < r.id) {
                Forum.log.debug("VIEW REPLY MERGE");
                // reply is not stored here, so insert it.
                const atLeft = (Forum.getSelectedThreadReplyOffset() + i) % 2 === 1;

                const replyHtml = $(reply.html.replylist);
                replyHtml.addClass(atLeft ? "left" : "right");
                if (animate) {
                    replyHtml.addClass("collapsed");
                }
                replyHtml.data(reply);
                replyHtml.insertBefore($(element));

                if (animate) {
                    const insertedReplyHeight = replyHtml.height();
                    replyHtml.css({ minHeight: 0, height: 0, opacity: 0 });
                    replyHtml.delay(300).animate({ height: insertedReplyHeight }, 300).animate({ opacity: 1.0 }, 300, () => { replyHtml.removeAttr("style"); });
                    replyHtml.removeClass("collapsed");
                }

                inserted = true;
                return false;
            }
        });
        // We didn't find a place to put reply, so simply put it in
        // the repliesContainer at the bottom.
        if (!inserted) {
            Forum.log.debug("VIEW REPLY BOTTOM");
            // reply is not stored here, so insert it.
            const previousReply = $(".forum .reply").last();
            let atLeft = false;
            // If there is a previous reply, place the new reply opposite of it.
            if (previousReply.length > 0) {
                Forum.log.debug("RELATIVE PLACEMENT");
                atLeft = !previousReply.hasClass("left");
            } else {
                Forum.log.debug("ABSOLUTE PLACEMENT");
                atLeft = (Forum.getSelectedThreadReplyOffset() + i) % 2 === 1;
            }
            const replyHtml = $(reply.html.replylist);
            replyHtml.addClass(atLeft ? "left" : "right");
            if (animate) {
                replyHtml.addClass("collapsed");
            }
            replyHtml.data(reply);
            replyHtml.appendTo("#repliesContainer");

            if (animate) {
                const insertedReplyHeight = replyHtml.height();
                replyHtml.css({ minHeight: 0, height: 0, opacity: 0 });
                replyHtml.delay(300).animate({ height: insertedReplyHeight }, 300).animate({ opacity: 1.0 }, 300, () => { replyHtml.removeAttr("style"); });
                replyHtml.removeClass("collapsed");
            }
        }
    }

    mergeThread(thread, animate) {
        // Loop over divs displaying thread headers
        // ordered by pinned, descending and latestPost, descending
        let inserted = false;

        $(".forum .thread").each((index, element) => {
            const t = $(element).data();
            if (thread.pinned > t.pinned || (thread.pinned >= t.pinned && thread.latestPost >= t.latestPost)) {
                // We are at the spot where thread should be placed
                if (thread.id === t.id) {
                    // thread is already stored here, so update it.
                    const threadHtml = $(thread.html.threadlist);
                    const newContent = threadHtml.find(".content");
                    const newDetails = threadHtml.find(".details");
                    $(element).find(".content").replaceWith(newContent);
                    $(element).find(".details").replaceWith(newDetails);
                    $(element).removeClass().addClass(threadHtml.attr("class"));
                    $(element).data(thread);

                    this.updateSingleBubbleAndActionWidth($(element));

                    // Make the content ellipsized.
                    newContent.addClass("truncated");

                    this.updateModerationTooltip($(element));
                } else {
                    // thread is not stored here, so insert it.
                    const threadHtml = $(thread.html.threadlist);
                    threadHtml.insertBefore($(element));
                    threadHtml.data(thread);

                    this.updateSingleBubbleAndActionWidth(threadHtml);

                    // Make the content ellipsized.
                    const content = threadHtml.find(".content");
                    content.addClass("truncated");

                    this.updateModerationTooltip(threadHtml);

                    if (animate) {
                        const insertedThreadHeight = threadHtml.height();
                        threadHtml.css({ minHeight: 0, marginTop: 0, height: 0, opacity: 0 });
                        threadHtml.delay(300).animate({ height: insertedThreadHeight, marginTop: 10 }, 300).animate({ opacity: 1.0 }, 300, () => { threadHtml.removeAttr("style"); });
                    }
                }
                inserted = true;
                return false;
            }
        });
        // We didn't find a place to put thread, so simply put it in
        // the threadsContainer at the bottom.
        if (!inserted) {
            const threadHtml = $(thread.html.threadlist);
            threadHtml.appendTo("#threadsContainer");
            threadHtml.data(thread);

            this.updateSingleBubbleAndActionWidth(threadHtml);

            // Make the content ellipsized.
            const content = threadHtml.find(".content");
            content.addClass("truncated");

            this.updateModerationTooltip(threadHtml);

            if (animate) {
                const insertedThreadHeight = threadHtml.height();
                threadHtml.css({ minHeight: 0, marginTop: 0, height: 0, opacity: 0 });
                threadHtml.delay(300).animate({ height: insertedThreadHeight, marginTop: 10 }, 300).animate({ opacity: 1.0 }, 300, () => { threadHtml.removeAttr("style"); });
            }
        }
    }

    updatePaginator(paginator, currentPage, pageCount, pageFunctions, showOldestPage, showPageNumbers, hideBackButton, animate) {
        let currentPages = paginator.find(".page");
        const currentOtherPages = paginator.find(".other .page");

        const ellipses = paginator.find(".ellipsis");

        // If there only one page, remove all pages and ellipses.
        if (pageCount <= 1) {
            currentPages.each((index, element) => {
                if (animate) {
                    const pageImages = $(element).find("img:visible");
                    pageImages.animate({ width: 0, height: 0, bottom: UIConstants.FORUM_PAGE_BUTTON_ANIMATION_BOTTOM }, UIConstants.ELEMENT_MOVE_TIME, () => { pageImages.remove(); });
                    $(element).animate({ opacity: 0 }, UIConstants.ELEMENT_MOVE_TIME, () => { $(element).remove(); });
                } else {
                    $(element).remove();
                }
            });

            ellipses.each((index, element) => {
                if (animate) {
                    $(element).find("img").animate({ width: 0, height: 0 }, UIConstants.ELEMENT_MOVE_TIME);
                    $(element).animate({ opacity: 0 }, UIConstants.ELEMENT_MOVE_TIME);
                } else {
                    $(element).hide();
                }
            });

            if (hideBackButton) {
                const back = paginator.find(".back");
                if (animate) {
                    back.find("img:visible").animate({ width: 0, height: 0 }, UIConstants.ELEMENT_MOVE_TIME);
                    back.animate({ opacity: 0 }, UIConstants.ELEMENT_MOVE_TIME);
                } else {
                    back.hide();
                }
            }

            return;
        }

        // Show back button.
        if (hideBackButton) {
            const back = paginator.find(".back");
            if (animate) {
                back.find("img:visible").animate({ width: UIConstants.FORUM_BACK_BUTTON_WIDTH, height: UIConstants.FORUM_PAGE_BUTTON_HEIGHT, bottom: 0 }, UIConstants.ELEMENT_MOVE_TIME);
                back.show().animate({ opacity: 1 }, UIConstants.ELEMENT_MOVE_TIME);
            } else {
                // Reset animated values.
                back.find("img").css({ width: UIConstants.FORUM_BACK_BUTTON_WIDTH, height: UIConstants.FORUM_PAGE_BUTTON_HEIGHT, bottom: 0 });
                back.show().css({ opacity: 1 });
            }
        }

        // Otherwise, we need to update currently shown pages.

        // First, remove pages that are too far away from current page or are not needed.
        currentOtherPages.each((index, element) => {
            // Do not remove newest and oldest pages.
            if ($(element).hasClass("newest") || $(element).hasClass("oldest")) {
                return;
            }

            const p = $(element).data();
            if (p.number < pageCount - 1 && Math.abs(p.number - currentPage) <= UIConstants.FORUM_MAX_PAGES_AROUND_CURRENT) {
                return;
            }

            if (animate) {
                const pageImages = $(element).find("img:visible");
                pageImages.animate({ width: 0, height: 0, bottom: UIConstants.FORUM_PAGE_BUTTON_ANIMATION_BOTTOM }, UIConstants.ELEMENT_MOVE_TIME, () => { pageImages.remove(); });
                $(element).animate({ opacity: 0 }, UIConstants.ELEMENT_MOVE_TIME, () => { $(element).remove(); });
            } else {
                $(element).remove();
            }
        });

        // Then, add pages that are needed but not already present.
        for (let i = UIConstants.FORUM_MAX_PAGES_AROUND_CURRENT; i >= -UIConstants.FORUM_MAX_PAGES_AROUND_CURRENT; i--) {
            let pageFound = false;
            currentOtherPages.each((index, element) => {
                const p = $(element).data();
                if (p.number === currentPage + i) {
                    pageFound = true;
                    return false;
                }
            });
            if (!pageFound) {
                const pageNumber = currentPage + i;
                if (pageNumber > 0 && pageNumber < pageCount - 1) {
                    const newPage = $(`<div class='button page' title='Show page ${pageNumber + 1}'></div>`);
                    const randomImage = Math.floor(Math.random() * UIConstants.FORUM_PAGE_BUTTON_WIDTHS.length);
                    Utils.addImageWithClasses(newPage, "standard", `forum/page${randomImage}.png`);
                    Utils.addImageWithClasses(newPage, "active", `forum/page${randomImage}Active.png`);
                    Utils.addImageWithClasses(newPage, "selected", `forum/page${randomImage}Selected.png`);
                    Utils.addImageWithClasses(newPage, "selected active", `forum/page${randomImage}SelectedActive.png`);

                    newPage.tooltipster({ side: "top", distance: 12 });

                    newPage.data({ number: pageNumber });

                    let inserted = false;
                    paginator.find(".other .page").each((index, element) => {
                        const p = $(element).data();
                        if (p.number > pageNumber) {
                            newPage.insertBefore($(element));
                            inserted = true;
                            return false;
                        }
                    });
                    if (!inserted) {
                        paginator.find(".other").append(newPage);
                    }

                    // Handle animation
                    if (animate) {
                        newPage.find("img:visible").css({ width: 0, height: 0, bottom: UIConstants.FORUM_PAGE_BUTTON_ANIMATION_BOTTOM })
                            .animate({ width: UIConstants.FORUM_PAGE_BUTTON_WIDTHS[randomImage], height: UIConstants.FORUM_PAGE_BUTTON_HEIGHT, bottom: 0 }, UIConstants.ELEMENT_MOVE_TIME);
                        newPage.css({ opacity: 0 }).animate({ opacity: 1 }, UIConstants.ELEMENT_MOVE_TIME);
                    }
                }
            }
        }

        const oldestPage = paginator.find(".oldest .page");
        if (showOldestPage) {
            if (oldestPage.length === 0) {
                const newPage = $(`<div class='button page oldest' title='Show ${showPageNumbers ? "page 1" : "first"}'></div>`);
                Utils.addImageWithClasses(newPage, "standard", "forum/pageOldest.png", "Oldest");
                Utils.addImageWithClasses(newPage, "active", "forum/pageOldestActive.png", "Oldest");
                Utils.addImageWithClasses(newPage, "selected", "forum/pageOldestSelected.png", "Oldest");
                Utils.addImageWithClasses(newPage, "selected active", "forum/pageOldestSelectedActive.png", "Oldest");

                newPage.tooltipster({ side: "top", distance: 12 });

                newPage.data({ number: 0 });

                newPage.on("mouseup", () => {
                    pageFunctions.oldest();
                });

                paginator.find(".oldest").append(newPage);

                // Handle animation
                if (animate) {
                    newPage.find("img:visible").css({ width: 0, height: 0, bottom: UIConstants.FORUM_PAGE_BUTTON_ANIMATION_BOTTOM })
                        .animate({ width: UIConstants.FORUM_OLDEST_PAGE_BUTTON_WIDTH, height: UIConstants.FORUM_PAGE_BUTTON_HEIGHT, bottom: 0 }, UIConstants.ELEMENT_MOVE_TIME);
                    newPage.css({ opacity: 0 }).animate({ opacity: 1 }, UIConstants.ELEMENT_MOVE_TIME);
                }
            }
        } else if (animate) {
            const pageImages = oldestPage.find("img:visible");
            pageImages.animate({ width: 0, height: 0, bottom: UIConstants.FORUM_PAGE_BUTTON_ANIMATION_BOTTOM }, UIConstants.ELEMENT_MOVE_TIME, () => { pageImages.remove(); });
            oldestPage.animate({ opacity: 0 }, UIConstants.ELEMENT_MOVE_TIME, () => { oldestPage.remove(); });
        } else {
            oldestPage.remove();
        }
        const newestPage = paginator.find(".newest .page");
        if (newestPage.length === 0) {
            const newPage = $("<div class='button page newest' title='Show newest'></div>");
            Utils.addImageWithClasses(newPage, "standard", "forum/pageNewest.png", "Newest");
            Utils.addImageWithClasses(newPage, "active", "forum/pageNewestActive.png", "Newest");
            Utils.addImageWithClasses(newPage, "selected", "forum/pageNewestSelected.png", "Newest");
            Utils.addImageWithClasses(newPage, "selected active", "forum/pageNewestSelectedActive.png", "Newest");

            newPage.tooltipster({ side: "top", distance: 12 });

            // This must be updated every time.
            newPage.data({ number: pageCount - 1 });

            newPage.on("mouseup", () => {
                pageFunctions.newest();
            });

            paginator.find(".newest").append(newPage);

            // Handle animation
            if (animate) {
                newPage.find("img:visible").css({ width: 0, height: 0, bottom: UIConstants.FORUM_PAGE_BUTTON_ANIMATION_BOTTOM })
                    .animate({ width: UIConstants.FORUM_NEWEST_PAGE_BUTTON_WIDTH, height: UIConstants.FORUM_PAGE_BUTTON_HEIGHT, bottom: 0 }, UIConstants.ELEMENT_MOVE_TIME);
                newPage.css({ opacity: 0 }).animate({ opacity: 1 }, UIConstants.ELEMENT_MOVE_TIME);
            }
        }

        // Determine if ellipses should show or not.
        if (currentPage - UIConstants.FORUM_MAX_PAGES_AROUND_CURRENT > 1) {
            if (animate) {
                ellipses.first().find("img").animate({ width: UIConstants.FORUM_PAGE_ELLIPSIS_WIDTH, height: UIConstants.FORUM_PAGE_BUTTON_HEIGHT, bottom: 0 }, UIConstants.ELEMENT_MOVE_TIME);
                ellipses.first().show().animate({ opacity: 1 }, UIConstants.ELEMENT_MOVE_TIME);
            } else {
                // Reset animated values.
                ellipses.first().find("img").css({ width: UIConstants.FORUM_PAGE_ELLIPSIS_WIDTH, height: UIConstants.FORUM_PAGE_BUTTON_HEIGHT, bottom: 0 });
                ellipses.first().show().css({ opacity: 1 });
            }
        } else if (animate) {
            ellipses.first().find("img").animate({ width: 0, height: 0, bottom: UIConstants.FORUM_PAGE_ELLIPSIS_ANIMATION_BOTTOM }, UIConstants.ELEMENT_MOVE_TIME);
            ellipses.first().animate({ opacity: 0 }, UIConstants.ELEMENT_MOVE_TIME);
        } else {
            ellipses.first().hide();
        }

        if (currentPage + UIConstants.FORUM_MAX_PAGES_AROUND_CURRENT < pageCount - 2) {
            if (animate) {
                ellipses.last().find("img").animate({ width: UIConstants.FORUM_PAGE_ELLIPSIS_WIDTH, height: UIConstants.FORUM_PAGE_BUTTON_HEIGHT, bottom: 0 }, UIConstants.ELEMENT_MOVE_TIME);
                ellipses.last().show().animate({ opacity: 1 }, UIConstants.ELEMENT_MOVE_TIME);
            } else {
                // Reset animated values.
                ellipses.last().find("img").css({ width: UIConstants.FORUM_PAGE_ELLIPSIS_WIDTH, height: UIConstants.FORUM_PAGE_BUTTON_HEIGHT, bottom: 0 });
                ellipses.last().show().css({ opacity: 1 });
            }
        } else if (animate) {
            ellipses.last().find("img").animate({ width: 0, height: 0, bottom: UIConstants.FORUM_PAGE_ELLIPSIS_ANIMATION_BOTTOM }, UIConstants.ELEMENT_MOVE_TIME);
            ellipses.last().animate({ opacity: 0 }, UIConstants.ELEMENT_MOVE_TIME);
        } else {
            ellipses.last().hide();
        }

        // Update collection to reflect changes.
        currentPages = paginator.find(".page");

        // Finally, update existing pages (onmouseup function, highlights, etc.).
        currentPages.each((index, element) => {
            const p = $(element).data();

            // Update number of newest page.
            if ($(element).hasClass("newest")) {
                $(element).data({ number: pageCount - 1 });
            }

            // Update highlight.
            if (p.number === currentPage) {
                $(element).addClass("selected");
            } else {
                $(element).removeClass("selected");
            }

            // Do not update newest and oldest pages' onmouseup function.
            if ($(element).hasClass("newest") || $(element).hasClass("oldest")) {
                return;
            }

            // Update onmouseup function and tooltip.
            $(element).off("mouseup");
            if (p.number !== currentPage) {
                const offset = Math.abs(p.number - currentPage) - 1;
                $(element).tooltipster("enable");
                if (p.number < currentPage) {
                    if (!showPageNumbers) {
                        $(element).tooltipster("content", "Show older");
                    }
                    $(element).on("mouseup", () => {
                        pageFunctions.older(offset);
                    });
                } else {
                    if (!showPageNumbers) {
                        $(element).tooltipster("content", "Show newer");
                    }
                    $(element).on("mouseup", () => {
                        pageFunctions.newer(offset);
                    });
                }
            } else {
                $(element).tooltipster("disable");
            }
        });
    }

    replyListChanged(replyList, animate) {
        this.changeState(ForumView.STATE_REPLYLIST);

        if (this.model.getTrackingNewestReplies()) {
            Forum.startReplySynchronisation(UIConstants.FORUM_REPLY_REFRESH_INTERVAL, !this.suppressNextUpdateAnimation);
        } else {
            Forum.stopSynchronisation(!this.suppressNextUpdateAnimation);
        }

        const thread = this.model.getSelectedThread();
        // Display main thread object
        const threadData = $("#repliesThreadData");
        const threadHtml = $(thread.html.threadlist);
        const existingThread = $(`#thread-${thread.id}`);
        const t = existingThread.data();
        if (t && t.id === thread.id) {
            // thread is already showing, so update it.
            const newContent = threadHtml.find(".content");
            const newDetails = threadHtml.find(".details");
            existingThread.find(".content").replaceWith(newContent);
            existingThread.find(".details").replaceWith(newDetails);
            existingThread.removeClass().addClass(threadHtml.attr("class"));
            existingThread.data(thread);
        } else {
            // thread is not showing, so insert it.
            threadHtml.data(thread);
            threadData.append(threadHtml);
        }

        // Make sure it is not selectable
        $(`#thread-${thread.id}`).removeClass("selectable").find(".bubble").removeAttr("command");

        for (let i = 0; i < replyList.length; i++) {
            this.mergeReply(replyList[i], i, animate);
        }
        // Remove displayed replies not in replyList.
        $(".forum .reply[id]").each((index, element) => {
            const r = $(element).data();
            for (let i = 0; i < replyList.length; i++) {
                if (replyList[i].id === r.id) {
                    // Found matching element
                    return;
                }
            }
            // We made it through the list without finding the dom element
            // in replylist, so remove it
            if (animate) {
                $(element).addClass("collapsed");
                $(element).css("height", $(element).height()).css("min-height", 0).animate({ opacity: 0.0 }, 300).animate({ height: 0 }, 300, () => { $(element).remove(); });
            } else {
                $(element).remove();
            }
        });

        // Construct paginator stuff
        // Calculate number of pages at current page size
        const pageCount = Math.ceil(
            this.model.getSelectedThreadReplyCount() / this.model.getReplyRequestSize()
        );

        const currentPage = Math.floor(
            pageCount - ((this.model.getSelectedThreadReplyCount() - this.model.getSelectedThreadReplyOffset()) / this.model.getReplyRequestSize())
        );

        Forum.log.debug(`${this.model.getSelectedThreadReplyOffset()}/${this.model.getSelectedThreadReplyCount()}`);
        Forum.log.debug(`${currentPage}/${pageCount}`);

        // Loop over pages to determine whether a link should be put in
        // the pagination section
        this.updatePaginator($(".repliesPaginator").first(), currentPage, pageCount, this.replyPageFunctions, true, true, false, !this.suppressNextUpdateAnimation);
        this.updatePaginator($(".repliesPaginator").last(), currentPage, pageCount, this.replyPageFunctions, true, true, true, !this.suppressNextUpdateAnimation);

        // Update compose fields.
        Forum.updateComposeAndStatus(!this.suppressNextUpdateAnimation, true);

        this.suppressNextUpdateAnimation = false;

        Forum.log.debug(`Pushing reply list length ${replyList.length}`);

        const data = {
            threadId: this.model.getSelectedThread().id,
            id: this.model.getCurrentReplyWindowOldestId()
        };

        // Update bubble and action widths.
        this.updateBubbleAndActionWidths();
        // Update all moderation tooltips.
        this.updateModerationTooltips();

        HistoryManager.updateTab("forum", `/forum?threadId=${data.threadId}&id=${data.id}`, data, this.replaceNextHistory);
        this.replaceNextHistory = false;
    }

    threadListChanged(threadList, animate) {
        this.changeState(ForumView.STATE_THREADLIST);

        if (this.model.getTrackingNewestThreads()) {
            Forum.startThreadSynchronisation(UIConstants.FORUM_THREAD_REFRESH_INTERVAL, !this.suppressNextUpdateAnimation);
        } else {
            Forum.stopSynchronisation(!this.suppressNextUpdateAnimation);
        }

        for (let i = 0; i < threadList.length; i++) {
            this.mergeThread(threadList[i], animate);
        }
        // Remove displayed threads not in threadList or outdated.
        $(".forum .thread[id]").each((index, element) => {
            const t = $(element).data();
            for (let i = 0; i < threadList.length; i++) {
                if (threadList[i].id === t.id) {
                    // Found matching element so now check that it is up to date.
                    if (threadList[i].time <= t.time) {
                        return;
                    }
                }
            }
            // We made it through the list without finding the dom element
            // in threadlist, so remove it
            if (animate) {
                $(element).css("height", $(element).height()).css("min-height", 0).animate({ opacity: 0.0 }, 300).animate({ height: 0, marginTop: 0 }, 300, () => { $(element).remove(); });
            } else {
                $(element).remove();
            }
        });

        // Construct paginator stuff
        // Calculate number of pages at current page size
        const pageCount = Math.ceil(
            this.model.getThreadCount() / this.model.getThreadRequestSize()
        );

        const currentPage = Math.floor(
            pageCount - ((this.model.getThreadCount() - this.model.getThreadOffset()) / this.model.getThreadRequestSize()) - 1
        );

        Forum.log.debug(`${this.model.getThreadOffset()}/${this.model.getThreadCount()}`);
        Forum.log.debug(`${currentPage}/${pageCount}`);

        // Loop over pages to determine whether a link should be put in
        // the pagination section
        this.updatePaginator($(".threadsPaginator").first(), currentPage, pageCount, this.threadPageFunctions, false, false, false, !this.suppressNextUpdateAnimation);
        this.updatePaginator($(".threadsPaginator").last(), currentPage, pageCount, this.threadPageFunctions, false, false, false, !this.suppressNextUpdateAnimation);

        // Update compose fields.
        Forum.updateComposeAndStatus(!this.suppressNextUpdateAnimation, true);

        this.suppressNextUpdateAnimation = false;

        Forum.log.debug(`Pushing thread list length ${threadList.length}`);

        const data = {
            id: this.model.getCurrentThreadWindowNewestThreadId()
        };
        HistoryManager.updateTab("forum", `/forum?id=${data.id}`, data, this.replaceNextHistory);
        this.replaceNextHistory = false;
    }

    threadSelected(threadId) {
        this.setSuppressNextUpdateAnimation();
        $("#threadsWrapper .compose input").val("");
        $("#threadsWrapper .compose textarea").val("");
        $("#threadsWrapper .compose textarea").trigger("input");
        this.model.loadNewestReplies(threadId);
    }

    threadDeselected() {
        this.setSuppressNextUpdateAnimation();
        $("#repliesWrapper .compose textarea").val("");
        $("#repliesWrapper .compose textarea").trigger("input");
        const threadId = this.model.getCurrentThreadWindowNewestThreadId();
        if (threadId === 0) {
            this.model.loadNewestThreads();
        } else {
            this.model.loadThreadsById(threadId);
        }
    }

    changeState(state) {
        Forum.log.debug(`STATE: ${state}`);
        this.state = state;

        // Undo initial hidden state of wrappers.
        $("#threadsWrapper").removeClass("hidden");
        $("#repliesWrapper").removeClass("hidden");
        $(".forum.panelWrapper").removeClass("pending");

        if (this.state === ForumView.STATE_REPLYLIST) {
            $("#threadsWrapper").hide();
            $("#threadsContainer").empty();
            $(".threadsPaginator").find(".oldest, .other, .newest").empty();
            $(".threadsPaginator").find(".ellipsis").hide();
            $("#repliesWrapper").show();
        } else {
            $("#repliesWrapper").hide();
            $("#repliesThreadData").empty();
            $("#repliesContainer").empty();
            $(".repliesPaginator").find(".oldest, .other, .newest").empty();
            $(".repliesPaginator").find(".ellipsis").hide();
            $("#threadsWrapper").show();
        }
    }

    getState() {
        return this.state;
    }

    updateSynchronisationInfo(animate) {
        const showInfo = Forum.isSynchronising();

        if (showInfo) {
            // Update message.
            const synchronisationText = Forum.getSynchronisationText();
            $("#threadsWrapper .synchronisation").text(`Updating ${synchronisationText}`);
            $("#repliesWrapper .synchronisation").text(`Updating ${synchronisationText}`);

            if (!this.synchronisationInfoShowing) {
                if (animate) {
                    let targetHeight = $("#threadsWrapper .synchronisation").stop(true).removeAttr("style").height();
                    $("#threadsWrapper .synchronisation").css({ height: 0, opacity: 0, marginTop: 0 });
                    $("#threadsWrapper .synchronisation").animate({ height: targetHeight, marginTop: 10 }, 300).animate({ opacity: 1.0 }, 300, () => { $("#threadsWrapper .synchronisation").removeAttr("style"); });
                    targetHeight = $("#repliesWrapper .synchronisation").stop(true).removeAttr("style").height();
                    $("#repliesWrapper .synchronisation").css({ height: 0, opacity: 0, marginTop: 0 });
                    $("#repliesWrapper .synchronisation").animate({ height: targetHeight, marginTop: 10 }, 300).animate({ opacity: 1.0 }, 300, () => { $("#repliesWrapper .synchronisation").removeAttr("style"); });
                } else {
                    // Reset animated values.
                    $("#threadsWrapper .synchronisation").stop(true).removeAttr("style");
                    $("#repliesWrapper .synchronisation").stop(true).removeAttr("style");
                }
            }
            this.synchronisationInfoShowing = true;
        } else {
            if (this.synchronisationInfoShowing) {
                if (animate) {
                    $("#threadsWrapper .synchronisation").stop(true).css("height", $("#threadsWrapper .synchronisation").height()).animate({ opacity: 0.0 }, 300).animate({ height: 0, marginTop: 0 }, 300);
                    $("#repliesWrapper .synchronisation").stop(true).css("height", $("#repliesWrapper .synchronisation").height()).animate({ opacity: 0.0 }, 300).animate({ height: 0, marginTop: 0 }, 300);
                } else {
                    $("#threadsWrapper .synchronisation").stop(true).hide();
                    $("#repliesWrapper .synchronisation").stop(true).hide();
                }
            }
            this.synchronisationInfoShowing = false;
        }
    }

    updateComposeAndStatus(eligibleUsernameMap, animate) {
        const playerIds = Users.getAuthenticatedPlayerIds();

        // Find first eligible player present. If none, store number of unverified or temp banned players present.
        let eligibleUsername = "";
        let unverifiedCount = 0;
        let tempBannedCount = 0;
        for (let i = 0; i < playerIds.length; ++i) {
            if (eligibleUsernameMap[playerIds[i]].eligible && eligibleUsername === "") {
                eligibleUsername = eligibleUsernameMap[playerIds[i]].username;
            }
            if (eligibleUsernameMap[playerIds[i]].unverified) {
                ++unverifiedCount;
            }
            if (eligibleUsernameMap[playerIds[i]].tempBanned) {
                ++tempBannedCount;
            }
        }

        const showCompose = playerIds.length > 0 && eligibleUsername !== "" && !Forum.isEditing() && Forum.isSynchronising() && Forum.isCooledDown();

        if (showCompose) {
            // Update details.
            if (eligibleUsername === "" || Users.getAllPlayerIds().length <= 1) {
                $(".compose .details").text("");
            } else {
                $(".compose .details").text(`Posting as ${eligibleUsername}`);
            }
            if (!this.composeShowing) {
                if (animate) {
                    let targetHeight = $("#threadsWrapper .compose").stop(true).removeAttr("style").height();
                    $("#threadsWrapper .compose").css({ height: 0, opacity: 0, marginTop: 0 });
                    $("#threadsWrapper .compose").delay(300).animate({ height: targetHeight, marginTop: 10 }, 300).animate({ opacity: 1.0 }, 300, () => { $("#threadsWrapper .compose").removeAttr("style"); });
                    targetHeight = $("#repliesWrapper .compose").stop(true).removeAttr("style").height();
                    $("#repliesWrapper .compose").css({ height: 0, opacity: 0, marginTop: 0 });
                    $("#repliesWrapper .compose").delay(300).animate({ height: targetHeight, marginTop: 10 }, 300).animate({ opacity: 1.0 }, 300, () => { $("#repliesWrapper .compose").removeAttr("style"); });
                } else {
                    // Reset animated values.
                    $("#threadsWrapper .compose").stop(true).removeAttr("style");
                    $("#repliesWrapper .compose").stop(true).removeAttr("style");
                }
            }
            this.composeShowing = true;

            if (this.statusShowing) {
                // Hide message.
                if (animate) {
                    $("#threadsWrapper .status").stop(true).css("height", $("#threadsWrapper .status").height()).animate({ opacity: 0.0 }, 300).animate({ height: 0, marginTop: 0 }, 300);
                    $("#repliesWrapper .status").stop(true).css("height", $("#repliesWrapper .status").height()).animate({ opacity: 0.0 }, 300).animate({ height: 0, marginTop: 0 }, 300);
                } else {
                    $("#threadsWrapper .status").stop(true).hide();
                    $("#repliesWrapper .status").stop(true).hide();
                }
            }
            this.statusShowing = false;
        } else {
            // Update message.
            if (playerIds.length === 0) {
                $("#threadsWrapper .status").text("Log in to start a thread");
                $("#repliesWrapper .status").text("Log in to reply");
            } else if (tempBannedCount === playerIds.length) {
                $("#threadsWrapper .status").text("You have been temporarily banned from posting");
                $("#repliesWrapper .status").text("You have been temporarily banned from posting");
            } else if (unverifiedCount + tempBannedCount === playerIds.length) {
                $("#threadsWrapper .status").text("Verify your email to start a thread");
                $("#repliesWrapper .status").text("Verify your email to reply");
            } else if (Forum.isEditing()) {
                $("#threadsWrapper .status").text("Finish editing before starting a new thread");
                $("#repliesWrapper .status").text("Finish editing before replying again");
            } else if (!Forum.isSynchronising()) {
                $("#threadsWrapper .status").text("Go to the newest threads to start a thread");
                $("#repliesWrapper .status").text("Go to the newest page to reply");
            } else if (!Forum.isCooledDown()) {
                const cooldownText = Forum.getCooldownText();
                $("#threadsWrapper .status").text(`Wait ${cooldownText} to start a new thread`);
                $("#repliesWrapper .status").text(`Wait ${cooldownText} to reply again`);
            }

            if (this.composeShowing) {
                if (animate) {
                    $("#threadsWrapper .compose").css("height", $("#threadsWrapper .compose").height()).animate({ opacity: 0.0 }, 300).animate({ height: 0, marginTop: 0 }, 300);
                    $("#repliesWrapper .compose").css("height", $("#repliesWrapper .compose").height()).animate({ opacity: 0.0 }, 300).animate({ height: 0, marginTop: 0 }, 300);
                } else {
                    $("#threadsWrapper .compose").hide();
                    $("#repliesWrapper .compose").hide();
                }
            }
            this.composeShowing = false;

            if (!this.statusShowing) {
                // Show message.
                if (animate) {
                    let targetHeight = $("#threadsWrapper .status").removeAttr("style").height();
                    $("#threadsWrapper .status").css({ height: 0, opacity: 0, marginTop: 0 });
                    $("#threadsWrapper .status").delay(300).animate({ height: targetHeight, marginTop: 10 }, 300).animate({ opacity: 1.0 }, 300, () => { $("#threadsWrapper .status").removeAttr("style"); });
                    targetHeight = $("#repliesWrapper .status").removeAttr("style").height();
                    $("#repliesWrapper .status").css({ height: 0, opacity: 0, marginTop: 0 });
                    $("#repliesWrapper .status").delay(300).animate({ height: targetHeight, marginTop: 10 }, 300).animate({ opacity: 1.0 }, 300, () => { $("#repliesWrapper .status").removeAttr("style"); });
                } else {
                    // Reset animated values.
                    $("#threadsWrapper .status").removeAttr("style");
                    $("#repliesWrapper .status").removeAttr("style");
                }
            }
            this.statusShowing = true;
        }
    }

    updateBubbleAndActionWidths() {
        $(".forum .thread").each((index, element) => {
            this.updateSingleBubbleAndActionWidth($(element));
        });

        $(".forum .reply").each((index, element) => {
            this.updateSingleBubbleAndActionWidth($(element));
        });
    }

    updateSingleBubbleAndActionWidth(threadOrReply) {
        const actionCount = threadOrReply.find(".action:visible").length;
        threadOrReply.find(".container").removeClass("actionCount0 actionCount1 actionCount2 actionCount3 actionCount4 actionCount5 actionCount6 actionCount7").addClass(`actionCount${actionCount}`);
        threadOrReply.find(".actions").removeClass("actionCount0 actionCount1 actionCount2 actionCount3 actionCount4 actionCount5 actionCount6 actionCount7").addClass(`actionCount${actionCount}`);
    }

    updateModerationTooltips() {
        $(".forum .thread").each((index, element) => {
            this.updateModerationTooltip($(element));
        });

        $(".forum .reply").each((index, element) => {
            this.updateModerationTooltip($(element));
        });
    }

    updateModerationTooltip(threadOrReply) {
        const data = threadOrReply.data();

        const hasBeenModerated = data.approved || data.deleted || data.banned || data.pinned || data.locked;

        const actions = threadOrReply.find(".moderatorActions");

        if (threadOrReply.hasClass("moderatable")) {
            if (!actions.hasClass("tooltipstered")) {
                actions.tooltipster({ side: "top", theme: "tooltipster-admin", updateAnimation: null });
            }

            if (data.moderatedBy !== null) {
                Backend.getPlayerDetails(data.moderatedBy, Caches.getPlayerDetailsCache())
                    .then(result => {
                        // The actions element may have been replaced or destroyed while the request was in flight.
                        if (!actions.data("tooltipster-ns")) {
                            return;
                        }

                        if (typeof result === "object") {
                            actions.tooltipster("content", `Last moderated by ${result.getUsername()}`);
                        } else {
                            // Post was moderated, but something went wrong in retrieving username.
                            actions.tooltipster("content", "Moderator not currently available");
                        }
                    });
            } else if (hasBeenModerated) {
                // Post was moderated, but the moderating user has been deleted.
                actions.tooltipster("content", "Moderator has been scrapped");
            }
        } else if (actions.hasClass("tooltipstered")) {
            actions.tooltipster("disable").tooltipster("destroy");
        }
    }
}

export class Forum {
    static log = new Log("Forum");
    static model = null;
    static view = null;
    static threadListSyncInterval = null;
    static replyListSyncInterval = null;
    static synchronising = false;
    static synchronisationCountdown = 0;
    static cooldownInterval = null;
    static cooldown = 0;

    static refreshThreads() {
        Forum.view.setReplaceNextHistory();
        Forum.model.refreshThreads();
    }

    static loadNewestThreads() {
        Forum.view.setReplaceNextHistory();
        Forum.model.loadNewestThreads();
    }

    static loadOlderThreads(offset) {
        Forum.view.setReplaceNextHistory();
        Forum.model.loadOlderThreads(offset * Forum.model.getThreadRequestSize());
    }

    static loadNewerThreads(offset) {
        Forum.view.setReplaceNextHistory();
        Forum.model.loadNewerThreads(offset * Forum.model.getThreadRequestSize());
    }

    static refreshReplies() {
        Forum.view.setReplaceNextHistory();
        Forum.model.refreshReplies(Forum.model.getSelectedThread().id);
    }

    static loadNewestReplies() {
        Forum.view.setReplaceNextHistory();
        Forum.model.loadNewestReplies(Forum.model.getSelectedThread().id);
    }

    static loadOldestReplies() {
        Forum.view.setReplaceNextHistory();
        Forum.model.loadOldestReplies(Forum.model.getSelectedThread().id);
    }

    static loadOlderReplies(offset) {
        Forum.view.setReplaceNextHistory();
        Forum.model.loadOlderReplies(Forum.model.getSelectedThread().id, offset * Forum.model.getReplyRequestSize());
    }

    static loadNewerReplies(offset) {
        Forum.view.setReplaceNextHistory();
        Forum.model.loadNewerReplies(Forum.model.getSelectedThread().id, offset * Forum.model.getReplyRequestSize());
    }

    static selectThread(threadId) {
        // Cancel selection of thread being edited.
        const threadBeingEdited = Forum.model.getThreadBeingEdited();
        if (threadBeingEdited !== null && threadBeingEdited.id === threadId) {
            return;
        }

        Forum.stopSynchronisation(true);
        Forum.model.selectThread(threadId);
    }

    static leaveThread() {
        Forum.stopSynchronisation(true);
        Forum.model.deselectThread();
    }

    static startThreadEdit(threadId) {
        Forum.stopSynchronisation(true);
        Forum.model.startThreadEdit(threadId);
    }

    static startReplyEdit(replyId) {
        Forum.stopSynchronisation(true);
        Forum.model.startReplyEdit(replyId);
    }

    static cancelThreadEdit() {
        if (Forum.model.getTrackingNewestThreads()) {
            Forum.startThreadSynchronisation(UIConstants.FORUM_THREAD_REFRESH_INTERVAL, true);
        }
        if (Forum.model.getTrackingNewestReplies()) {
            Forum.startReplySynchronisation(UIConstants.FORUM_REPLY_REFRESH_INTERVAL, true);
        }
        Forum.model.cancelThreadEdit();
    }

    static cancelReplyEdit() {
        if (Forum.model.getTrackingNewestReplies()) {
            Forum.startReplySynchronisation(UIConstants.FORUM_REPLY_REFRESH_INTERVAL, true);
        }
        Forum.model.cancelReplyEdit();
    }

    static isEditing() {
        return Forum.model.getThreadBeingEdited() !== null || Forum.model.getReplyBeingEdited() !== null;
    }

    static getSelectedThreadReplyOffset() {
        return Forum.model.getSelectedThreadReplyOffset();
    }

    static updateSynchronisationInfo(animate) {
        Forum.view.updateSynchronisationInfo(animate);
    }

    static checkCooldown(refreshTempBanValidities) {
        const playerIds = Users.getAuthenticatedPlayerIds();

        if (playerIds.length === 0) {
            return;
        }

        if (refreshTempBanValidities) {
            Caches.getTempBanValidityCache().invalidateAll();
        }

        const time = Math.floor(Date.now() / 1000);
        const eligibleUsernameMap = {};
        for (let i = 0; i < playerIds.length; ++i) {
            eligibleUsernameMap[playerIds[i]] = { eligible: true, cooldown: 0 };
        }

        const detailsPromises = playerIds.map(playerId => {
            return Backend.getPlayerDetails(playerId, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        // FIXME Cooldown should scale with karma.
                        eligibleUsernameMap[result.getPlayerId()].cooldown = result.getLastForumPost() + 30 - time;
                        if (!result.getVerified()) {
                            eligibleUsernameMap[result.getPlayerId()].eligible = false;
                        }
                    } else {
                        eligibleUsernameMap[result].eligible = false;
                    }
                })
                .catch(() => {});
        });
        const tempBanValiditiesPromise = Backend.getNewestTempBanValidities(playerIds, Caches.getTempBanValidityCache())
            .then(result => {
                if (typeof result === "object") {
                    for (const playerId in result) {
                        if (result[playerId] > time) {
                            eligibleUsernameMap[playerId].eligible = false;
                        }
                    }
                }
            })
            .catch(() => {});

        // When we have all responses, update cooldown.
        Promise.all([...detailsPromises, tempBanValiditiesPromise]).then(() => {
            // FIXME Collect this in separate method for reuse.
            // Find minimum eligible cooldown.
            let cooldown = Number.MAX_VALUE;
            for (const playerId in eligibleUsernameMap) {
                if (eligibleUsernameMap[playerId].eligible) {
                    cooldown = Math.min(cooldown, eligibleUsernameMap[playerId].cooldown);
                }
            }
            if (cooldown > 0) {
                Forum.startCooldown(cooldown, true);
            } else {
                Forum.stopCooldown();
            }
        });
    }

    static updateComposeAndStatus(animate, refreshTempBanValidities) {
        const playerIds = Users.getAuthenticatedPlayerIds();

        // Update compose fields.
        if (playerIds.length === 0) {
            Forum.view.updateComposeAndStatus({}, animate);
            return;
        }

        if (refreshTempBanValidities) {
            Caches.getTempBanValidityCache().invalidateAll();
        }

        const time = Math.floor(Date.now() / 1000);
        const eligibleUsernameMap = {};
        for (let i = 0; i < playerIds.length; ++i) {
            eligibleUsernameMap[playerIds[i]] = { eligible: true, unverified: false, tempBanned: false, onCoolDown: false, username: "" };
        }

        const detailsPromises = playerIds.map(playerId => {
            return Backend.getPlayerDetails(playerId, Caches.getPlayerDetailsCache())
                .then(result => {
                    if (typeof result === "object") {
                        eligibleUsernameMap[result.getPlayerId()].username = result.getUsername();
                        if (!result.getVerified()) {
                            eligibleUsernameMap[result.getPlayerId()].eligible = false;
                            eligibleUsernameMap[result.getPlayerId()].unverified = true;
                        }
                        // FIXME Cooldown should scale with karma.
                        if (result.getLastForumPost() + 30 - time > 0) {
                            eligibleUsernameMap[result.getPlayerId()].eligible = false;
                            eligibleUsernameMap[result.getPlayerId()].onCoolDown = true;
                        }
                    } else {
                        eligibleUsernameMap[result].eligible = false;
                    }
                })
                .catch(() => {});
        });
        const tempBanValiditiesPromise = Backend.getNewestTempBanValidities(playerIds, Caches.getTempBanValidityCache())
            .then(result => {
                if (typeof result === "object") {
                    for (const playerId in result) {
                        if (result[playerId] > time) {
                            eligibleUsernameMap[playerId].eligible = false;
                            eligibleUsernameMap[playerId].tempBanned = true;
                        }
                    }
                }
            })
            .catch(() => {});

        // When we have all responses, update compose and status.
        Promise.all([...detailsPromises, tempBanValiditiesPromise]).then(() => {
            Forum.view.updateComposeAndStatus(eligibleUsernameMap, animate);
        });
    }

    static updateContent() {
        const playerIds = Users.getAuthenticatedPlayerIds();

        Forum.updateEditing(playerIds);

        // Update visible content.
        if (Forum.view.getState() === ForumView.STATE_REPLYLIST) {
            if (Forum.model.getTrackingNewestReplies()) {
                Forum.log.debug("REFRESH");
                Forum.model.refreshReplies(Forum.model.getSelectedThread().id);
            } else {
                Forum.log.debug(`LOAD BY ID ${Forum.model.getCurrentReplyWindowOldestId()}`);
                Forum.model.loadRepliesById(
                    Forum.model.getSelectedThread().id,
                    Forum.model.getCurrentReplyWindowOldestId()
                );
            }
        } else if (Forum.model.getTrackingNewestThreads()) {
            Forum.log.debug("REFRESH");
            Forum.model.refreshThreads();
        } else {
            Forum.log.debug(`LOAD BY ID ${Forum.model.getCurrentThreadWindowNewestThreadId()}`);
            Forum.model.loadThreadsById(Forum.model.getCurrentThreadWindowNewestThreadId());
        }

        // This will also update compose and status.
        Forum.checkCooldown(true);
    }

    static updateEditing(playerIds) {
        // Check if any editing should be cancelled due to the last author having logged out.
        const thread = Forum.model.getThreadBeingEdited();
        if (thread) {
            let cancelEdit = true;
            for (let i = 0; i < playerIds.length; ++i) {
                if (playerIds[i] === thread.creator ||
                    playerIds[i] === thread.coCreator1 ||
                    playerIds[i] === thread.coCreator2) {
                    cancelEdit = false;
                    break;
                }
            }

            if (cancelEdit) {
                Forum.cancelThreadEdit();
            }
        }

        const reply = Forum.model.getReplyBeingEdited();
        if (reply) {
            let cancelEdit = true;
            for (let i = 0; i < playerIds.length; ++i) {
                if (playerIds[i] === reply.creator ||
                    playerIds[i] === reply.coCreator1 ||
                    playerIds[i] === reply.coCreator2) {
                    cancelEdit = false;
                    break;
                }
            }

            if (cancelEdit) {
                Forum.cancelReplyEdit();
            }
        }
    }

    static startThreadSynchronisation(seconds, animate) {
        Forum.synchronising = true;
        Forum.synchronisationCountdown = seconds;

        if (Forum.replyListSyncInterval) {
            clearInterval(Forum.replyListSyncInterval);
            Forum.replyListSyncInterval = null;
        }

        if (!Forum.threadListSyncInterval) {
            Forum.threadListSyncInterval = setInterval(
                () => {
                    Forum.countThreadSynchronisation();
                },
                1000
            );

            Forum.updateSynchronisationInfo(animate);
        }
    }

    static countThreadSynchronisation() {
        --Forum.synchronisationCountdown;
        if (Forum.synchronisationCountdown <= 0) {
            Forum.refreshThreads();
            Forum.updateSynchronisationInfo(true);
        } else {
            Forum.updateSynchronisationInfo(false);
        }
    }

    static startReplySynchronisation(seconds, animate) {
        Forum.synchronising = true;
        Forum.synchronisationCountdown = seconds;

        if (Forum.threadListSyncInterval) {
            clearInterval(Forum.threadListSyncInterval);
            Forum.threadListSyncInterval = null;
        }

        if (!Forum.replyListSyncInterval) {
            Forum.replyListSyncInterval = setInterval(
                () => {
                    Forum.countReplySynchronisation();
                },
                1000
            );

            Forum.updateSynchronisationInfo(animate);
        }
    }

    static countReplySynchronisation() {
        --Forum.synchronisationCountdown;
        if (Forum.synchronisationCountdown <= 0) {
            Forum.refreshReplies();
            Forum.updateSynchronisationInfo(true);
        } else {
            Forum.updateSynchronisationInfo(false);
        }
    }

    static stopSynchronisation(animate) {
        Forum.synchronising = false;
        Forum.synchronisationCountdown = 0;

        if (Forum.threadListSyncInterval) {
            clearInterval(Forum.threadListSyncInterval);
            Forum.threadListSyncInterval = null;
        }
        if (Forum.replyListSyncInterval) {
            clearInterval(Forum.replyListSyncInterval);
            Forum.replyListSyncInterval = null;
        }

        Forum.updateSynchronisationInfo(animate);
    }

    static getSynchronisationText() {
        let result = "";
        if (Forum.synchronisationCountdown > 0) {
            result = `in ${Forum.synchronisationCountdown} second${Forum.synchronisationCountdown === 1 ? "" : "s"}`;
        } else {
            result = "now";
        }
        return result;
    }

    static isSynchronising() {
        return Forum.synchronising;
    }

    static startCooldown(seconds, animate) {
        Forum.cooldown = seconds;

        if (Forum.cooldownInterval) {
            clearInterval(Forum.cooldownInterval);
            Forum.cooldownInterval = null;
        }

        Forum.cooldownInterval = setInterval(
            () => {
                Forum.countCooldown();
            },
            1000
        );

        Forum.updateComposeAndStatus(animate, false);
    }

    static stopCooldown() {
        Forum.cooldown = 0;
        if (Forum.cooldownInterval) {
            clearInterval(Forum.cooldownInterval);
            Forum.cooldownInterval = null;
        }

        Forum.updateComposeAndStatus(true, false);
    }

    static countCooldown() {
        --Forum.cooldown;
        if (Forum.cooldown <= 0) {
            clearInterval(Forum.cooldownInterval);
            Forum.cooldownInterval = null;
            Forum.updateComposeAndStatus(true, false);
        } else {
            Forum.updateComposeAndStatus(false, false);
        }
    }

    static getCooldownText() {
        const result = `${Forum.cooldown} second${Forum.cooldown === 1 ? "" : "s"}`;
        return result;
    }

    static isCooledDown() {
        return Forum.cooldown <= 0;
    }

    static editForumReply() {
        const threadId = Forum.model.getSelectedThread().id;
        const replyId = Forum.model.getReplyBeingEdited().id;
        // FIXME Supply the message to the function to decrease coupling.
        const message = $(".reply .edit:visible textarea").val().trim();
        // Don't perform input validation on the client,
        // to avoid inconsistencies between server and client
        // validation
        Backend.editForumReply(threadId, replyId, message)
            .then(result => {
                if (typeof result === "object") {
                    if (Forum.model.getTrackingNewestReplies()) {
                        Forum.startReplySynchronisation(UIConstants.FORUM_REPLY_REFRESH_INTERVAL, true);
                    }
                    Forum.model.finishReplyEdit(result);
                } else {
                    TankTrouble.ErrorBox.show(result);
                }
            });
    }

    static editForumThread() {
        const threadId = Forum.model.getThreadBeingEdited().id;
        // FIXME Supply the header and message to the function to decrease coupling.
        const header = $(".thread .edit:visible input").val().trim();
        const message = $(".thread .edit:visible textarea").val().trim();
        // Don't perform input validation on the client,
        // to avoid inconsistencies between server and client
        // validation
        Backend.editForumThread(threadId, header, message)
            .then(result => {
                if (typeof result === "object") {
                    if (Forum.model.getTrackingNewestThreads()) {
                        Forum.startThreadSynchronisation(UIConstants.FORUM_THREAD_REFRESH_INTERVAL, true);
                    }
                    if (Forum.model.getTrackingNewestReplies()) {
                        Forum.startReplySynchronisation(UIConstants.FORUM_REPLY_REFRESH_INTERVAL, true);
                    }
                    Forum.model.finishThreadEdit(result);
                } else {
                    TankTrouble.ErrorBox.show(result);
                }
            });
    }

    static createForumReply() {
        const threadId = Forum.model.getSelectedThread().id;
        // FIXME Supply the message to the function to decrease coupling.
        const message = $("#repliesWrapper .compose textarea").val().trim();
        $("#createReplyButton").prop("disabled", true);
        // Don't perform input validation on the client,
        // to avoid inconsistencies between server and client
        // validation
        Backend.createForumReply(threadId, message, Users.getAuthenticatedPlayerIds(), Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "number") {
                    Forum.refreshReplies();
                    Forum.startCooldown(result, true);
                    $("#repliesWrapper .compose textarea").val("");
                } else {
                    TankTrouble.ErrorBox.show(result);
                }
            })
            .finally(() => {
                $("#createReplyButton").prop("disabled", false);
            });
    }

    static createForumThread() {
        /**
         *
         * @type {string}
         */
        // FIXME Supply the header and message to the function to decrease coupling.
        const header = $("#threadsWrapper .compose input").val().trim();
        const message = $("#threadsWrapper .compose textarea").val().trim();
        $("#createThreadButton").prop("disabled", true);
        // Don't perform input validation on the client,
        // to avoid inconsistencies between server and client
        // validation
        Backend.createForumThread(header, message, Users.getAuthenticatedPlayerIds(), Caches.getPlayerDetailsCache())
            .then(result => {
                if (typeof result === "number") {
                    Forum.refreshThreads();
                    Forum.startCooldown(result, true);
                    $("#threadsWrapper .compose input").val("");
                    $("#threadsWrapper .compose textarea").val("");
                } else {
                    TankTrouble.ErrorBox.show(result);
                }
            })
            .finally(() => {
                $("#createThreadButton").prop("disabled", false);
            });
    }

    static toggleThreadLike(threadId) {
        // Obtain current like state.
        const liked = $(`#thread-${threadId}`).hasClass("liked");

        Backend.setForumThreadLiked(threadId, !liked)
            .then(result => {
                // FIXME Handle error messages
                if (typeof result === "object") {
                    Forum.model.updateThread(result);
                }
            });
    }

    static toggleReplyLike(threadId, replyId) {
        // Obtain current like state.
        const liked = $(`#reply-${replyId}`).hasClass("liked");

        Backend.setForumReplyLiked(threadId, replyId, !liked)
            .then(result => {
                // FIXME Handle error messages
                if (typeof result === "object") {
                    Forum.model.updateReply(result);
                }
            });
    }

    static setForumThreadApproved(threadId, value) {
        Backend.setForumThreadApproved(threadId, value)
            .then(result => {
                // FIXME Handle error messages
                if (typeof result === "object") {
                    Forum.model.updateThread(result);
                }
            });
    }

    static setForumThreadLocked(threadId, value) {
        Backend.setForumThreadLocked(threadId, value)
            .then(result => {
                // FIXME Handle error messages
                if (typeof result === "object") {
                    Forum.model.updateThread(result);
                }
            });
    }

    static setForumThreadPinned(threadId, value) {
        Backend.setForumThreadPinned(threadId, value)
            .then(result => {
                // FIXME Handle error messages
                if (typeof result === "object") {
                    Forum.model.updateThread(result);
                }
            });
    }

    static setForumThreadDeleted(threadId, value) {
        Backend.setForumThreadDeleted(threadId, value)
            .then(result => {
                // FIXME Handle error messages
                if (typeof result === "object") {
                    Forum.model.updateThread(result);
                }
            });
    }

    static setForumThreadBanned(threadId, value) {
        Backend.setForumThreadBanned(threadId, value)
            .then(result => {
                // FIXME Handle error messages
                if (typeof result === "object") {
                    Forum.model.updateThread(result);
                }
            });
    }

    static setForumReplyApproved(threadId, replyId, value) {
        Backend.setForumReplyApproved(threadId, replyId, value)
            .then(result => {
                // FIXME Handle error messages
                if (typeof result === "object") {
                    Forum.model.updateReply(result);
                }
            });
    }

    static setForumReplyDeleted(threadId, replyId, value) {
        Backend.setForumReplyDeleted(threadId, replyId, value)
            .then(result => {
                // FIXME Handle error messages
                if (typeof result === "object") {
                    Forum.model.updateReply(result);
                }
            });
    }

    static setForumReplyBanned(threadId, replyId, value) {
        Backend.setForumReplyBanned(threadId, replyId, value)
            .then(result => {
                // FIXME Handle error messages
                if (typeof result === "object") {
                    Forum.model.updateReply(result);
                }
            });
    }

    static init() {
        Forum.model = new ForumModel();
        Forum.view = new ForumView(Forum.model);
        Forum.model.addThreadListChangeListener(Forum.view);
        Forum.model.addReplyListChangeListener(Forum.view);

        Commands.register("--forum.select-thread", (button, data) => { Forum.selectThread(data.threadId); });
        Commands.register("--forum.toggle-thread-like", (button, data) => { Forum.toggleThreadLike(data.threadId); });
        Commands.register("--forum.start-thread-edit", (button, data) => { Forum.startThreadEdit(data.threadId); });
        Commands.register("--forum.accept-thread-edit", (button, data) => { Forum.editForumThread(); });
        Commands.register("--forum.cancel-thread-edit", (button, data) => { Forum.cancelThreadEdit(); });
        Commands.register("--forum.set-thread-approved", (button, data) => { Forum.setForumThreadApproved(data.threadId, data.value); });
        Commands.register("--forum.set-thread-locked", (button, data) => { Forum.setForumThreadLocked(data.threadId, data.value); });
        Commands.register("--forum.set-thread-pinned", (button, data) => { Forum.setForumThreadPinned(data.threadId, data.value); });
        Commands.register("--forum.set-thread-deleted", (button, data) => { Forum.setForumThreadDeleted(data.threadId, data.value); });
        Commands.register("--forum.set-thread-banned", (button, data) => { Forum.setForumThreadBanned(data.threadId, data.value); });
        Commands.register("--forum.toggle-reply-like", (button, data) => { Forum.toggleReplyLike(data.threadId, data.replyId); });
        Commands.register("--forum.start-reply-edit", (button, data) => { Forum.startReplyEdit(data.replyId); });
        Commands.register("--forum.accept-reply-edit", (button, data) => { Forum.editForumReply(); });
        Commands.register("--forum.cancel-reply-edit", (button, data) => { Forum.cancelReplyEdit(); });
        Commands.register("--forum.set-reply-approved", (button, data) => { Forum.setForumReplyApproved(data.threadId, data.replyId, data.value); });
        Commands.register("--forum.set-reply-deleted", (button, data) => { Forum.setForumReplyDeleted(data.threadId, data.replyId, data.value); });
        Commands.register("--forum.set-reply-banned", (button, data) => { Forum.setForumReplyBanned(data.threadId, data.replyId, data.value); });
        Commands.register("--forum.leave-thread", (button, data) => { Forum.leaveThread(); });
        Commands.register("--forum.create-thread", (button, data) => { Forum.createForumThread(); });
        Commands.register("--forum.create-reply", (button, data) => { Forum.createForumReply(); });
    }

    static initForum() {
        const forumData = $("#forumData").text();
        if (forumData) {
            Forum.updateForum(JSON.parse(forumData));
        }

        Forum.view.hideComposeStatusAndSynchronisationInfo();

        UIPlayerPanel.insertPanel($("#playerPanel"), null);

        Utils.addAutomaticTextAreaResize($(".compose textarea"));

        $(".forum .button.back").tooltipster({ side: "top", distance: 12 });

        Users.addEventListener(Forum._authenticationEventHandler, this);

        Forum.checkCooldown(true);
    }

    static updateForum(data) {
        // FIXME Can this cause issues?
        //Forum.stopSynchronisation(true);

        Forum.view.setSuppressNextUpdateAnimation();
        Forum.view.setReplaceNextHistory();
        if (data.threadId && data.id) {
            Forum.model.loadRepliesById(Number(data.threadId), Number(data.id));
        } else if (data.threadId) {
            Forum.model.loadNewestReplies(Number(data.threadId));
        } else if (data.id) {
            Forum.model.loadThreadsById(Number(data.id));
        } else {
            Forum.model.loadNewestThreads();
        }
    }

    static deinitForum() {
        UIPlayerPanel.removePanel();

        Utils.removeAutomaticTextAreaResize($(".compose textarea"));

        Forum.stopSynchronisation(false);

        Users.removeEventListener(Forum._authenticationEventHandler, this);
    }

    static _authenticationEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            case Users.EVENTS.PLAYER_DEAUTHENTICATED:
            case Users.EVENTS.GUEST_ADDED:
            case Users.EVENTS.GUESTS_ADDED:
            case Users.EVENTS.GUEST_REMOVED:
            case Users.EVENTS.GUEST_SIGNED_UP:
            {
                Forum.updateContent();
                break;
            }
        }
    }
}
