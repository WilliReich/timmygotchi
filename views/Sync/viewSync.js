import View from "../view.js";
import Synchronizer from "./synchronizer.js";

export default class ViewSync extends View {
    #valueSessions;
    #valueDataCount;
    #valueSyncCount;
    #valueDistance;
    #valueAltitude;
    #valueScore;
    #btnSend;

    #synchronizer;

    setElements() {
        super.setElements();
        this.#valueSessions = this.html.querySelector('#valueSessions');
        this.#valueDataCount = this.html.querySelector('#valueDataCount');
        this.#valueSyncCount = this.html.querySelector('#valueSyncCount');
        this.#valueDistance = this.html.querySelector('#valueDistance');
        this.#valueAltitude = this.html.querySelector('#valueAltitude');
        this.#valueScore = this.html.querySelector('#valueScore');

        this.#btnSend = this.html.querySelector('#btnSend');

        this.#addListener();
        this.#synchronizer = new Synchronizer();
    }

    #addListener() {
        this.#btnSend.addEventListener('click', async () => {
            await this.#synchronizer.sync().then(() => {
                this.#showData();
            });
        });
    }

    show() {
        this.#synchronizer.loadData().then(() => {
            this.#showData();
        });
        super.show();
    }

    #showData() {
        let stats = this.#synchronizer.getStats();
        this.#valueSessions.textContent = stats.sessionCount;
        this.#valueDataCount.textContent = stats.dataStored;
        this.#valueSyncCount.textContent = stats.dataSync;

        this.#valueDistance.textContent = stats.distance.toFixed(1) + "km";
        this.#valueAltitude.textContent = stats.altitude.toFixed(1) + "m";
        this.#valueScore.textContent = stats.score;
    }
}