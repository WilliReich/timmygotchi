import SPRITES from "../manager/sprites.js";
import Customize from "../manager/customize.js";
import Canvas from "../manager/canvas.js";

// Class responsible for rendering the background in the game
export default class Background{

    render(){
        // Get the index of the selected background from the customization settings
        let bgIndex = Customize.Items.Selected.background

        // Retrieve the source coordinates
        let src = Customize.Items.Unlocked.backgroundArray.at(bgIndex);

        // Define the destination coordinates
        let dst = SPRITES.DST.BACKGROUND;
        Canvas.draw(src, dst);
    }

}