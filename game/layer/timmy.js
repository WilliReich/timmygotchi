import SPRITES from "../manager/sprites.js";
import Canvas from "../manager/canvas.js";
import TimmyDB from "../manager/database.js";
import Customize from "../manager/customize.js";
import Needs from "../manager/needs.js";


// Timmy class handles the character's appearance, mood, and state updates
export default class Timmy {

    #dst = SPRITES.DST.TIMMY;

    // Determines the sprite to use based on Timmy's mood
    #getMoodSprite() {
        let happiness = Needs.Timmy.happy;
        if (happiness >= 76) {
            return SPRITES.SRC.TIMMY.HAPPY;
        } else if (happiness >= 50) {
            return SPRITES.SRC.TIMMY.NORMAL;
        } else if (happiness >= 26) {
            return SPRITES.SRC.TIMMY.MAD;
        } else {
            return SPRITES.SRC.TIMMY.ANGRY;
        }
    };

    // Updates Timmy's state based on the passage of time
    update() {
        if (Needs.Timmy.lastUpdateSec == null) {
            return;
        }
        const secondsNow = new Date().getTime() / 1000;
        const secondsPassed = secondsNow - Needs.Timmy.lastUpdateSec;
        if (secondsPassed >= Needs.TICK_SEC) {
            let ticks = (secondsPassed / Needs.TICK_SEC).toFixed(0);
            Needs.update(ticks);
            Needs.Timmy.lastUpdateSec = secondsNow;
            TimmyDB.saveNeeds(Needs.Timmy);
        }
    };

    // Renders Timmy and any customizations (e.g., hat, body)
    render() {
        let srcTimmy = this.#getMoodSprite();
        Canvas.draw(srcTimmy, this.#dst);

        if (srcTimmy !== SPRITES.SRC.TIMMY.ANGRY) {
            if(Customize.Items.Selected.hat !== 0){
                let srcHat = Customize.Items.Unlocked.hatArray.at(Customize.Items.Selected.hat);
                Canvas.draw(srcHat, this.#dst);
            }
            if(Customize.Items.Selected.body !== 0){
                let srcBody = Customize.Items.Unlocked.bodyArray.at(Customize.Items.Selected.body);
                Canvas.draw(srcBody, this.#dst);
            }
        }
    };
}