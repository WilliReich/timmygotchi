import GUI from "./GUI.js";
import Toast from "./utilities/toast.js";
import Config from "./utilities/config.js";

if (Config.isDemoReset) {
    // ?demo=reset: wipe the demo data and start the demo from scratch
    const { default: resetDemo } = await import("./utilities/connections/mock/demoReset.js");
    await resetDemo();
} else if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./serviceWorker.js").then(() => {
        new GUI();
    }).catch(error => {
        Toast.show("Registration error: " + error);
    })
} else {
    Toast.show("Application not supported by the Browser");
}