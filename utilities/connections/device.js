import Settings from "../settings.js";
import Config from "../config.js";
import Http from "./http.js";

// The simulated GPS is only loaded in demo mode
const DemoGps = Config.isDemo ? (await import("./mock/demoGps.js")).default : null;

// Object to manage connections and interactions with local devices (Internet, Sensor, GPS)
let ConnectionsDevice = {
    GUI: null, // Reference to the GUI for updating the connection status

    // Object to manage the Internet connection status
    Internet: {
        isConnected: false,
    },

    // Object to manage the connection and interactions with the mobile airquality sensor
    Sensor: {
        isConnected: false,
        isRunning: false,
        sensorIP: null,
        sensorMAC: null,
        measurement: null,

        // Method to establish a connection to the sensor using its IP address
        connect: async function (ip) {
            const url = "https://" + ip + ":8181/SmartDataSensor/smartdata/system/sysinfo";
            try {
                const response = await Http.fetch(url);
                if (!response.ok) {
                    alert("connection failed");
                    return;
                }
                const sysinfo = await response.json();
                // Mark sensor as ready for measuring begin, MAC included
                ConnectionsDevice.Sensor.isConnected = true;
                ConnectionsDevice.Sensor.sensorIP = ip;
                ConnectionsDevice.Sensor.sensorMAC = sysinfo.mac;
                ConnectionsDevice.GUI.connectionUpdate();
            } catch (error) {
                alert(error);
            }
        },

        // Method to start the airquality measurement
        start: function () {
            ConnectionsDevice.Sensor.isRunning = true;
            ConnectionsDevice.GUI.connectionUpdate();
        },

        // Method to stop the airquality measurement
        stop: function () {
            ConnectionsDevice.Sensor.isRunning = false;
            ConnectionsDevice.GUI.connectionUpdate();
        },

        // Method to shut down the sensor device remotely
        shutdown: function () {
            if (!ConnectionsDevice.Sensor.isConnected || ConnectionsDevice.Sensor.sensorIP == null) {
                return;
            }
            alert("please wait until sensor is shut down");
            let url = "https://" + ConnectionsDevice.Sensor.sensorIP + ":8181/SmartBridge/smartbridge/bridge/execute?command=sh&file=/scripts/shutdown.sh";
            Http.fetch(url).then(response => {
                // Reset sensor variables
                ConnectionsDevice.Sensor.isRunning = false;
                ConnectionsDevice.Sensor.isConnected = false;
                ConnectionsDevice.Sensor.sensorIP = null;
                ConnectionsDevice.Sensor.sensorMAC = null;
                ConnectionsDevice.GUI.connectionUpdate();
            });
        },

        // Method to read particulate matter (PM) values from the sensor
        readPM: async function () {
            if (!ConnectionsDevice.Sensor.isRunning) {
                return
            }

            let url = "https://" + ConnectionsDevice.Sensor.sensorIP + ":8181/SmartBridge/smartbridge/bridge/execute?command=python&file=/scripts/sds011.py";
            let pmValues = {};
            try {
                const response = await Http.fetch(url);
                const json = await response.json();
                pmValues.pm2_5 = json.result.value["pm2.5"];
                pmValues.pm10_0 = json.result.value["pm10.0"];
            } catch (error) {
                alert(error);
            }
            return pmValues;
        },

        // Method to read temperature from the sensor
        readTemp: async function () {
            if (!ConnectionsDevice.Sensor.isRunning) {
                return
            }

            let url = "https://" + ConnectionsDevice.Sensor.sensorIP + ":8181/SmartBridge/smartbridge/bridge/execute?command=python&file=/scripts/temperature.py&logtarget=temp";
            let temp;
            try {
                const response = await Http.fetch(url);
                const json = await response.json();
                temp = json.result;
            } catch (error) {
                alert(error);
            }
            return temp;
        },
    },

    // Object to manage the GPS functionalities
    Gps: {
        isRunning: false,
        position: null,

        // Method to read the current GPS position
        read: function () {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by this browser.");
                return;
            }
            if (!Settings.Gps.isEnabled) {
                ConnectionsDevice.Gps.isRunning = false;
                ConnectionsDevice.Gps.position = null;
                ConnectionsDevice.GUI.connectionUpdate();
                return;
            }
            if (DemoGps != null) {
                // demo mode: simulated position, see mock/demoGps.js
                this.success(DemoGps.currentPosition());
                return;
            }
            navigator.geolocation.getCurrentPosition(
                this.success,
                this.error
            );
        },

        // Success handler for geolocation: updates the GPS position and status
        success(position) {
            ConnectionsDevice.Gps.position = position;
            ConnectionsDevice.Gps.isRunning = true;
            ConnectionsDevice.GUI.connectionUpdate();
        },

        // Error handler for geolocation: handles various error cases
        error(error) {
            ConnectionsDevice.Gps.position = null;
            ConnectionsDevice.Gps.isRunning = false;
            ConnectionsDevice.GUI.connectionUpdate();
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert("User denied the request for Geolocation.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    alert("The request to get user location timed out.");
                    break;
                default:
                    alert("An unknown error occurred.");
            }
        }
    }
}

export default ConnectionsDevice;