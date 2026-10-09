import GUI from "./GUI.js";

if("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./serviceWorker.js").then(registration => {
        let gui = new GUI();

    }).catch(error => {
        alert("Registration error: " + error);
    })
} else {
    alert("Application not supported by the Browser");
}