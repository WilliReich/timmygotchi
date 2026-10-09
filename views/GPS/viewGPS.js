import View from "../view.js";
import Map from "../../utilities/map.js";
import Display from "../../utilities/display.js";
import ConnectionsDevice from "../../utilities/connections/device.js";
import Settings from "../../utilities/settings.js";
import Database from "../../utilities/database.js";

export default class ViewGPS extends View {
    #mapContainer;
    #previewMap;
    #playerMarker;

    #displayLatitude;
    #displayLongitude;
    #displayAltitude;

    #isGPSActivated;
    #inputRefreshRate;
    #btnRefresh;

    setElements() {
        super.setElements();
        this.#mapContainer = this.html.querySelector('#gpsMiniMap');

        this.#displayLatitude = this.html.querySelector('#valueLatitude');
        this.#displayLongitude = this.html.querySelector('#valueLongitude');
        this.#displayAltitude = this.html.querySelector('#valueAltitude');

        this.#isGPSActivated = this.html.querySelector('#isGPSActivated');
        this.#inputRefreshRate = this.html.querySelector('#inputRefreshRate');
        this.#btnRefresh = this.html.querySelector('#btnRefresh');

        this.#init();
    }

    #init() {
        let defaultZoom = 15;
        this.#previewMap = Map.create(this.#mapContainer, defaultZoom);
        this.#playerMarker = Map.addPlayerMarker(this.#previewMap);
        this.#addListener();
    }

    #addListener() {
        this.#isGPSActivated.addEventListener('change', () => {
            Settings.Gps.isEnabled = this.#isGPSActivated.checked;
            Database.Parameter.saveSettings();
            ConnectionsDevice.Gps.read();
        });

        this.#btnRefresh.addEventListener('click', () => {
            ConnectionsDevice.Gps.read();
        });

        this.#inputRefreshRate.addEventListener('input', () => {
            const value = this.#inputRefreshRate.value;
            if (value >= Settings.Gps.refreshMin && value <= Settings.Gps.refreshMax) {
                Settings.Gps.refreshSec = value;
                Database.Parameter.saveSettings();
            }
        });

    }

    show() {
        this.#isGPSActivated.checked = Settings.Gps.isEnabled;
        this.#inputRefreshRate.value = Settings.Gps.refreshSec;
        Map.centerPlayer(this.#previewMap, this.#playerMarker);
        this.update();
        // inject html
        super.show();
    }

    update(){
        let lat = 'unknown';
        let long = 'unknown';
        let alt = 'unknown';

        if (ConnectionsDevice.Gps.isRunning) {
            const coords = ConnectionsDevice.Gps.position.coords;
            lat = coords.latitude.toFixed(6);
            long = coords.longitude.toFixed(6);
            if (coords.altitude != null) {
                alt = coords.altitude.toFixed(2);
            }
            Map.centerPlayer(this.#previewMap, this.#playerMarker);
            this.#mapContainer.style.visibility = 'visible';
        } else {
            this.#mapContainer.style.visibility = 'hidden';
        }
        this.#displayLatitude.textContent = lat;
        this.#displayLongitude.textContent = long;
        this.#displayAltitude.textContent = alt;
    }

    resize() {
        super.resize();
        this.#mapContainer.style.height = (Display.height * 0.5) + "px";
        Map.centerPlayer(this.#previewMap, this.#playerMarker);
    }

}