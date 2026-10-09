import View from "../view.js";
import Display from "../../utilities/display.js";
import QuestMap from "./questMap.js";
import ActiveQuest from "./activeQuest.js";
import ConnectionsDevice from "../../utilities/connections/device.js";
import Settings from "../../utilities/settings.js";
import Database from "../../utilities/database.js";
import Config from "../../utilities/config.js";

// The simulated GPS walker is only loaded in demo mode
const DemoGps = Config.isDemo ? (await import("../../utilities/connections/mock/demoGps.js")).default : null;

export default class ViewQuest extends View {
    #questMapContainer;
    #questMap;
    #activeQuest;

    #menuTop;
    #inputRadius;

    #menuBottom;
    #questInfoContainer;
    #valueClosestDistance;
    #cbIsAutoCenter;
    #btnFindQuests;
    #btnNavigate;

    #questCountdownContainer;
    #displayQuestCountdown;


    setElements() {
        super.setElements();
        // menu top
        this.#menuTop = this.html.querySelector('.menuTop');
        this.#inputRadius = this.html.querySelector('#inputRadius');
        this.#btnFindQuests = this.html.querySelector('#btnFindQuests');

        // map
        this.#questMapContainer = this.html.querySelector('#questMapContainer');

        // menu bottom
        this.#menuBottom = this.html.querySelector('.menuBottom');
        this.#questInfoContainer = this.html.querySelector('#questInfoContainer');
        this.#questCountdownContainer = this.html.querySelector('#questCountdownContainer');


        this.#valueClosestDistance = this.html.querySelector('#valueClosestDistance');
        this.#cbIsAutoCenter = this.html.querySelector('#cbIsAutoCenter');
        this.#btnNavigate = this.html.querySelector('#btnNavigate');

        this.#displayQuestCountdown = this.html.querySelector('#displayQuestCountdown');

        this.#init();
    };

    #init() {
        this.#questMap = new QuestMap(this.#questMapContainer);
        this.#activeQuest = new ActiveQuest(this.#questMap);
        this.#setListener();
        if (DemoGps != null) {
            this.#setDemoListener();
        }
    };

    // Demo mode: the simulated position walks to the closest quest and back home
    #setDemoListener() {
        this.#btnFindQuests.addEventListener("click", () => {
            DemoGps.arm();
        });
        this.#activeQuest.addEventListener("targetchanged", (event) => {
            if (event.detail != null) {
                DemoGps.walkTo(event.detail.latitude, event.detail.longitude);
            }
        });
        this.#activeQuest.addEventListener("questfinished", () => {
            DemoGps.returnHome();
        });
    };

    #setListener() {
        this.#btnFindQuests.addEventListener("click", () => {
            let radius = this.#inputRadius.value;
            if (radius < 2 || radius > 50) {
                return;
            }
            radius *= 1000; // km radius in meter
            this.#questMap.showQuestMarker(radius).then(() => {
                this.update();
            });
        });

        this.#cbIsAutoCenter.addEventListener("change", () => {
            Settings.Quest.isAutoCenter = this.#cbIsAutoCenter.checked;
            Database.Parameter.saveSettings();
        });

        this.#btnNavigate.addEventListener("click", () => {
            this.#questMap.addRoute();
        });
    }

    show() {
        if (this.#hasSignals()) {
            this.#questMap.centerPlayer();
            this.#cbIsAutoCenter.checked = Settings.Quest.isAutoCenter;
        }
        super.show();
    };

    update() {
        if (!this.#hasSignals()) {
            return;
        }
        // the marker always follows the position, the map view only when auto center is on
        if (Settings.Quest.isAutoCenter) {
            this.#questMap.centerPlayer();
        } else {
            this.#questMap.updatePlayer();
        }
        this.#activeQuest.update();
        let countdown = this.#activeQuest.getCountdown();
        if(countdown < Settings.Quest.STAY_TIME_SEC){
            this.#showCountdown(countdown);
        }else{
            this.#showMenuBottom();
        }
    };

    resize() {
        super.resize();
        this.#questMapContainer.style.height = Display.height * 0.75 + 'px';
        this.#questInfoContainer.style.height = Display.width * 0.25 + 'px';
        this.#questMap.reload();
    };

    #hasSignals() {
        if (ConnectionsDevice.Gps.isRunning && ConnectionsDevice.Sensor.isRunning) {
            this.#questMapContainer.style.visibility = 'visible';
            this.#menuTop.style.visibility = 'visible';
            this.#menuBottom.style.visibility = 'visible';
            return true;
        } else {
            this.#questMapContainer.style.visibility = 'hidden';
            this.#menuTop.style.visibility = 'hidden';
            this.#menuBottom.style.visibility = 'hidden';
            this.#questCountdownContainer.style.visibility = 'collapse';
            return false;
        }
    };

    #showCountdown(countdown) {
        this.#questInfoContainer.style.visibility = 'collapse';
        this.#questCountdownContainer.style.visibility = 'visible';
        this.#displayQuestCountdown.innerHTML = "COUNTDOWN:  " + countdown.toFixed(0);
    };

    #showMenuBottom() {
        this.#questInfoContainer.style.visibility = 'visible';
        this.#questCountdownContainer.style.visibility = 'collapse';

        let distance = this.#activeQuest.getDistance();
        if (distance >= 0) {
            this.#valueClosestDistance.innerHTML = distance.toFixed(0) + ' m';
        } else {
            this.#valueClosestDistance.innerHTML = 'unknown';
        }
    };
}