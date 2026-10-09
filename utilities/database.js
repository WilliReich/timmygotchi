import Settings from "./settings.js";
import Config from "./config.js";

// Database object to handle storage and retrieval of data using Localbase
let Database = {
    db: new Localbase('db' + Config.databaseSuffix),

    Parameter: {
        tableName: 'parameter',
        keySettings: 'settings',
        keyRewards: 'rewards',

        // Method to save the current settings to the database
        saveSettings: function () {
            const data = JSON.stringify(Settings);
            Database.db.collection(this.tableName).doc(this.keySettings).set({
                data
            }, this.keySettings);
        },

        // Method to load settings from the database and update the Settings object
        loadSettings: async function () {
            return await Database.db.collection(this.tableName).doc(this.keySettings).get().then(document => {
                // load settings string from localbase
                if (document != null) {
                    let jsonObj = JSON.parse(document.data);
                    Settings.Player = jsonObj.Player;
                    Settings.Gps = jsonObj.Gps;
                    Settings.Sensor = jsonObj.Sensor;
                    Settings.Quest = jsonObj.Quest;
                }
            })
        },

        // Method to initialize rewards in the database if they don't already exist
        setupRewards: async function () {
            return await this.getRewardCount().then(rewards => {
                if (rewards == null) {
                    Database.db.collection(this.tableName).doc(this.keyRewards).set({
                        normal: 1,
                        bonus: 1,
                    }, this.keySettings);
                }
            });
        },

        // Method to get the current reward count from the database
        getRewardCount: async function () {
            return await Database.db.collection(this.tableName).doc(this.keyRewards).get();
        },

        // Method to update the rewards in the database
        updateRewards: function (rewards) {
            Database.db.collection(this.tableName).doc(this.keyRewards).update({
                bonus: rewards.bonus,
                normal: rewards.normal
            });
        },

        // Method to increment the reward count based on whether it is a bonus or normal reward
        addOneToReward: function (isBonus) {
            this.getRewardCount().then(rewards => {
                if (isBonus) {
                    Database.db.collection(this.tableName).doc(this.keyRewards).update({
                        bonus: rewards.bonus + 1,
                    });
                } else {
                    Database.db.collection(this.tableName).doc(this.keyRewards).update({
                        normal: rewards.normal + 1,
                    });
                }
            });

        },
    },

    // Object to manage measurements stored in the database
    Measurements: {
        questNormal: 0,
        questBonus: 0,

        tableName: 'measurements',

        // Method to add a new measurement to the database
        add: function (route, ts, mac, measurement) {
            Database.db.collection(this.tableName).add(
                {
                    route: route,
                    ts: ts,
                    mac: mac,
                    measurement: measurement,
                    questNormal: Database.Measurements.questNormal,
                    questBonus: Database.Measurements.questBonus
                }
            )
            // Reset quest counters after adding the measurement
            Database.Measurements.questNormal = 0;
            Database.Measurements.questBonus = 0;
        },

        // Method to read all measurements from the database, ordered by timestamp
        read: async function () {
            return await Database.db.collection(this.tableName).orderBy('ts').get().then(data => {
                return data || [];
            });
        },

        // Method to delete a specific measurement by its ID
        deleteOne: function (id) {
            Database.db.collection(this.tableName).doc({id: id}).delete();
        },

        // Method to clear all measurements from the database
        clear: async function () {
            await Database.db.collection(this.tableName).delete();
        }
    },

    // Object to manage completed quests stored in the database
    QuestsDone: {
        tableName: 'questsDone',

        // Method to add a completed quest to the database
        add: function (latitude, longitude) {
            Database.db.collection(this.tableName).add({
                latitude: latitude,
                longitude: longitude,
                timeMin: new Date().getTime() / 60000,
            });
        },

        // Method to check if a specific quest has already been completed
        has: async function (latitude, longitude) {
            return await Database.db.collection(this.tableName).doc({
                latitude: latitude,
                longitude: longitude
            }).get().then(result => {
                return result != null;
            });
        },

        // Method to retrieve all completed quests from the database
        get: async function () {
            return await Database.db.collection(this.tableName).get();
        },

        // Method to delete a specific completed quest by its coordinates
        delete: function (latitude, longitude) {
            Database.db.collection(this.tableName).doc({
                latitude: latitude,
                longitude: longitude
            }).delete();
        },

        // Method to delete all completed quests that are older than the respawn time
        deleteAllOld: function () {
            let timeNowMin = new Date().getTime() / 60000;
            this.get().then(questArray => {
                if (questArray == null) {
                    return;
                }
                questArray.forEach(entry => {
                    let ageMin = timeNowMin - entry.timeMin;
                    if (ageMin > Settings.Quest.RESPAWN_MIN) {
                        this.delete(entry.latitude, entry.longitude);
                    }
                });
            });
        }
    }
}

export default Database;