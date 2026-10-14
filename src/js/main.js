import {initialiseMobileControls} from "./mobile-init.js";
import { initialiseRooms } from "./rooms-init.js";
import { AIs } from "./tt/ais.js";
import { TankTrouble } from "./tanktrouble.js";
import { AchievementManager } from "./achievementmanager.js";
import { AdminOverlayUploadImage } from "./adminoverlayuploadimage.js";
import { AdvertisementManager } from "./advertisementmanager.js";
import { AnalyticsManager } from "./analyticsmanager.js";
import { AudioManager } from "./audiomanager.js";
import { ClientManager } from "./clientmanager.js";
import { ClipboardManager } from "./clipboardmanager.js";
import { Commands } from "./commands.js";
import { Content } from "./content.js";
import { DeletedEmailsManager } from "./deletedemailsmanager.js";
import { FocusManager } from "./focusmanager.js";
import { Forum } from "./forum.js";
import { GameManager } from "./gamemanager.js";
import { IFrameManager } from "./iframemanager.js";
import { Inputs } from "./inputs.js";
import { OverlayManager } from "./overlaymanager.js";
import { PremiumManager } from "./premiummanager.js";
import { QualityManager } from "./qualitymanager.js";
import { RejectedUsernamesManager } from "./rejectedusernamesmanager.js";
import { ResizeManager } from "./resizemanager.js";
import { Shop } from "./shop.js";
import { TutorialManager } from "./tutorialmanager.js";
import { UIConstants } from "./tt/ui/uiconstants.js";
import { Users } from "./users.js";
import { Utils } from "./utils.js";
import { VirtualShop } from "./virtualshop.js";

const main = () => {
    // ********************************************************
    // Load webfonts explicitly for Phaser
    // ********************************************************
    document.fonts.load("1em TankTrouble");

    // ********************************************************
    // Load data from cookies/session into all required modules
    // ********************************************************

    // Load nag information into IFrameManager.
    IFrameManager.loadNagInformation();

    // Load ad information into AdvertisementManager.
    AdvertisementManager.loadAdInformation();

    // Load audio settings into AudioManager.
    AudioManager.loadAudioSettings();

    // Load quality settings into QualityManager.
    QualityManager.loadQualitySettings();

    // Load authenticated users and guest users list into Users.
    Users.loadAuthenticatedUsers();
    Users.loadGuestUsers();
    Users.loadHighestGm();
    Users.loadAdminRoles();
    Users.loadAdmissionToken();

    // Load server list and client settings into ClientManager.
    ClientManager.loadAvailableServers();
    ClientManager.loadClientSettings();

    // Load input set assignments into Inputs.
    Inputs.loadInputSetAssignments(Users.getAllPlayerIds());

    // Load initial premium present state.
    PremiumManager.loadPremiumPresent();

    // Load initial achievement unlocks.
    AchievementManager.loadInitialAchievementUnlocks();

    // ****************************
    // Initialise remaining modules
    // ****************************

    Utils.initTooltips();
    Users.init();
    IFrameManager.init();
    FocusManager.init();
    OverlayManager.init(location.hash);
    AnalyticsManager.init("G-RTRPY14JZM");
    ResizeManager.init();
    TutorialManager.init();
    ClientManager.init();
    Commands.init();
    ClipboardManager.init();
    AdminOverlayUploadImage.init();
    Forum.init();
    Shop.init();
    VirtualShop.init();
    AchievementManager.init();
    GameManager.init();
    PremiumManager.init();
    Inputs.init();
    AIs.init();
    RejectedUsernamesManager.init();
    DeletedEmailsManager.init();
    QualityManager.init();
    AudioManager.init();

    // *******************
    // Setup UI components
    // *******************

    // Set up UI constants.
    UIConstants.scaleForPixelRatio();

    // Set up scrapyard.
    TankTrouble.Scrapyard.init();

    // Set up statistics.
    TankTrouble.Statistics.init();

    // Set up messages.
    TankTrouble.Messages.init();

    // Set up settings, music and sound buttons
    TankTrouble.SettingsButton.init();
    TankTrouble.MusicButton.init();
    TankTrouble.SoundButton.init();
    TankTrouble.SettingsBox.init();

    TankTrouble.ChatBox.init();

    TankTrouble.AdminPlayerLookupOverlay.init();
    TankTrouble.AdminMessagesOverlay.init();
    TankTrouble.AdminShopOverlay.init();
    TankTrouble.AdminChatLogOverlay.init();
    TankTrouble.AdminVirtualShopItemDetailsOverlay.init();
    TankTrouble.AdminNewsOverlay.init();
    TankTrouble.WallOfFame.init();

    // ***********************
    // Initialise main content
    // ***********************

    // Initialise the content.
    Content.init();

    // Finally, show cookie box.
    if (!TankTrouble.CookieBox.checkForCookie()) {
        TankTrouble.CookieBox.show();
    }

    // And show any initial overlay specified in the request.
    if (OverlayManager.hasInitialOverlay()) {
        OverlayManager.enqueueInitialOverlay();
    }

    // And enqueue any initial achievements.
    AchievementManager.enqueueInitialAchievementUnlocks();
};

document.addEventListener("DOMContentLoaded", () => {
    main();
    initialiseRooms();
    initialiseMobileControls();
    // MUAAAHAAHA - they'll never find this!

});
