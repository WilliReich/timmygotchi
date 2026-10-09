import View from "../view.js";
import Rewards from "./rewards.js";

export default class ViewRewards extends View {
    #valueRewardsNormal;
    #valueRewardsBonus;
    #btnRewardsNormal;
    #btnRewardsBonus;

    #rewards;


    setElements() {
        super.setElements();
        this.#valueRewardsNormal = this.html.querySelector('#valueRewardsNormal');
        this.#valueRewardsBonus = this.html.querySelector('#valueRewardsBonus');
        this.#btnRewardsNormal = this.html.querySelector('#btnRewardsNormal');
        this.#btnRewardsBonus = this.html.querySelector('#btnRewardsBonus');

        this.#rewards = new Rewards();
        this.#addListener();
    }

    #addListener() {
        this.#btnRewardsNormal.addEventListener('click', () => {
            this.#rewards.unlock(false);
            this.#showRewards();
        });

        this.#btnRewardsBonus.addEventListener('click', () => {
            this.#rewards.unlock(true);
            this.#showRewards();
        });
    }

    show() {
        super.show();
        this.#rewards.update().then(() => {
            this.#showRewards();
        });
    }

    resize() {
        super.resize();
    }

    #showRewards() {
        this.#valueRewardsNormal.textContent = this.#rewards.getNormalCount();
        this.#valueRewardsBonus.textContent = this.#rewards.getBonusCount();
    };
}