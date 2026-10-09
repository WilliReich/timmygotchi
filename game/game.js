import TimmyDB from "./manager/database.js";
import Canvas from "./manager/canvas.js";
import Needs from "./manager/needs.js";
import Customize from "./manager/customize.js";

import Background from "./layer/background.js";
import Timmy from "./layer/timmy.js";
import HUD from "./layer/hud.js";

/*
 * Timmygotchi main game class
 *
 * @author Willi Reich
 */
export default class Game {

    #stepTime = 1/60;       // Time step for game updates (60 FPS)
    #isRunning = true;

    #background;
    #timmy;
    #hud;

    constructor(canvas) {
        Canvas.setup(canvas);
        this.#loadSavedData();

        // Create instances for different game layers
        this.#background = new Background();
        this.#timmy = new Timmy();
        this.#hud = new HUD();

        this.#addInputListener();
    }

    // Load saved data from the database or initialize new data
    #loadSavedData(){
        // Load saved needs from the database
        TimmyDB.getNeeds().then( needs => {
            if(needs == null){
                const millisNow = new Date().getTime();
                // time in minutes
                Needs.Timmy.BIRTHDAY_MIN = millisNow / 60000;
                // time in seconds
                Needs.Timmy.lastUpdateSec = millisNow / 1000;
            }else {
                Needs.Timmy = needs;
            }
        });

        // Load saved customization items from the database
        TimmyDB.getCustomize().then( items => {
            if(items == null){
                TimmyDB.saveCustomize(Customize.Items);
            }else {
                Customize.Items = items;
            }
        });
        Needs.setup();
    };

    // Add an event listener for user input (mouse/touch events)
    #addInputListener(){
        Canvas.canvas.addEventListener('pointerdown' , event => {
            let inputCoords = {
                x:(event.x - Canvas.offsetLeft) / Canvas.scale,
                y:(event.y - Canvas.offsetTop) / Canvas.scale,
            };
            this.#hud.doInput(inputCoords);
        });
    };

    stopGameLoop(){
        this.#isRunning = false;
    };

    // Start the game loop
    startGameLoop(){
        this.#isRunning = true;
        let timeLast;
        const step = (timeNow) => {
            if(timeLast === undefined){
                timeLast = timeNow;
            }
            let deltaTime = (timeNow - timeLast) / 1000;
            while (deltaTime >= this.#stepTime){
                // One frame action
                this.#timmy.update();
                this.#render();
                deltaTime -= this.#stepTime;
            }
            timeLast = timeNow - deltaTime * 1000;
            if(this.#isRunning){
                requestAnimationFrame(step);
            }
        }
        // First step
        requestAnimationFrame(step);
    };

    // Draw game layer on canvas
    #render(){
        Canvas.clear();
        this.#background.render();
        this.#timmy.render();
        this.#hud.render();
    };
}