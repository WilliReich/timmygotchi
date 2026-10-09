import View from "../view.js";
import ConnectionsApi from "../../utilities/connections/api.js";
import Settings from "../../utilities/settings.js";
import Database from "../../utilities/database.js";
import ConnectionsDevice from "../../utilities/connections/device.js";

export default class ViewSettings extends View {

    #playerIdValue;
    #playerNameValue;

    #inputLoadName;
    #btnLoadName;

    #inputCreateName;
    #btnCreateName;

    #btnStartGame;

    setElements() {
        super.setElements();

        this.#playerIdValue = this.html.querySelector('#playerIdValue');
        this.#playerNameValue = this.html.querySelector('#playerNameValue');

        this.#inputLoadName = this.html.querySelector('#inputLoadName');
        this.#inputCreateName = this.html.querySelector('#inputCreateName');

        this.#btnLoadName = this.html.querySelector('#btnLoadName');
        this.#btnCreateName = this.html.querySelector('#btnCreateName');
        this.#btnStartGame = this.html.querySelector('#btnStartGame');

        this.#addListener();
    }

    #addListener() {
        // Event listener for loading an existing player
        this.#btnLoadName.addEventListener('click', () => {
            let name = this.#inputLoadName.value;
            this.#inputLoadName.value = "";
            ConnectionsApi.SmartGamification.Player.getID(name).then(id => {
                if (id > 0) {
                    this.#savePlayer(id, name);
                    this.#showInfo();
                } else {
                    alert("Failed");
                }
            });
        });

        // Event listener for creating a new player
        this.#btnCreateName.addEventListener('click', () => {
            let name = this.#inputCreateName.value;
            this.#inputCreateName.value = "";
            ConnectionsApi.SmartGamification.Player.create(name).then(id => {
                if (id > 0) {
                    this.#savePlayer(id, name);
                    this.#showInfo();
                } else {
                    alert("Failed");
                }
            });
        });

        // Event listener for starting the game
        this.#btnStartGame.addEventListener('click', () => {
            ConnectionsDevice.GUI.startGame();
        });

    }

    // Save the player's ID and name to settings and database
    #savePlayer(id, name) {
        Settings.Player.id = id;
        Settings.Player.name = name;
        Database.Parameter.saveSettings();
    }

    // Update the display with the current player's ID and name
    #showInfo() {
        let id = Settings.Player.id;
        if (id == null) {
            id = "unknown";
        }

        let name = Settings.Player.name;
        if (name == null) {
            name = "unknown";
        }

        this.#playerIdValue.innerHTML = id;
        this.#playerNameValue.innerHTML = name;
    }

    show() {
        this.#showInfo();
        super.show();
    }
}