import Database from "../../utilities/database.js";
import ConnectionsDevice from "../../utilities/connections/device.js";
import Settings from "../../utilities/settings.js";

export default class Measure {
    #startTime = null;
    #mac = null;
    #lastUpdateGPS = 0;
    #lastUpdateSensor = 0;

    // Start the measurement process
    start() {
        if (ConnectionsDevice.Sensor.isConnected) {
            ConnectionsDevice.Sensor.start();

            // Normalize the MAC address for storage
            this.#mac = ConnectionsDevice.Sensor.sensorMAC.replaceAll("-", "").replaceAll(":", "").toLowerCase();
            this.#startTime = this.#getFormattedDateNow();

            // Begin the measurement loop
            this.#startLoop();
        }
    }

    // Stop the measurement process
    stop() {
        ConnectionsDevice.Sensor.stop();
        this.#mac = null;
        this.#startTime = null;
        this.#lastUpdateGPS = 0;
        this.#lastUpdateSensor = 0;
    }

    // Start a loop that continuously reads GPS and sensor data
    #startLoop() {
        const loop = () => {
            if (!ConnectionsDevice.Sensor.isRunning) {
                return;
            }
            this.readGPS();                 // Read GPS data
            this.readSensor();              // Read sensor data
            setTimeout(loop, 1000); // Continue the loop every second
        }
        loop();
    }

    // Read GPS data at specified intervals
    readGPS() {
        this.#lastUpdateGPS++;
        if (this.#lastUpdateGPS >= Settings.Gps.refreshSec) {
            ConnectionsDevice.Gps.read();
            this.#lastUpdateGPS = 0;
        }
    }

    // Read sensor data at specified intervals and save it to the database
    readSensor() {
        this.#lastUpdateSensor++;
        if (this.#lastUpdateSensor >= Settings.Sensor.refreshSec) {
            this.#createDataset().then(measurement => {
                Database.Measurements.add(this.#startTime, measurement.ts, this.#mac, measurement);
            })
            this.#lastUpdateSensor = 0;
        }
    }

    // Get the current date and time formatted as a string
    #getFormattedDateNow() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    }

    // Create a SmartData dataset with sensor and GPS data
    async #createDataset() {
        let measurement = {};
        measurement.temp = await ConnectionsDevice.Sensor.readTemp();
        let pmValues = await ConnectionsDevice.Sensor.readPM();
        measurement.pm2_5 = pmValues.pm2_5;
        measurement.pm10_0 = pmValues.pm10_0;
        measurement.route = this.#startTime;
        measurement.ts = this.#getFormattedDateNow();

        ConnectionsDevice.Gps.read();
        let coords = ConnectionsDevice.Gps.position.coords;

        measurement.pos = "SRID=4326;POINT(" + coords.longitude + " " + coords.latitude + ")";
        measurement.pos_accuracy = coords.accuracy;
        measurement.pos_altitude = coords.altitude;
        measurement.pos_altitude_accuracy = coords.altitudeAccuracy;
        measurement.pos_heading = coords.heading;
        measurement.pos_speed = coords.speed;
        return measurement;
    }
}