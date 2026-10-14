import { TTClient } from "./tt/ttclient.js";
import { AdvertisementManager } from "./advertisementmanager.js";
import { AnalyticsManager } from "./analyticsmanager.js";
import { Backend } from "./backend.js";
import { ClientManager } from "./clientmanager.js";
import { Forum } from "./forum.js";
import { GameManager } from "./gamemanager.js";
import { HistoryManager } from "./historymanager.js";
import { News } from "./news.js";
import { OverlayManager } from "./overlaymanager.js";
import { ResizeManager } from "./resizemanager.js";
import { Shop } from "./shop.js";

export class Content {
    static activeTab = null;
    static TABS = ["game", "shop", "news", "forum", "privacy"];

    static init() {
        ClientManager.getClient().addEventListener(Content._clientEventHandler, Content);

        if (history.scrollRestoration) {
            // We will handle restoration of scroll position manually.
            history.scrollRestoration = "manual";
        }

        $(window).on("popstate", event => {
            // Ignore initial pop state from some browsers (e.g. Safari).
            if (!event.originalEvent.state) {
                return;
            }

            if (event.originalEvent.state) {
                if (event.originalEvent.state.tab) {
                    if (event.originalEvent.state.tab !== Content.activeTab) {
                        Content._getPrimaryContent(event.originalEvent.state.tab, location.pathname + location.search);
                        Content._setActiveTab(event.originalEvent.state.tab);
                    } else {
                        Content._updatePage(event.originalEvent.state.tab, event.originalEvent.state.data);
                    }
                }
            } else {
                window.location = location.href;
            }
        });

        $(document).on("click.navigation", "a.managedNavigation[href]", event => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            const anchor = event.currentTarget;
            if (anchor.origin !== location.origin || anchor.target || anchor.hasAttribute("download")) {
                return;
            }

            const [, tab] = anchor.pathname.split("/");
            if (!Content.TABS.includes(tab)) {
                return;
            }

            event.preventDefault();

            if (OverlayManager.isOverlayShowing()) {
                OverlayManager.popOverlay();
            }

            const data = Object.fromEntries(new URLSearchParams(anchor.search));
            Content.navigateToTab(tab, anchor.pathname + anchor.search, data);
        });

        Content._initPage(g_initialTab);
        Content._setActiveTab(g_initialTab);
        HistoryManager.updateTab(g_initialTab, location.pathname + location.search, g_initialData, true);
    }

    /**
     * Do navigation, by updating primary content area to load content from the
     * specified tab. Additionally, a path must be provided, to allow it to get pushed
     * to the browser history. The path (really an absolute URI like this:
     * /forum/thread-7/?param1=1&param2=2) must contain the complete URI (no domain)
     * to push to the browser history, including parameters, anchors etc.
     * The URI is parsed by the JSON-RPC server to determine what content to deliver
     *
     * @param {string} tab The tab to use
     * @param {string} path The URI used to determine what content to return
     */
    static navigateToTab(tab, path, data) {
        if (tab !== Content.activeTab) {
            Content._getPrimaryContent(tab, path);
            Content._setActiveTab(tab);
        } else {
            Content._updatePage(tab, data);
        }
        HistoryManager.updateTab(tab, path, data);
    }

    static getActiveTab() {
        return Content.activeTab;
    }

    static _getPrimaryContent(tab, path) {
        Content._deinitPage(Content.activeTab);
        $("#mainContent").empty();

        Backend.getPrimaryContent(tab, path)
            .then(content => {
                $("#mainContent").html(content);
                Content._initPage(tab);
            });
    }

    static _setActiveTab(tab) {
        Content.activeTab = tab;
        AnalyticsManager.trackPageView(`/${tab}`);
        $(".tab").removeClass("selected");
        $(`#${tab}Tab`).addClass("selected");
    }

    static _initPage(tab) {
        // Place everything properly.
        ResizeManager.refresh();
        // Refresh banner ads.
        if (AdvertisementManager.shouldPresentBanner()) {
            AdvertisementManager.requestBanner($("#leftBanner").find(".banner"), "4740394483", false);
            AdvertisementManager.requestBanner($("#rightBanner").find(".banner"), "6217127687", false);
        }
        // Initialise page.
        switch (tab) {
            case "news":
            {
                News.initNews();
                break;
            }
            case "forum":
            {
                Forum.initForum();
                break;
            }
            case "game":
            {
                GameManager.initGame();
                break;
            }
            case "shop":
            {
                Shop.initShop();
                break;
            }
        }

        // MUAAAHAAHA - they'll never find this!

    }

    static _updatePage(tab, data) {
        switch (tab) {
            case "news":
            {
                News.updateNews(data);
                break;
            }
            case "forum":
            {
                Forum.updateForum(data);
                break;
            }
            case "game":
            {
                break;
            }
            case "shop":
            {
                Shop.updateShop(data);
                break;
            }
        }
    }

    static _deinitPage(tab) {
        switch (tab) {
            case "news":
            {
                News.deinitNews();
                break;
            }
            case "forum":
            {
                Forum.deinitForum();
                break;
            }
            case "game":
            {
                GameManager.deinitGame();
                break;
            }
            case "shop":
            {
                Shop.deinitShop();
                break;
            }
        }
    }

    static _shutdown() {
        Content._deinitPage(Content.activeTab);
        $("#mainContent").empty();
    }

    static _clientEventHandler(self, evt, data) {
        switch (evt) {
            case TTClient.EVENTS.SHUTDOWN:
            {
                Content._shutdown();
                break;
            }
        }
    }
}
