import ConnectionsApi from "../../utilities/connections/api.js";
import Settings from "../../utilities/settings.js";
import Database from "../../utilities/database.js";

export default class ActiveQuest {
    #marker;
    #distance;
    #arrivalTime = null;
    #questMap;

    constructor(questMap) {
        this.#questMap = questMap;
    }

    // Update method to check if the player has completed the quest
    update() {
        let questObj = this.#questMap.getClosestMarker();
        this.#marker = questObj.marker;
        this.#distance = questObj.distance;
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
    };

    // Determine if the quest is a bonus quest
    #isBonus() {
        if (this.#marker.bonusTime.length > 0) {
            const timesArray = this.#marker.bonusTime.split(",");
            const timeNow = new Date();
            timesArray.forEach(targetTime => {
                if (this.#isWithinInterval(timeNow, targetTime)) {
                    alert("Bonus quest complete");
                    return true;
                }
            })
        }
        return false;
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