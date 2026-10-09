import ConnectionsDevice from "./connections/device.js";

let Map = {
    // Icons for the map markers
    ICONS: {
        PLAYER: L.icon({
            iconUrl: 'images/icons/icon_map_player.png',
            iconSize: [60, 60],
            iconAnchor: [30, 60]
        }),
        QUEST_DEFAULT: L.icon({
            iconUrl: 'images/icons/icon_map_quest.png',
            iconSize: [60, 60],
            iconAnchor: [30, 60]
        }),
        QUEST_BONUS: L.icon({
            iconUrl: 'images/icons/icon_map_quest_bonus.png',
            iconSize: [60, 60],
            iconAnchor: [30, 60]
        }),
    },
};

// Method to create a new map instance with a specified context and zoom level
Map.create = function (context, zoom) {
    let newMap = L.map(context);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(newMap);
    newMap.setZoom((zoom || 13));

    return newMap;
};

// Method to add a player marker on the map, placed at the current position if one is known
Map.addPlayerMarker = function (map) {
    const playerMarker = L.marker([0, 0], {icon: this.ICONS.PLAYER});
    this.updatePlayerMarker(playerMarker);
    playerMarker.addTo(map);
    return playerMarker;
};

// Method to move the player marker to the current GPS position, the map view stays where it is
Map.updatePlayerMarker = function (playerMarker) {
    if (ConnectionsDevice.Gps.position == null) {
        return false;
    }
    const coords = ConnectionsDevice.Gps.position.coords;
    playerMarker.setLatLng(new L.LatLng(coords.latitude, coords.longitude));
    return true;
};

// Method to center the map on the player's current location
Map.centerPlayer = function (map, playerMarker) {
    if (!this.updatePlayerMarker(playerMarker)) {
        return;
    }
    map.setView(playerMarker.getLatLng(), map.getZoom());
    this.reload(map);
};

// Method to reload the map, typically used after resizing or centering
Map.reload = function (map) {
    setTimeout(function () {
        map.invalidateSize();
    }, 500);
}

// Calculate the distance between the player's current location and the specified coordinates
Map.getPlayerDistanceMeter = function (latitude, longitude) {
    if (ConnectionsDevice.Gps.position == null) {
        return -1;
    }
    const coords = ConnectionsDevice.Gps.position.coords
    const from = L.latLng(coords.latitude, coords.longitude);
    const to = L.latLng(latitude, longitude);
    return from.distanceTo(to);
};

// Method to calculate the distance between two sets of coordinates
Map.getDistanceMeter = function (fromLat, fromLng, toLat, toLng) {
    const from = L.latLng(fromLat, fromLng);
    const to = L.latLng(toLat, toLng);
    return from.distanceTo(to);
}

export default Map;