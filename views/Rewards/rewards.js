import Database from "../../utilities/database.js";
import ConnectionsApi from "../../utilities/connections/api.js";

export default class Rewards {

    #rewards;

    constructor() {
        this.#init();
    };

    // Private method to set up initial reward values from the database
    #init() {
        Database.Parameter.setupRewards().then(() => {
            this.update();
        });
    };

    // Private method to check if a reward can be updated and decrement it if possible
    #isUpdated(isBonus) {
        if (isBonus) {
            if (this.#rewards.bonus > 0) {
                this.#rewards.bonus--;
                return true;
            }
        } else {
            if (this.#rewards.normal > 0) {
                this.#rewards.normal--;
                return true;
            }
        }
        return false;
    }

    // Asynchronous method to update the rewards from the database
    async update() {
        await Database.Parameter.getRewardCount().then(response => {
            this.#rewards = response;
        });
    }

    // Method to unlock a reward and notify the game server
    unlock(isBonus) {
        if (this.#isUpdated(isBonus)) {
            ConnectionsApi.Game.sendUnlockReward(isBonus);
            Database.Parameter.updateRewards(this.#rewards)
        }
    };

    getBonusCount() {
        return this.#rewards.bonus;
    };

    getNormalCount() {
        return this.#rewards.normal;
    };
}