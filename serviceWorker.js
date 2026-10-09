/*
 * Service worker: precaches the app files so the game also starts offline.
 *
 * CACHE_NAME carries a version. Bump it with every deployment: the new worker
 * installs a fresh cache, takes over immediately and removes the old caches.
 * Requests go to the network first, so an online player always gets the
 * current files; the cache is the fallback when the network is unavailable.
 */
const CACHE_NAME = "timmygotchi-v4";

const APP_FILES = [
    "./index.html",
    "./manifest.json",
    "./index.css",
    "./index.js",
    "./GUI.js",


    "./views/view.js",
    "./views/view.css",
    "./views/default.html",
    "./views/htmlLoader.js",

    "./views/Sync/viewSync.html",
    "./views/Sync/viewSync.js",
    "./views/Sync/synchronizer.js",

    "./views/Settings/viewSettings.html",
    "./views/Settings/viewSettings.js",

    "./views/Sensor/viewSensor.html",
    "./views/Sensor/viewSensor.js",
    "./views/Sensor/Measure.js",

    "./views/Rewards/viewRewards.html",
    "./views/Rewards/viewRewards.js",
    "./views/Rewards/rewards.js",

    "./views/Quest/viewQuest.html",
    "./views/Quest/viewQuest.js",
    "./views/Quest/questMap.js",
    "./views/Quest/activeQuest.js",

    "./views/GPS/viewGPS.html",
    "./views/GPS/viewGPS.js",

    "./views/Game/viewGame.html",
    "./views/Game/viewGame.js",

    "./views/Achievements/viewAchievements.html",
    "./views/Achievements/viewAchievements.js",


    "./utilities/config.js",
    "./utilities/settings.js",
    "./utilities/toast.js",
    "./utilities/map.js",
    "./utilities/display.js",
    "./utilities/database.js",
    "./utilities/connections/api.js",
    "./utilities/connections/device.js",
    "./utilities/connections/http.js",
    "./utilities/connections/mock/mockServer.js",
    "./utilities/connections/mock/demoGps.js",
    "./utilities/connections/mock/geo.js",
    "./utilities/connections/mock/demoReset.js",


    "./images/logos/logo192.png",
    "./images/logos/logo512.png",

    "./images/icons/icon_sync.png",
    "./images/icons/icon_settings.png",
    "./images/icons/icon_sensor.png",
    "./images/icons/icon_rewards.png",
    "./images/icons/icon_quest.png",
    "./images/icons/icon_online.png",
    "./images/icons/icon_map_quest_bonus.png",
    "./images/icons/icon_map_quest.png",
    "./images/icons/icon_map_player.png",
    "./images/icons/icon_gps.png",
    "./images/icons/icon_game.png",
    "./images/icons/icon_disable.png",
    "./images/icons/icon_achievements.png",

    "./images/background/bodyBackground.png",
    "./images/background/intro.png",
    "./images/background/static_no_signal.png",


    "./game/gameAPI.js",
    "./game/game.js",

    "./game/manager/canvas.js",
    "./game/manager/customize.js",
    "./game/manager/database.js",
    "./game/manager/needs.js",
    "./game/manager/sprites.js",

    "./game/layer/background.js",
    "./game/layer/hud.js",
    "./game/layer/timmy.js",

    "./game/images/sprites.png",
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

// Remove the caches of previous versions and take control of the open pages
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") {
        return;
    }
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // keep the cached copy of our own files fresh for offline use
                if (response.ok && event.request.url.startsWith(self.location.origin)) {
                    const copy = response.clone();
                    event.waitUntil(
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy))
                    );
                }
                return response;
            })
            .catch(() => offlineResponse(event.request))
    );
});

// Offline fallback: the cached file, or for page loads the cached index.html
function offlineResponse(request) {
    return caches.match(request, { ignoreSearch: true }).then(cached => {
        if (cached != null) {
            return cached;
        }
        if (request.mode === "navigate") {
            return caches.match("./index.html");
        }
        return Response.error();
    });
}
