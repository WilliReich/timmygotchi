import Display from "./utilities/display.js";
import ConnectionsDevice from "./utilities/connections/device.js";
import Database from "./utilities/database.js";
import ViewAchievements from "./views/Achievements/viewAchievements.js";
import ViewGame from "./views/Game/viewGame.js";
import ViewGPS from "./views/GPS/viewGPS.js";
import ViewQuest from "./views/Quest/viewQuest.js";
import ViewSync from "./views/Sync/viewSync.js";
import ViewRewards from "./views/Rewards/viewRewards.js";
import ViewSensor from "./views/Sensor/viewSensor.js";
import ViewSettings from "./views/Settings/viewSettings.js";
import Settings from "./utilities/settings.js";

/*
 * The GUI class manages the user interface.
 *
 * @author Willi Reich
 */
export default class GUI {
    #activeView;

    #viewSettings;
    #viewGPS;
    #viewSensor;

    #viewGame;
    #viewQuest;
    #viewSync;
    #viewRewards;
    #viewAchievements;


    #btnSettings;
    #btnGPS;
    #btnSensor;
    #statusOnline;

    #btnQuest;
    #btnSync;
    #btnRewards;
    #btnGame;
    #btnAchievements;


    constructor() {
        this.#setElements();
        this.#loadAssets().then(() => this.#ready());
    }

    // Method to initialize views and buttons
    #setElements() {
        // Initialize view objects with corresponding HTML files
        this.#viewGame = new ViewGame('views/Game/viewGame.html');
        this.#viewQuest = new ViewQuest('views/Quest/viewQuest.html');
        this.#viewSync = new ViewSync('views/Sync/viewSync.html');
        this.#viewRewards = new ViewRewards('views/Rewards/viewRewards.html');
        this.#viewAchievements = new ViewAchievements('views/Achievements/viewAchievements.html');
        this.#viewSettings = new ViewSettings('views/Settings/viewSettings.html');
        this.#viewGPS = new ViewGPS('views/GPS/viewGPS.html');
        this.#viewSensor = new ViewSensor('views/Sensor/viewSensor.html');


        this.#btnSettings = document.querySelector('#btnSettings');
        this.#btnGPS = document.querySelector('#btnGPS');
        this.#statusOnline = document.querySelector('#statusOnline');
        this.#btnSensor = document.querySelector('#btnSensor');

        this.#btnGame = document.querySelector('#btnGame');
        this.#btnRewards = document.querySelector('#btnRewards');
        this.#btnQuest = document.querySelector('#btnQuest');
        this.#btnSync = document.querySelector('#btnSync');
        this.#btnAchievements = document.querySelector('#btnAchievements');
    }

    // Asynchronous method to load all necessary assets and html elements for the views
    async #loadAssets() {
        await Promise.all([
            this.#viewGame.init(),
            this.#viewSettings.init(),
            this.#viewGPS.init(),
            this.#viewSensor.init(),
            this.#viewQuest.init(),
            this.#viewSync.init(),
            this.#viewRewards.init(),
            this.#viewAchievements.init(),
        ]).catch((error) => alert(error));
    }

    // Method that runs once all resources are loaded
    #ready() {
        this.#addListener();
        // Load user settings from the database and then set up connections
        Database.Parameter.loadSettings().then(() => {
            this.#setupConnections();
            this.#changeView(this.#viewGame);
        });
    }

    // Add event listeners for various user interactions
    #addListener() {
        // window resize listener
        window.addEventListener('resize', () => {
            this.#activeView.resize();
        });
        // Listener for changes in internet connection status
        window.addEventListener('online', () => {
            ConnectionsDevice.Internet.isConnected = true;
            this.#setIconEnabled(this.#statusOnline, ConnectionsDevice.Internet.isConnected);
        });
        window.addEventListener('offline', () => {
            ConnectionsDevice.Internet.isConnected = false;
            this.#setIconEnabled(this.#statusOnline, ConnectionsDevice.Internet.isConnected);
        });

        // Listeners for menu buttons to switch to the corresponding views
        this.#btnSettings.addEventListener("click", () => {
            this.#changeView(this.#viewSettings);
        });
        this.#btnGPS.addEventListener("click", () => {
            this.#changeView(this.#viewGPS);
        });
        this.#btnSensor.addEventListener("click", () => {
            this.#changeView(this.#viewSensor);
        });
        this.#btnQuest.addEventListener("click", () => {
            this.#changeView(this.#viewQuest);
        });
        this.#btnSync.addEventListener("click", () => {
            this.#changeView(this.#viewSync);
        });
        this.#btnGame.addEventListener("click", () => {
            this.#changeView(this.#viewGame);
        });
        this.#btnRewards.addEventListener("click", () => {
            this.#changeView(this.#viewRewards);
        });
        this.#btnAchievements.addEventListener("click", () => {
            this.#changeView(this.#viewAchievements);
        });
    }

    // Method to set up connections and update status indicators
    #setupConnections() {
        ConnectionsDevice.GUI = this;
        ConnectionsDevice.Gps.read();
        ConnectionsDevice.Internet.isConnected = window.navigator.onLine;
        this.#setIconEnabled(this.#statusOnline, ConnectionsDevice.Internet.isConnected);
        this.#setIconEnabled(this.#btnSensor, ConnectionsDevice.Sensor.isRunning);
    }

    // Method to update connection icons and related views is triggered on connection changes
    connectionUpdate() {
        this.#setIconEnabled(this.#btnGPS, ConnectionsDevice.Gps.isRunning);
        this.#setIconEnabled(this.#btnSensor, ConnectionsDevice.Sensor.isRunning);
        this.#viewGPS.update();
        this.#viewQuest.update();
        this.#viewSensor.update();
    }

    // Method to enable or disable an icon based on the connection status
    #setIconEnabled(button, isEnabled) {
        if (isEnabled) {
            button.classList.remove('disabled');
        } else {
            button.classList.add('disabled');
        }
    }

    // Method to switch the current view
    #changeView(view) {
        // If the player is not identified, show the settings vie
        if (Settings.Player.id == null) {
            Display.setMenuVisible(false);
            this.#activeView = this.#viewSettings;
            this.#activeView.show();
            return;
        } else {
            Display.setMenuVisible(true);
        }

        if (this.#activeView != null) {
            this.#activeView.close();
        }
        if (this.#activeView !== view) {
            this.#activeView = view;
        } else {
            this.#activeView = this.#viewGame;
        }
        this.#activeView.show();
    }

    startGame() {
        this.#changeView(this.#viewGame);
    }
}