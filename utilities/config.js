/*
 * Runtime configuration, read once from the page URL.
 *
 *   ?demo=1            demo mode: backend and sensor are simulated inside the browser
 *   ?demo=reset        clears all demo data and restarts the demo
 *   ?api=<base-url>    override the base URL of the SmartEnviroSystem services
 *
 * Demo mode uses separate local databases, so demo data never mixes with real data.
 */
const params = new URLSearchParams(window.location.search);

const isDemo = params.has('demo') && params.get('demo') !== '0';

const Config = {
    isDemo: isDemo,

    // true when all demo data should be wiped before the app starts
    isDemoReset: params.get('demo') === 'reset',

    // Base URL of the SmartGamification and SmartDataAirquality micro services
    apiBaseUrl: (params.get('api') || 'https://scl.fh-bielefeld.de').replace(/\/+$/, ''),

    // Appended to the names of the local databases
    databaseSuffix: isDemo ? '-demo' : '',

    // Overrides for Settings.Quest in demo mode, so a quest can be finished within seconds
    demoQuest: {
        STAY_TIME_SEC: 5,
        RESPAWN_MIN: 1,
    },

    // Zoom level of the quest map in demo mode, close enough to watch the simulated walker
    demoMapZoom: 15,

    // Speed factor for Timmy's needs in demo mode: 360 turns 12 hours into 2 minutes
    demoNeedsSpeedFactor: 360,
};

export default Config;
