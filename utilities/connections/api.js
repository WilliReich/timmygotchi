import GameAPI from "../../game/gameAPI.js";
import Map from "../map.js";
import Config from "../config.js";

// The ConnectionsApi module provides various methods for interacting with external APIs and services.
let ConnectionsApi = {

    // Game-related API interactions
    Game: {
        getTimmyAge: function () {
            return GameAPI.GET.timmyAge();
        },
        // Sends new size and offset information for canvas update
        sendResize: function (height, width, offsetTop, offsetLeft) {
            GameAPI.PUT.newSize(height, width, offsetTop, offsetLeft);
        },
        // Notifies the GameAPI that a quest has been completed
        sendQuestDone: function () {
            GameAPI.PUT.questDone();
        },
        // Sends a request to unlock a reward, specifying if it's a bonus or normal reward
        sendUnlockReward: function (isBonus) {
            GameAPI.PUT.unlockReward(isBonus);
        }
    },

    // REST-ful API interactions
    REST: {
        GET: async function (url) {
            try {
                let response = await fetch(url);

                if (response == null || response.status !== 200) {
                    return null
                }

                return await response.json();

            } catch (error) {
                console.log(error);
                return null;
            }
        },

        POST: async function (url, bodyObj) {
            const opts = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(bodyObj),
            };

            try {
                let response = await fetch(url, opts);

                if (response == null || response.status !== 201) {
                    return null
                }
                return await response.json();

            } catch (error) {
                console.log(error);
                return null;
            }
        },

        PUT: async function (url, bodyObj) {
            const opts = {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(bodyObj),
            };

            try {
                let response = await fetch(url, opts);

                if (response == null || response.status !== 200) {
                    return null
                }
                return await response.json();

            } catch (error) {
                console.log(error);
                return null;
            }
        },
    },

    // Smart Gamification API interactions
    SmartGamification: {
        urlPrefix: Config.apiBaseUrl,

        // Player-related API interactions
        Player: {
            // Creates a new player with the specified name and returns the player's ID
            create: function (name) {
                const url = ConnectionsApi.SmartGamification.urlPrefix + "/SmartGamification/smartdata/player/create?smartservice=SmartDataAirquality&storage=smartmonitoring";
                const body = {
                    "player_name": name
                }

                return ConnectionsApi.REST.POST(url, body).then((jsonObj) => {
                    let id = -1;
                    if (jsonObj != null) {
                        id = jsonObj.id;
                    }
                    return id;
                });
            },

            // Retrieves the player's ID based on their name
            getID: function (name) {
                const url = ConnectionsApi.SmartGamification.urlPrefix + "/SmartGamification/smartdata/player/getid?smartservice=SmartDataAirquality&storage=smartmonitoring&playername=" + name;

                return ConnectionsApi.REST.GET(url).then((jsonObj) => {
                    let id = -1;
                    if (jsonObj != null) {
                        id = jsonObj.id;
                    }
                    return id;
                });
            }
        },

        // Session-related API interactions
        Session: {
            // Creates a new session with the specified session data and returns the session ID
            create: async function (sessionData) {
                const url = ConnectionsApi.SmartGamification.urlPrefix + "/SmartGamification/smartdata/session/create?smartservice=SmartDataAirquality&storage=smartmonitoring";

                return ConnectionsApi.REST.POST(url, sessionData).then((jsonObj) => {
                    let id = -1;
                    if (jsonObj != null) {
                        id = jsonObj;
                    }
                    return id;
                });
            },

            // Retrieves session details by session ID
            getById: function (sessionID) {
                const url = ConnectionsApi.SmartGamification.urlPrefix + "/SmartGamification/smartdata/session/getbyid?smartservice=SmartDataAirquality&storage=smartmonitoring&sessionid=" + sessionID;
                return ConnectionsApi.REST.GET(url).then((jsonObj) => {
                    let session = null;
                    if (jsonObj != null) {
                        session = jsonObj;
                    }
                    return session;
                });
            }
        },

        // Score-related API interactions
        Score: {
            // Updates the player's score for the specified session ID
            update: function (sessionID) {
                const url = ConnectionsApi.SmartGamification.urlPrefix + "/SmartGamification/smartdata/score/updateplayerscore?smartservice=SmartDataAirquality&storage=smartmonitoring";
                const body = {
                    "sessionid": sessionID
                }

                return ConnectionsApi.REST.PUT(url, body).then((jsonObj) => {
                    let success = false;
                    if (jsonObj != null) {
                        success = true;
                    }
                    return success;
                });
            },

            // Retrieves the score for a specific session ID
            getSessionScore: function (sessionID) {
                const url = ConnectionsApi.SmartGamification.urlPrefix + "/SmartGamification/smartdata/score/getsessionscore?smartservice=SmartDataAirquality&storage=smartmonitoring&sessionid=" + sessionID;
                return ConnectionsApi.REST.GET(url).then((jsonObj) => {
                    let score = null;
                    if (jsonObj != null) {
                        score = jsonObj.score;
                    }
                    return score;
                });
            },

            // Retrieves the score for a specific player ID
            getPlayerScore: function (playerID) {
                const url = ConnectionsApi.SmartGamification.urlPrefix + "/SmartGamification/smartdata/score/getbyplayerid?smartservice=SmartDataAirquality&storage=smartmonitoring&playerid=" + playerID;
                return ConnectionsApi.REST.GET(url).then((jsonObj) => {
                    let score = null;
                    if (jsonObj != null) {
                        score = jsonObj.score;
                    }
                    return score;
                });
            },

            // Retrieves the top 10 high scores
            getHighScore: function () {
                const url = ConnectionsApi.SmartGamification.urlPrefix + "/SmartGamification/smartdata/score/listbyscore?smartservice=SmartDataAirquality&storage=smartmonitoring&size=" + 10;
                return ConnectionsApi.REST.GET(url).then((jsonObj) => {
                    let highscoreList = null;
                    if (jsonObj != null) {
                        highscoreList = jsonObj.highscore;
                    }
                    return highscoreList;
                });
            }
        },
    },

    // Smart Air Quality API interactions
    SmartAirQuality: {
        urlPrefix: Config.apiBaseUrl,

        // Retrieves measurement positions within a specified radius from the player's location
        getPosArray: async function (radiusMeter) {
            const url = ConnectionsApi.SmartAirQuality.urlPrefix + "/SmartDataAirquality/smartdata/records/tbl_measurement_pos?storage=smartmonitoring"
            const posArray = [];
            const response = await fetch(url);
            try {
                const mpObject = JSON.parse(await response.text());
                mpObject.records.forEach(pos => {
                    const distanceMeter = Map.getPlayerDistanceMeter(pos.latitude, pos.longitude);
                    if (distanceMeter >= 0 && distanceMeter <= radiusMeter) {
                        posArray.push(pos);
                    }
                });
            } catch (error) {
                alert(error);
            }
            return posArray;
        },

        // Sends measurement data to the server for a specified sensor
        async sendMeasurement(sensorMAC, smartData) {
            const smartservice = '/SmartDataAirquality/smartdata/records/'
            const tableName = 'sensor_' + sensorMAC;
            const storageName = '?storage=smartmonitoring'
            const url = ConnectionsApi.SmartAirQuality.urlPrefix + smartservice + tableName + storageName;

            const opts = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(smartData),
            };

            try {
                let response = await fetch(url, opts);
                if (response.status === 201) {
                    return true
                }
            } catch (error) {
                console.log(error);
                return false;
            }
            return false;
        }
    }
};

export default ConnectionsApi;