import Database from "../../utilities/database.js";
import ConnectionsApi from "../../utilities/connections/api.js";
import Settings from "../../utilities/settings.js";

export default class Synchronizer {
    #measurementMap;

    #sessionCount;
    #storedDataCount;

    #syncDataCount;
    #distance;
    #altitude;
    #score;

    // Loads measurement data from the database and initializes internal state
    async loadData() {
        await Database.Measurements.read().then(measurementsArray => {
            this.#measurementMap = new Map();
            this.#storedDataCount = 0;

            measurementsArray.forEach(entry => {
                this.#storedDataCount++;
                let data = this.#measurementMap.get(entry.route);
                if (data == null) {
                    // Create a new entry if it doesn't exist
                    data = {
                        id: entry.id,
                        mac: entry.mac,
                        measurementsArray: [],
                        questNormal: 0,
                        questBonus: 0
                    }
                }
                // Add measurement data to the entry
                data.measurementsArray.push(entry.measurement);
                data.quest_normal += entry.questNormal;
                data.quest_bonus += entry.questBonus;
                // Update the map with the new data
                this.#measurementMap.set(entry.route, data);
            });

            // Set initial session count and reset sync data count
            this.#sessionCount = this.#measurementMap.size;
            this.#syncDataCount = 0;
            this.#distance = 0;
            this.#altitude = 0;
            this.#score = 0;
        });
    };

    // Synchronizes measurement data with an external API
    async sync() {
        let route;
        let mac;
        let questNormal;
        let questBonus;

        // Iterate over each route and its associated data
        for (let [key, value] of this.#measurementMap) {
            await ConnectionsApi.SmartAirQuality.sendMeasurement(value.mac, value.measurementsArray).then(async isSuccess => {
                if (isSuccess) {
                    // Update counts after successful synchronization
                    this.#syncDataCount += value.measurementsArray.length;
                    this.#storedDataCount -= value.measurementsArray.length;
                    this.#sessionCount--;

                    // Capture route and other details for session creation
                    route = key;
                    mac = value.mac;
                    questNormal = value.questNormal;
                    questBonus = value.questBonus;

                    // Create a new session and process the result
                    await this.#createSession(route, mac, questNormal, questBonus);

                    // Delete measurements from the database once synced
                    value.measurementsArray.forEach(entry => {
                        Database.Measurements.deleteOne(entry.id);
                    })
                }
            });
        }

    };

    // Creates a new session and updates distance, altitude, and score
    async #createSession(route, mac, questNormal, questBonus) {
        await ConnectionsApi.SmartGamification.Session.create({
            player_id: Settings.Player.id,
            start_ts: route,
            mac: mac,
            quest_normal: questNormal,
            quest_bonus: questBonus
        }).then(async sessionID => {
            if (sessionID > 0) {
                // Fetch session details and update distance and altitude
                ConnectionsApi.SmartGamification.Session.getById(sessionID).then(session => {
                    if (session != null) {
                        this.#distance += session.distance;
                        this.#altitude += session.altitude;
                    }
                })
                // Fetch session score
                ConnectionsApi.SmartGamification.Score.getSessionScore(sessionID).then(sessionScore => {
                    if (sessionScore != null) {
                        this.#score += sessionScore;
                    }
                })
                // Update the score in the external system
                await ConnectionsApi.SmartGamification.Score.update(sessionID)
            }
        });
    }

    // Returns the current statistics of synchronization
    getStats() {
        return {
            sessionCount: this.#sessionCount,
            dataStored: this.#storedDataCount,
            dataSync: this.#syncDataCount,
            distance: this.#distance,
            altitude: this.#altitude,
            score: this.#score,

        }
    }

}