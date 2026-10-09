let Settings = {
    Player: {
        id: null,               // Stores the player's unique ID, initially set to null
        name: null              // Stores the player's name, initially set to null
    },

    Gps: {
        isEnabled: true,        // Flag to indicate whether GPS is enabled
        refreshSec: 1,          // Refresh interval in seconds
        refreshMin: 1,          // Minimum allowed refresh interval
        refreshMax: 30,         // Maximum allowed refresh interval
    },

    Sensor: {
        refreshSec: 30,         // Refresh interval in seconds
        refreshMin: 1,          // Minimum allowed refresh interval
        refreshMax: 60,         // Maximum allowed refresh interval
    },

    Quest: {
        RADIUS_METER: 30,       // Quest radius in meters
        STAY_TIME_SEC: 40,      // Required time in seconds to stay within the quest radius
        RESPAWN_MIN: 120,       // Minimum respawn time in minutes for quests
        BONUS_DIF_MIN: 5,       // Minimum difference in minutes for bonus quest
        isAutoCenter: false,    // Flag to indicate if the quest map should auto-center
    },
}

export default Settings;
