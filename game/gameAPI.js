import Canvas from "./manager/canvas.js";
import Toast from "../utilities/toast.js";
import TimmyDB from "./manager/database.js";
import Needs from "./manager/needs.js";
import Customize from "./manager/customize.js";

// GameAPI provides methods for interacting with the game’s internal logic
let GameAPI = {
    GET: {
        // Retrieves the number of days Timmy has lived, using the Needs module
        timmyAge: function () {
            return Needs.getDaysLived();
        },
    },

    PUT: {
        // Updates the size and position of the canvas
        newSize: function (height, width, offsetTop, offsetLeft) {
            Canvas.updateSize(height, width, offsetTop, offsetLeft);
        },

        // Updates Timmy’s quest needs
        questDone: function () {
            Needs.addQuest();
            TimmyDB.saveNeeds(Needs.Timmy);
        },

        // Unlocks a reward
        unlockReward: function (isBonus) {
            if (isBonus) {
                Toast.show("bonus reward unlocked");
            } else {
                Toast.show("reward unlocked");
            }
            Customize.unlockItem();
        }
    }
}

export default GameAPI;