import Map from '../../utilities/map.js'
import ConnectionsApi from "../../utilities/connections/api.js";
import ConnectionsDevice from "../../utilities/connections/device.js";
import Settings from "../../utilities/settings.js";
import Database from "../../utilities/database.js";

export default class QuestMap {

    #COLOR_CIRCLE_RADIUS = '#3daf1b';
    #COLOR_QUEST_DEFAULT = '#e55a22';
    #COLOR_QUEST_SELECTED = '#ad12fa';

    #map;
    #playerMarker;
    #selectedQuestMarker = null;
    #routeMarker = null;

    #radiusCircle = null;
    #questMarkerArray = [];
    #route = null;

    constructor(context) {
        let defaultZoom = 12;
        this.#map = Map.create(context, defaultZoom);
        this.#playerMarker = Map.addPlayerMarker(this.#map);
        this.centerPlayer();
    }

    // Method to clear all markers and circles from the map
    #clearAll() {
        this.#clearRadiusCircle();
        this.#clearAllQuestMarker();
        this.#clearRoute();
    };

    // Method to clear the radius circle from the map
    #clearRadiusCircle() {
        if (this.#radiusCircle != null) {
            this.#map.removeLayer(this.#radiusCircle);
        }
        this.#radiusCircle = null;
    };

    // Method to clear all quest markers from the map
    #clearAllQuestMarker() {
        if (this.#questMarkerArray != null) {
            this.#questMarkerArray.forEach(marker => {
                this.deleteOneQuestMarker(marker);
            });
        }
        this.#questMarkerArray = [];
    };

    // Method to clear the route from the map
    #clearRoute() {
        if (this.#route != null) {
            this.#route.remove();
        }
        this.#route = null;
        this.#routeMarker = null;
    };

    // Method to add a radius circle to the map
    #addRadiusCircle(radiusMeter) {
        this.#clearRadiusCircle();
        let coords = ConnectionsDevice.Gps.position.coords;
        this.#radiusCircle = L.circle([coords.latitude, coords.longitude], {
            color: 'green', fillColor: this.#COLOR_CIRCLE_RADIUS, fillOpacity: 0.2, radius: radiusMeter
        }).addTo(this.#map);
    };

    // Method to load and display quest markers within a specified radius
    async #loadQuestMarker(radiusMeter) {
        // Delete old quest records from the database
        Database.QuestsDone.deleteAllOld();
        // Fetch new quest positions from the server within the specified radius
        return await ConnectionsApi.SmartAirQuality.getPosArray(radiusMeter).then(pointsArray => {
            pointsArray.forEach(point => {
                // Check if the quest at this location is already completed
                Database.QuestsDone.has(point.latitude, point.longitude).then(hasQuest => {
                    if (!hasQuest) {
                        // Create and display a new quest marker on the map
                        const questMarker = this.#createQuestMarker(point);
                        this.#questMarkerArray.push(questMarker);
                        questMarker.radiusCircle.addTo(this.#map);
                        questMarker.addTo(this.#map);
                    }
                });
            });
        });
    };

    // Create and display a new quest marker on the map// Method to create a quest marker at a given point
    #createQuestMarker(mPoint) {
        let questMarker = L.marker([mPoint.latitude, mPoint.longitude,]);
        questMarker.radiusCircle = L.circle(questMarker.getLatLng(), {
            color: 'orange',
            fillColor: this.#COLOR_QUEST_DEFAULT,
            fillOpacity: 0.5,
            radius: Settings.Quest.RADIUS_METER,
        });
        // Save the bonus time information to the marker
        questMarker.bonusTime = this.#getBonusTimeToday(mPoint);

        // Set the marker icon based on whether there is bonus time
        if (questMarker.bonusTime != null && questMarker.bonusTime.length > 0) {
            questMarker.bindPopup('Bonus Time: ' + questMarker.bonusTime);
            questMarker.setIcon(Map.ICONS.QUEST_BONUS);
        } else {
            questMarker.setIcon(Map.ICONS.QUEST_DEFAULT);
        }

        // Set up a click event listener for the marker
        questMarker.on("click", () => {
            this.#setSelectedMarker(questMarker);
        });
        return questMarker;
    };

    // Method to get the bonus time for today from a quest point
    #getBonusTimeToday(point) {
        let timeToday;

        switch (new Date().getDay()) {
            case 0:
                timeToday = point.sun.toString();
                break;
            case 1:
                timeToday = point.mon.toString();
                break;
            case 2:
                timeToday = point.tue.toString();
                break;
            case 3:
                timeToday = point.wed.toString();
                break;
            case 4:
                timeToday = point.thu.toString();
                break;
            case 5:
                timeToday = point.fri.toString();
                break;
            case 6:
                timeToday = point.sat.toString();
                break;
            default:
                timeToday = "";
                break;
        }
        return timeToday;
    }

    // Method to set the selected quest marker and update its style
    #setSelectedMarker(marker) {
        if (this.#selectedQuestMarker != null) {
            this.#selectedQuestMarker.radiusCircle.setStyle({fillColor: this.#COLOR_QUEST_DEFAULT});
        }
        this.#selectedQuestMarker = marker;
        this.#selectedQuestMarker.radiusCircle.setStyle({fillColor: this.#COLOR_QUEST_SELECTED});
    };

    // Method to display quest markers within a specified radius
    async showQuestMarker(radiusMeter) {
        Map.centerPlayer(this.#map, this.#playerMarker);
        this.#clearAll();
        this.#addRadiusCircle(radiusMeter);
        await this.#loadQuestMarker(radiusMeter);
    };

    // Method to add a route from the player to the selected quest marker
    addRoute() {
        if (this.#selectedQuestMarker == null) {
            alert('no quest selected');
            return;
        }
        this.#clearRoute();
        this.#routeMarker = this.#selectedQuestMarker;
        this.#route = L.Routing.control({
            waypoints: [this.#playerMarker.getLatLng(), this.#routeMarker.getLatLng(),], // disable route points display
            show: false, // disable default route marker
            createMarker: function () {
                return null;
            },
        }).addTo(this.#map);
    };

    // Method to reload the map view
    reload() {
        Map.reload(this.#map);
    };

    // Method to delete a single quest marker from the map
    deleteOneQuestMarker(marker) {
        if (this.#questMarkerArray != null) {
            if (this.#routeMarker === marker) {
                this.#clearRoute();
            }
            this.#map.removeLayer(marker.radiusCircle);
            this.#map.removeLayer(marker);
            let index = this.#questMarkerArray.indexOf(marker);
            this.#questMarkerArray.splice(index, 1);
        }
    };

    // Method to find the closest quest marker to the player
    getClosestMarker() {
        let closestQuest = {
            marker: null, distance: -1
        };

        if (this.#questMarkerArray == null || this.#questMarkerArray.length === 0) {
            return closestQuest;
        }

        this.#questMarkerArray.forEach(marker => {
            let latLng = marker.getLatLng();
            let distance = Map.getPlayerDistanceMeter(latLng.lat, latLng.lng);
            if (closestQuest.distance < 0 || (distance >= 0 && distance < closestQuest.distance)) {
                closestQuest.marker = marker;
                closestQuest.distance = distance;
            }
        });
        return closestQuest;
    };

    centerPlayer() {
        Map.centerPlayer(this.#map, this.#playerMarker);
    }

    // Moves the player marker to the current position without touching the map view
    updatePlayer() {
        Map.updatePlayerMarker(this.#playerMarker);
    }
}
