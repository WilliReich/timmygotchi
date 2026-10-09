/*
 * Runtime configuration, read once from the page URL.
 *
 *   ?demo=1            demo mode: backend and sensor are simulated inside the browser
 *   ?api=<base-url>    override the base URL of the SmartEnviroSystem services
 *
 * Demo mode uses separate local databases, so demo data never mixes with real data.
 */
const params = new URLSearchParams(window.location.search);

const isDemo = params.has('demo') && params.get('demo') !== '0';

const Config = {
    isDemo: isDemo,

    // Base URL of the SmartGamification and SmartDataAirquality micro services
    apiBaseUrl: (params.get('api') || 'https://scl.fh-bielefeld.de').replace(/\/+$/, ''),

    // Appended to the names of the local databases
    databaseSuffix: isDemo ? '-demo' : '',
};

export default Config;
