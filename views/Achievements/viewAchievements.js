import View from "../view.js";
import ConnectionsApi from "../../utilities/connections/api.js";
import Settings from "../../utilities/settings.js";

const HIGHSCORE_ROWS = 10;

export default class ViewAchievements extends View {

    #rows = [];         // the ten highscore rows, each with its name and score cell
    #playerRow;         // the row showing the current player

    setElements() {
        super.setElements();
        this.#rows = [];
        for (let rank = 1; rank <= HIGHSCORE_ROWS; rank++) {
            this.#rows.push(this.#cells('#name' + rank, '#score' + rank));
        }
        this.#playerRow = this.#cells('#nameP', '#scoreP');
    }

    show() {
        this.#loadPlayerScore();
        this.#loadHighScore();
        super.show();
    }

    // Looks up the name and score cells of one table row
    #cells(nameSelector, scoreSelector) {
        return {
            name: this.html.querySelector(nameSelector),
            score: this.html.querySelector(scoreSelector),
        };
    }

    // Fills the rows with the best players, rows without an entry stay empty
    async #loadHighScore() {
        const highScoreList = await ConnectionsApi.SmartGamification.Score.getHighScore() || [];
        this.#rows.forEach((row, index) => {
            const entry = highScoreList[index];
            if (entry != null) {
                this.#showEntry(row, entry.player_name, entry.score);
            } else {
                this.#showEntry(row, '', '');
            }
        });
    }

    // Shows the score of the current player
    async #loadPlayerScore() {
        const score = await ConnectionsApi.SmartGamification.Score.getPlayerScore(Settings.Player.id);
        this.#showEntry(this.#playerRow, Settings.Player.name, score);
    }

    // Writes name and score into a row, with placeholders for missing values
    #showEntry(row, name, score) {
        row.name.textContent = name == null ? "no name" : name;
        row.score.textContent = score == null ? -1 : score;
    }
}
