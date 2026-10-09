import ConnectionsApi from "../../utilities/connections/api.js";
import Settings from "../../utilities/settings.js";
import Database from "../../utilities/database.js";

// Tracks the closest quest and finishes it once the player stayed in range long enough.
// Emits 'targetchanged' and 'questfinished' events with the quest coordinates in detail.
export default class ActiveQuest extends EventTarget {
    #marker;
    #distance;
    #arrivalTime = null;
    #questMap;

    constructor(questMap) {
        super();
        this.#questMap = questMap;
    }

    // Update method to check if the player has completed the quest
    update() {
        let questObj = this.#questMap.getClosestMarker();
        const previousMarker = this.#marker;
        this.#marker = questObj.marker;
        this.#distance = questObj.distance;
        if (this.#marker !== previousMarker) {
            this.#notifyTargetChanged();
        }
        if (this.#marker == null || this.#distance < 0) {
            return
        }
        if (this.isInRange() && this.getCountdown() <= 0) {
            this.#finish();
            this.update();
        }
    };

    // Returns the distance to the active quest marker
    getDistance() {
        return this.#distance;
    };

    // Returns the remaining time to complete the quest or the default stay time
    getCountdown() {
        if (this.#arrivalTime != null) {
            let timePassed = ((new Date().getTime() / 1000) - this.#arrivalTime)
            return Settings.Quest.STAY_TIME_SEC - timePassed;
        } else {
            return Settings.Quest.STAY_TIME_SEC;
        }
    };

    // Check if the player is within range of the quest marker
    isInRange() {
        if (this.#distance > Settings.Quest.RADIUS_METER) {
            this.#arrivalTime = null;
            return false;
        } else {
            if (this.#arrivalTime == null) {
                this.#arrivalTime = new Date().getTime() / 1000;
            }
            return true;
        }
    };

    // Finish the quest: update database and send completion to the server
    #finish() {
        let coords = this.#marker.getLatLng();
        Database.QuestsDone.add(coords.lat, coords.lng);
        ConnectionsApi.Game.sendQuestDone();

        let isBonus = this.#isBonus();
        Database.Parameter.addOneToReward(isBonus);
        if (isBonus) {
            Database.Measurements.questNormal++;
        } else {
            Database.Measurements.questBonus++;
        }
        this.#questMap.deleteOneQuestMarker(this.#marker);
        this.dispatchEvent(new CustomEvent('questfinished', {
            detail: { latitude: coords.lat, longitude: coords.lng, isBonus: isBonus },
        }));
    };

    // Tells listeners which quest is targeted now, detail is null when there is none
    #notifyTargetChanged() {
        const latLng = this.#marker != null ? this.#marker.getLatLng() : null;
        this.dispatchEvent(new CustomEvent('targetchanged', {
            detail: latLng == null ? null : { latitude: latLng.lat, longitude: latLng.lng },
        }));
    };

    // Determine if the quest is a bonus quest: one of its measuring times is close to now
    #isBonus() {
        if (this.#marker.bonusTime.length === 0) {
            return false;
        }
        const timesArray = this.#marker.bonusTime.split(",");
        const timeNow = new Date();
        const isBonus = timesArray.some(targetTime => this.#isWithinInterval(timeNow, targetTime));
        if (isBonus) {
            alert("Bonus quest complete");
        }
        return isBonus;
    };

    // Check if the current time is within a specific interval of the target time
    #isWithinInterval(timeNow, targetTime) {
        // Parse the target time (expected format: "HH:MM")
        const [targetHours, targetMinutes] = targetTime.split(':').map(Number);

        // Create a Date object for the target time using today's date
        const targetDate = new Date(timeNow);
        targetDate.setHours(targetHours);
        targetDate.setMinutes(targetMinutes);
        targetDate.setSeconds(0);
        targetDate.setMilliseconds(0);

        const timeDifference = Math.abs(timeNow - targetDate);
        const fiveMinutesInMs = Settings.Quest.BONUS_DIF_MIN * 60 * 1000;

        return timeDifference <= fiveMinutesInMs;
    }
};