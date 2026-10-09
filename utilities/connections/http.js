import Config from "../config.js";

/*
 * Single entry point for the HTTP requests of the app.
 *
 * In demo mode a request never leaves the browser: MockServer answers it with
 * the same JSON contract as the real services. The mock code is only loaded
 * when demo mode is active.
 */
const Http = {
    fetch: (url, options) => window.fetch(url, options),
};

if (Config.isDemo) {
    const { default: MockServer } = await import("./mock/mockServer.js");
    Http.fetch = (url, options) => MockServer.fetch(url, options);
}

export default Http;
