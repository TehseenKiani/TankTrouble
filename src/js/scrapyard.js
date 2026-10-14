import { Scrapyard } from "./tt/ui/scrapyard/scrapyard.js";
import { TankTrouble } from "./tanktrouble.js";

TankTrouble.Scrapyard = {
    init() {
        //TankTrouble.Scrapyard.loadScraps();
        const scrapyardElement = $("#scrapyardSnippet .content");

        const config = {
            width: scrapyardElement.width(),
            height: scrapyardElement.height(),
            renderer: Phaser.WEBGL,
            parent: scrapyardElement[0],
            transparent: true,
            enableDebug: false
        };
        const phaserInstance = new Phaser.Game(config);

        phaserInstance.state.add("Boot", new Scrapyard.UIBootState());
        phaserInstance.state.add("Preload", new Scrapyard.UIPreloadState());
        phaserInstance.state.add("Main", new Scrapyard.UIMainState());

        phaserInstance.state.start("Boot");
    }
};
