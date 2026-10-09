import View from "../view.js";
import ConnectionsDevice from "../../utilities/connections/device.js";
import Measure from "./Measure.js";
import Settings from "../../utilities/settings.js";
import Database from "../../utilities/database.js";

export default class ViewSensor extends View {
    #inputSensorIP;
    #inputRefreshRate;
    #valueSensorMAC;

    #btnConnectSensor;
    #btnStartMeasurement;
    #btnStopMeasurement;
    #btnSensorOFF;

    #measure;

    setElements() {
        super.setElements();
        this.#inputSensorIP = this.html.querySelector('#inputSensorIP');
        this.#inputRefreshRate = this.html.querySelector('#inputRefreshRate');
        this.#valueSensorMAC = this.html.querySelector('#valueSensorMAC');


        this.#btnConnectSensor = this.html.querySelector('#btnConnectSensor');
        this.#btnStartMeasurement = this.html.querySelector('#btnStartMeasurement');
        this.#btnStopMeasurement = this.html.querySelector('#btnStopMeasurement');
        this.#btnSensorOFF = this.html.querySelector('#btnSensorOFF');

        this.#measure = new Measure();
        this.#addListener();
    };

    #addListener() {
        this.#inputRefreshRate.addEventListener('input', () => {
            const value = this.#inputRefreshRate.value;
            if (value >= Settings.Sensor.refreshMin && value <= Settings.Sensor.refreshMax) {
                Settings.Sensor.refreshSec = value;
                Database.Parameter.saveSettings();
            }
        });

        this.#btnConnectSensor.addEventListener('click', () => {
            let ip = this.#inputSensorIP.value;
            if (ip != null && ip.length > 0) {
                ConnectionsDevice.Sensor.connect(ip);
            }
        });

        this.#btnStartMeasurement.addEventListener('click', () => {
            this.#measure.start();
        });
        this.#btnStopMeasurement.addEventListener('click', () => {
            this.#measure.stop();
        });
        this.#btnSensorOFF.addEventListener('click', () => {
            ConnectionsDevice.Sensor.shutdown();
        });

    };

    show() {
        this.update();
        super.show();
    };

    update() {
        this.#inputRefreshRate.value = Settings.Sensor.refreshSec;
        if (ConnectionsDevice.Sensor.isConnected) {
            this.#btnSensorOFF.style.visibility = 'visible';
            if (ConnectionsDevice.Sensor.isRunning) {
                this.#btnStartMeasurement.style.visibility = 'hidden';
                this.#btnStopMeasurement.style.visibility = 'visible';
            } else {
                this.#btnStartMeasurement.style.visibility = 'visible';
                this.#btnStopMeasurement.style.visibility = 'hidden';
            }
        } else {
            this.#btnSensorOFF.style.visibility = 'hidden';
            this.#btnStartMeasurement.style.visibility = 'hidden';
            this.#btnStopMeasurement.style.visibility = 'hidden';
        }

        if (ConnectionsDevice.Sensor.sensorMAC != null) {
            this.#valueSensorMAC.textContent = ConnectionsDevice.Sensor.sensorMAC;
        } else {
            this.#valueSensorMAC.textContent = "unknown";
        }
    }
}