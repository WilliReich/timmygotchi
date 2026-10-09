self.addEventListener("install", event => {
    event.waitUntil(
        caches.open("static").then(cache => {
            return cache.addAll([
                "./index.html",
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
                "./utilities/map.js",
                "./utilities/display.js",
                "./utilities/database.js",
                "./utilities/connections/api.js",
                "./utilities/connections/device.js",
                "./utilities/connections/http.js",
                "./utilities/connections/mock/mockServer.js",
                "./utilities/connections/mock/demoGps.js",
                "./utilities/connections/mock/geo.js",


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
            ]);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // if not cached fetch network data
            return response || fetch(event.request);
        })
    );
});