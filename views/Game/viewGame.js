import View from "../view.js";
import Game from "../../game/game.js";
import Display from "../../utilities/display.js";
import ConnectionsApi from "../../utilities/connections/api.js";

export default class ViewGame extends View {
    #canvas;
    #game;

    setElements(){
        super.setElements();
        this.#canvas = this.html.querySelector('.game-canvas');
        this.#game = new Game(this.#canvas);
    }

    show() {
        super.show();
        this.#game.startGameLoop();
    }

    // Method to close the game view and stop the game loop
    close() {
        super.close();
        this.#game.stopGameLoop();
    }

    resize(){
        super.resize();
        let offset = Display.getOffset();
        // adjust canvas size relative to browser window
        ConnectionsApi.Game.sendResize(Display.height, Display.width, offset.top, offset.left);
    }
}