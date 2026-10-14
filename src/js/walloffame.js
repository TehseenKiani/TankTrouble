import { ArrayUtils } from "./tt/arrayutils.js";
import { TankTrouble } from "./tanktrouble.js";
import { Backend } from "./backend.js";
import { Commands } from "./commands.js";
import { GameSession } from "./gamesession.js";
import { Images } from "./images.js";

TankTrouble.WallOfFame = {

    init() {
        Commands.register("--wall-of-fame.open", () => {
            TankTrouble.WallOfFame.show();
        });
    },

    // jQuery objects
    wallOfFame: null,

    // State
    initialised: false,

    kickstarterBackers: [
        "Kai&nbsp;V.",
        "Søren&nbsp;Boll&nbsp;Overgaard",
        "Binke",
        "Clemens",
        "Anne&nbsp;Sofie",
        "newthy32",
        "Elin",
        "Fraser",
        "supervolcano",
        "Emil&nbsp;Rosdam",
        "fogo76",
        "LittleStorm",
        "jakob&nbsp;baungaard",
        "Elgen",
        "Rishi",
        "jokerfury9",
        "Fillipuster",
        "anna&nbsp;nørgaard",
        "itay&nbsp;hsh",
        "ben314",
        "Grey",
        "ZuperFly",
        "Thomas",
        "VictoryRun",
        "Phil",
        "Reuven&nbsp;Cooper",
        "Grebdivh",
        "Sheep2000",
        "JasonLukeBarber",
        "Julian&nbsp;E.",
        "DStecher",
        "TheUSSR",
        "Roo",
        "KoreanEyeCandy",
        "Shockwave44",
        "René&nbsp;Poulsen",
        "adrianozakka",
        "joebech",
        "omfgwtfbbq",
        "sumtin_baws",
        "Jonathan&nbsp;Lynch&nbsp;(jlynch60)",
        "Playful&nbsp;Invention&nbsp;Company",
        "Nit_Ram",
        "Foxter",
        "AshTheDinosaur",
        "simolo12",
        "jorgen",
        "mauj",
        "Xuequinox",
        "Blue",
        "Kim&nbsp;Bille",
        "THJ113",
        "Dirty_Poul",
        "{-&nbsp;Yomap&nbsp;The&nbsp;Tank&nbsp;-}",
        "Ollie&nbsp;M",
        "Zulc",
        "Luca",
        "emeric2003",
        "Brygge_Cowboy",
        "Spfcuk",
        "Duffme",
        "TopHatGuy",
        "Martin",
        "RidoKilos",
        "TheTobinator",
        "MonkeysWithGuns",
        "Itsajack",
        "Lloydy56",
        "Mason&nbsp;Wang&nbsp;(tvnky)",
        "SirFreddy",
        "badgerpower",
        "kittenkilla",
        "Jakob&nbsp;Thauminator",
        "Marius",
        "Tankiepoofs",
        "Sebastian",
        "SwagRanger45",
        "Darkwall",
        "bipsblazerod",
        "Greg&nbsp;\"Mark&nbsp;Your&nbsp;Target\"&nbsp;H",
        "bohoej",
        "MikO",
        "JohnTheRevelator",
        "PurpleGnome",
        "Kirkegaard",
        "Jon",
        "Annhilator",
        "Luke&nbsp;Filewalker",
        "wheeljack160",
        "Awesomer002",
        "Tristan&nbsp;L.&nbsp;(rYx0)",
        "Emil",
        "DCFBueller"
    ],

    slackerBackers: [
        "00DOG",
        "603rdCamouflageEngineers",
        "adabaccio",
        "adasiek257",
        "afroman1310",
        "AgentOfShild",
        "AkaDex",
        "AlanDu",
        "alexis9",
        "alienatly",
        "Alpha_KItten_817",
        "Alpha_Wolf_817",
        "Androido",
        "areyoukiddingme",
        "Argontrax",
        "Army94",
        "arvid5",
        "Atjellovic",
        "atuli1",
        "AwesomeOne554",
        "AXTECK456",
        "Azimuth",
        "baconcaca",
        "BanDrown",
        "bangbangshoota",
        "Battle101",
        "BattleArena123",
        "BeefMaster",
        "ben314s_TT_Bot",
        "Bentebent",
        "BerlingoDeLait",
        "Big-Boy01",
        "bipsblazerod",
        "Blackactor",
        "BlueTankWho",
        "BOBYMCBOBO",
        "Bossabot",
        "BradPitt",
        "BRAIDEN24",
        "brotherx25",
        "burritoman8u",
        "Cameron3928",
        "cashleeban",
        "cayer77",
        "Cgene342551",
        "ChainSawRipStik",
        "chase1522",
        "chief23",
        "ChompyEatsYou",
        "CJCtioN",
        "CKGaming",
        "CloakAndDagger",
        "Cold_Steel",
        "concoror",
        "coolmaltank",
        "COOLRANCH",
        "coyoty8",
        "crazygamingaj123",
        "creative5",
        "critian",
        "Cycloniccornet",
        "dankshank",
        "DanMan757",
        "darknessscythe",
        "DarkSonor",
        "darkspines32",
        "darkwall",
        "darthtank101",
        "DATM_Mrk_15",
        "DatNoHand",
        "deadboyscout11",
        "death-king",
        "DeathAdder1738",
        "Deathzero168",
        "Death_Lord",
        "dedrataqna",
        "dembonez72",
        "Destructortime",
        "diddymonster06",
        "djnick27",
        "DrakonicOverlord",
        "DR_BOON",
        "Dr_Guppy",
        "dumoil",
        "Dusan427",
        "eggbox1",
        "Eggowaffled",
        "ElJoshua",
        "emerald899",
        "emidnite",
        "Epicado",
        "ethanattack3",
        "evol777",
        "Exonaol",
        "Extoiminator",
        "Felix20",
        "FightBiscuit",
        "fillwithjoy1",
        "FLETT77",
        "fluffernutters",
        "FOCH_155",
        "Foreshadower",
        "FREDDIMC",
        "frynd",
        "Gaddyyy",
        "galactas",
        "Gameboyeli",
        "GameStomp",
        "geo11",
        "george8888",
        "Gertrud",
        "getreckt",
        "GhostRider2006",
        "GhoxenG",
        "gimack46",
        "Glenwing",
        "Gnome_Child",
        "Goc",
        "goodguy333",
        "gravitytank12",
        "grecortaker",
        "GrimTapestry",
        "H4770",
        "HamesTurtle",
        "HCVlogs",
        "heith1",
        "HellYeah22",
        "holest",
        "HotJordan101",
        "howler66",
        "hrovatic",
        "Hubba27",
        "IAteYourKar",
        "ICEMAN5435",
        "IHateTrump",
        "InfiniteDollars",
        "j0kky",
        "jack123b",
        "jaegarpanzer",
        "JahnTheMan",
        "JayMineCrafton",
        "Jazzer05",
        "JenkisU",
        "jeyrusek",
        "JHvsKD",
        "jimmy50",
        "JimmyMa",
        "Jordanus",
        "justyce2001",
        "jvollmer123",
        "kanon",
        "KETELSEN",
        "KIDZZ",
        "kill-sean",
        "KILLERBEEF",
        "King__B",
        "Kiss-my-Axe",
        "Klaytonomore",
        "Konrad69",
        "Kriskb",
        "krysonfleek32",
        "KylesRevenge",
        "laikacrusher",
        "LegendInRed",
        "LittlePicnic",
        "logicool2",
        "lolszakjak",
        "lordnorbert",
        "lorenzo9",
        "LouisVive",
        "LukeFilewalker",
        "LuLuPop",
        "Lykken",
        "MADDZOMBIE",
        "mam5",
        "markinbright",
        "massyl768",
        "MasterFaith",
        "MAXWELL14050",
        "meme08",
        "mh1234567890",
        "MostEpic",
        "MrAlpaca",
        "mrbuttcheeks492",
        "MrFLurgi",
        "mudpaper",
        "mwb12345",
        "MX423_",
        "nathanielrules12",
        "natswagx",
        "Ngoat",
        "NicoAnisimov",
        "NighTGosT",
        "Nightmarionne",
        "nikio",
        "nikothomas",
        "nikryder",
        "NinjaCatGuy",
        "Nit_Ram",
        "Nuclear_Humus",
        "oliverisepic",
        "OppaTanknamStyle",
        "osiris257",
        "ozo1234",
        "Panzer36",
        "pariskilla",
        "PedroTheFrog",
        "PEGNAS",
        "pepsi150707",
        "pikachu3456",
        "pointfire",
        "popcorngun",
        "powerman592",
        "Putting",
        "QK9",
        "Quasar11",
        "QuickNinja64",
        "Raider_dwn_undr",
        "RandomDean",
        "Raptorr",
        "rarewave",
        "Rattlesniper",
        "Redrobbo",
        "Redwind",
        "reecerock123",
        "ReganHyde",
        "Rektikel",
        "Retroman237",
        "riley635",
        "RoboDucker",
        "rogueshadow",
        "Romanior",
        "Rozu",
        "SalemDeath",
        "salope01",
        "salve",
        "sandro123100",
        "SelfDestructer",
        "ShrekTank",
        "siam896",
        "Silent__Hill",
        "SkyVirusYT",
        "SlaYN",
        "Sliceomatic",
        "somalibantank",
        "speedybuffay",
        "spikeman12345678",
        "Splizard",
        "sqarter",
        "steven369",
        "STGaming",
        "Sulphate",
        "SuperGavi",
        "SuperscizorX",
        "swagboy1222",
        "SwagMonster45",
        "SwagPants",
        "SwagRanger45",
        "SWoGG",
        "tadyjsem",
        "TankCam",
        "TankDestroyer21x",
        "tanker1213",
        "TANKSWAG1222",
        "tanktron87",
        "TankTronny",
        "Tankwitguns123",
        "Tektank",
        "thank12",
        "Thauminator",
        "The-J-Recker",
        "TheAnailator",
        "TheBiggestTank",
        "thebrickwall",
        "TheCuruptedTank",
        "TheDumbIdiot",
        "TheGingaNinja",
        "themightyslayer",
        "TheOnlyDoterGod",
        "TheSamVTA",
        "The_Mining_COD",
        "timmy50",
        "tobi4644",
        "Top-Ranked-Tank",
        "Trabantt",
        "TrophyPRO",
        "Tuisucks",
        "turnuptheheat452",
        "TuxCookie",
        "txsurfer01",
        "tygr5321",
        "Ueis",
        "UltronAnchor",
        "ViciousLooRoll",
        "Volleyballmane",
        "wadd1",
        "wajix",
        "Warriorpablozee",
        "Wesley10",
        "Wheeleer",
        "WhenAnimalsEat",
        "Wingaa",
        "wipzon",
        "Wizzl",
        "WK",
        "WorldDestroyer89",
        "worldsbestcat",
        "Xifong",
        "xRDR",
        "XxbadbroxX",
        "yolocholo",
        "youndscurb",
        "yuby",
        "zackaras12345",
        "zarkiller",
        "zaxman22",
        "ZEDJake",
        "ZERO_GRAVITY",
        "Zerphses",
        "Zexel",
        "Zulc",
        "ZuluKid233",
        "ZzMoleculezzZ",
        "_saviour_"
    ],

    /* Only admins with that has preformed more than 1000 actions enters the wall of fame */
    admins: [
        "1BigBouie",
        "5am",
        "AceHawk",
        "Amplitude",
        "Avenger97",
        "Awesomer002",
        "ben314",
        "BlackHalo",
        "Brawl",
        "CamoKill",
        "captainahvong",
        "commander",
        "Dad",
        "Dalek-Buster",
        "danteallege",
        "dcdeath",
        "draculous",
        "foxter",
        "Gentleman",
        "george8888",
        "Giraffe",
        "Grey",
        "Henrik",
        "jlynch60",
        "Kamikaze",
        "Kerosene",
        "Lichen",
        "Mandilindors",
        "MonkeysWithGuns",
        "moscles25",
        "Mud",
        "NelFusion",
        "newthy32",
        "onion",
        "PurpleGnome",
        "QuickNinja",
        "Redwind",
        "revengexx1",
        "rhak",
        "SavageAimbot",
        "scotto",
        "shockwave44",
        "SoulPanda",
        "Spiros04",
        "supervolcano",
        "TeamJ",
        "TripleStryke",
        "YD109",
        "Zero_Blade",
        "ZuperFly"
    ],

    _initialise() {
        this.wallOfFame = $("<div id='wallOfFame'></div>");
        this.wallOfFame.append(`<img src='${Images.url("wallOfFame/logo.svg")}'>`);
        this.wallOfFame.append(`<img src='${Images.url("wallOfFame/separator.svg")}'>`);
        this.wallOfFame.append(`<img src='${Images.url("wallOfFame/header.svg")}'>`);
        this.wallOfFame.append(`<img src='${Images.url("wallOfFame/separator.svg")}'>`);
        this.wallOfFame.append("<div class='subHeader'>Thanks to</div>");
        this.wallOfFame.append("<div class='backers'>Loading backers</div>");
        this.wallOfFame.append(`<img src='${Images.url("wallOfFame/separator.svg")}'>`);
        this.wallOfFame.append("<div class='subHeader'>TankTrouble Laboratories</div>");
        this.wallOfFame.append("<table class='gameCredits'>\
                                    <tr><td>Head of doomsday weapons</td><td>&nbsp;<span class='separator'>&#x2605;</span>&nbsp;</td><td>Lead Scientist</td></tr>\
                                    <tr><td>Death Ray evangelist</td><td>&nbsp;<span class='separator'>&#x2605;</span>&nbsp;</td><td>Dr. Dimitri</td></tr>\
                                    <tr><td>Scrapyard and secret backdoors</td><td>&nbsp;<span class='separator'>&#x2605;</span>&nbsp;</td><td>Scrapyard Scientist</td></tr>\
                                    <tr><td>Lord of destruction</td><td>&nbsp;<span class='separator'>&#x2605;</span>&nbsp;</td><td>Mads Purup (Purup)</td></tr>\
                                    <tr><td>Bug squasher and maze maestro</td><td>&nbsp;<span class='separator'>&#x2605;</span>&nbsp;</td><td>Brian B. Christensen (bbc)</td></tr>\
                                    <tr><td>Apocalyptic forecaster</td><td>&nbsp;<span class='separator'>&#x2605;</span>&nbsp;</td><td>Søren B. Overgaard (boll2)</td></tr>\
                                    <tr><td>Mad melodist and silly sound effects </td><td>&nbsp;<span class='separator'>&#x2605;</span>&nbsp;</td><td>Johan L. Bramming (SlingChili)</td></tr>\
                                    <tr><td>Space dog and eater of lab rats</td><td>&nbsp;<span class='separator'>&#x2605;</span>&nbsp;</td><td>Laika</td></tr>\
                                    <tr><td>Warhead polisher</td><td>&nbsp;<span class='separator'>&#x2605;</span>&nbsp;</td><td>The Intern</td></tr>\
                                </table>");
        this.wallOfFame.append("<div class='subHeader'>Score</div>");
        this.wallOfFame.append("<div>\"Panzer Polka\"<br>Composed and performed by<br>Johan Lund Bramming</br>");
        this.wallOfFame.append("<div>\"Balalaika Blowout\"<br>Composed and performed by<br>Andreas Bech & Christian Steen Noringriis</br>");
        this.wallOfFame.append("<div>\"Spooktacular O'Clock\"<br>Composed and performed by<br>Mads Hovgaard</br>");
        this.wallOfFame.append("<div class='subHeader'>Retired and active admins</div>");
        this.wallOfFame.append("<div class='admins'></div>");
        this.wallOfFame.append(`<img src='${Images.url("wallOfFame/separator.svg")}'>`);
        this.wallOfFame.append("<div class='postface subHeader'><div>Support the development of TankTrouble and get YOUR name on the wall.<br><a class='managedNavigation' href='/shop'>Support now!</a></div>");
        $("body").append(this.wallOfFame);

        this.wallOfFame.hide();

        // Load backers
        Backend.getBackers()
            .then(result => {
                let backers = [];
                if (Array.isArray(result)) {
                    backers = [...result];
                }
                backers = [...backers, ...this.kickstarterBackers, ...this.slackerBackers];
                this.wallOfFame.find(".backers").html(this._list(backers));
            });

        // Show admins
        this.wallOfFame.find(".admins").html(this._list(this.admins));

        this.wallOfFame.mousedown(event => {
            this.hide();
        });

        this.wallOfFame.on("wheel", event => {
            this.wallOfFame.stop("scroll");
        });

        $(window).resize(event => {
            this._resize();
        });

        this._resize();

        this.initialised = true;
    },

    _list(array) {
        let result = "<span class='separator'>&#x2605;</span>&nbsp;";

        ArrayUtils.shuffle(array);
        ArrayUtils.unique(array);
        for (const key in array) {
            result += `${array[key]} <span class='separator'>&#x2605;</span> `;
        }

        return result;
    },

    show() {
        if (!this.initialised) {
            this._initialise();
        }

        this.wallOfFame.stop("scroll");

        this.wallOfFame.fadeIn({ duration: 500,
            start: () => {
                this.wallOfFame.scrollTop(0);
            },
            complete: () => {
                const distance = this.wallOfFame[0].scrollHeight;// - $("#wrap").height();
                const duration = (distance / 50) * 1000;
                this.wallOfFame.animate({ scrollTop: distance }, { duration, easing: "linear", queue: "scroll" }).dequeue("scroll");
            }
        });

        GameSession.disableGameInput();
    },

    hide() {
        if (!this.initialised) {
            this._initialise();
        }

        this.wallOfFame.fadeOut({ duration: 500, queue: false });

        GameSession.enableGameInput();
    },

    _resize() {
        this.wallOfFame.find(".postface").css("height", $(window).height());
    }
};
