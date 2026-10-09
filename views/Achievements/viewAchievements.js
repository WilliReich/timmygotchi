import View from "../view.js";
import ConnectionsApi from "../../utilities/connections/api.js";
import Settings from "../../utilities/settings.js";

export default class ViewAchievements extends View {

    #name1;
    #score1;
    #name2;
    #score2;
    #name3;
    #score3;
    #name4;
    #score4;
    #name5;
    #score5;
    #name6;
    #score6;
    #name7;
    #score7;
    #name8;
    #score8;
    #name9;
    #score9;
    #name10;
    #score10;
    #namePlayer;
    #scorePlayer;

    setElements() {
        super.setElements();

        this.#name1 = this.html.querySelector('#name1');
        this.#score1 = this.html.querySelector('#score1');
        this.#name2 = this.html.querySelector('#name2');
        this.#score2 = this.html.querySelector('#score2');
        this.#name3 = this.html.querySelector('#name3');
        this.#score3 = this.html.querySelector('#score3');
        this.#name4 = this.html.querySelector('#name4');
        this.#score4 = this.html.querySelector('#score4');
        this.#name5 = this.html.querySelector('#name5');
        this.#score5 = this.html.querySelector('#score5');
        this.#name6 = this.html.querySelector('#name6');
        this.#score6 = this.html.querySelector('#score6');
        this.#name7 = this.html.querySelector('#name7');
        this.#score7 = this.html.querySelector('#score7');
        this.#name8 = this.html.querySelector('#name8');
        this.#score8 = this.html.querySelector('#score8');
        this.#name9 = this.html.querySelector('#name9');
        this.#score9 = this.html.querySelector('#score9');
        this.#name10 = this.html.querySelector('#name10');
        this.#score10 = this.html.querySelector('#score10');
        this.#namePlayer = this.html.querySelector('#nameP');
        this.#scorePlayer = this.html.querySelector('#scoreP');
    }

    show() {
        this.#loadPlayerScore();
        this.#loadHighScore();
        super.show();
    }

    #loadHighScore() {
        ConnectionsApi.SmartGamification.Score.getHighScore().then((highScoreList) => {
            try {
                let pos = highScoreList[0];
                this.#addValues(pos.player_name, this.#name1, pos.score, this.#score1);
                pos = highScoreList[1];
                this.#addValues(pos.player_name, this.#name2, pos.score, this.#score2);
                pos = highScoreList[2];
                this.#addValues(pos.player_name, this.#name3, pos.score, this.#score3);
                pos = highScoreList[3];
                this.#addValues(pos.player_name, this.#name4, pos.score, this.#score4);
                pos = highScoreList[4];
                this.#addValues(pos.player_name, this.#name5, pos.score, this.#score5);
                pos = highScoreList[5];
                this.#addValues(pos.player_name, this.#name6, pos.score, this.#score6);
                pos = highScoreList[6];
                this.#addValues(pos.player_name, this.#name7, pos.score, this.#score7);
                pos = highScoreList[7];
                this.#addValues(pos.player_name, this.#name8, pos.score, this.#score8);
                pos = highScoreList[8];
                this.#addValues(pos.player_name, this.#name9, pos.score, this.#score9);
                pos = highScoreList[9];
                this.#addValues(pos.player_name, this.#name10, pos.score, this.#score10);
            } catch (error) {
            }
        })
    }

    // Private method to load and display the current player's score
    #loadPlayerScore() {
        ConnectionsApi.SmartGamification.Score.getPlayerScore(Settings.Player.id).then((score => {
            this.#addValues(
                Settings.Player.name,
                this.#namePlayer,
                score,
                this.#scorePlayer
            );
        }))
    }

    // Private method to update HTML elements with player names and scores
    #addValues(name, htmlName, score, htmlScore) {
        if (name == null) {
            name = "no name"
        }
        if (score == null) {
            score = -1;
        }
        htmlName.innerHTML = name;
        htmlScore.innerHTML = score;
    }
}