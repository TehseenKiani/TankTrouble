import { Backend } from "./backend.js";
import { UIPlayerPanel } from "./tt/ui/playerpanel/uiplayerpanel.js";
import { Users } from "./users.js";

export class News {
    static initNews() {
        const newsData = $("#newsData").text();
        if (newsData) {
            News.load(JSON.parse(newsData).postId);
        }

        UIPlayerPanel.insertPanel($("#playerPanel"), null);
        Users.addEventListener(News._authenticationEventHandler, this);
    }

    static deinitNews() {
        UIPlayerPanel.removePanel();
        Users.removeEventListener(News._authenticationEventHandler, this);
    }

    static load(postId) {
        Backend.getNewsPosts()
            .then(result => {
                if (typeof result === "object") {
                    $("#newsPostsWrapper").empty();
                    result.forEach(newsPost => {
                        $("#newsPostsWrapper").append($(newsPost.html.newsPost));
                    });

                    if (postId !== undefined) {
                        const selectedPost = $("#newsPostsWrapper").find(`#newsPost-${postId}`);
                        if (selectedPost.length > 0) {
                            if (selectedPost.index() >= 1) {
                                $(document).scrollTop(selectedPost.offset().top - 20);
                            } else {
                                $(document).scrollTop(0);
                            }
                        }
                    }
                }

                $(".news.panelWrapper").removeClass("pending");
            });
    }

    static updateNews(data) {
        if (data.postId) {
            const selectedPost = $("#newsPostsWrapper").find(`#newsPost-${data.postId}`);
            if (selectedPost.length > 0) {
                if (selectedPost.index() >= 1) {
                    $(document).scrollTop(selectedPost.offset().top - 20);
                } else {
                    $(document).scrollTop(0);
                }
            }
        }
    }

    static _authenticationEventHandler(self, evt, data) {
        switch (evt) {
            case Users.EVENTS.PLAYER_AUTHENTICATED:
            case Users.EVENTS.PLAYER_DEAUTHENTICATED:
            {
                News.load();
                break;
            }
        }
    }
}
