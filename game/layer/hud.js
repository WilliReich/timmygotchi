import SPRITES from "../manager/sprites.js";
import Canvas from "../manager/canvas.js";
import TimmyDB from "../manager/database.js";
import Customize from "../manager/customize.js";
import Needs from "../manager/needs.js";

// Customize buttons: which selection they change and in which direction
const CUSTOMIZE_BUTTONS = [
    { button: 'BG_NEXT',   selection: 'background', unlocked: 'backgroundArray', step: 1 },
    { button: 'BG_PREV',   selection: 'background', unlocked: 'backgroundArray', step: -1 },
    { button: 'HAT_NEXT',  selection: 'hat',        unlocked: 'hatArray',        step: 1 },
    { button: 'HAT_PREV',  selection: 'hat',        unlocked: 'hatArray',        step: -1 },
    { button: 'BODY_NEXT', selection: 'body',       unlocked: 'bodyArray',       step: 1 },
    { button: 'BODY_PREV', selection: 'body',       unlocked: 'bodyArray',       step: -1 },
];

// HUD (Heads-Up Display) class responsible for rendering and handling user input for the game's HUD
export default class HUD {

    #isCustomize = false;
    #inputCoords = null;

    // Processes user input based on coordinates
    doInput(inputCoords) {
        if (inputCoords == null) {
            return;
        }
        this.#inputCoords = inputCoords;
        let dst = SPRITES.DST.BUTTON;

        if (this.#isCustomize) {
            // Handle inputs in customization mode
            if (this.#isBtnPressed(dst.CUSTOM_BACK)) {
                TimmyDB.getCustomize().then(items => {
                    if(items != null){
                        Customize.Items = items;
                    }
                    this.#isCustomize = false;
                });
            } else if (this.#isBtnPressed(dst.CUSTOM_SAVE)) {
                TimmyDB.saveCustomize(Customize.Items)
                this.#isCustomize = false;
            } else {
                // Select customization items: next or previous background, hat or body
                const pressed = CUSTOMIZE_BUTTONS.find(entry => this.#isBtnPressed(dst[entry.button]));
                if (pressed != null) {
                    this.#selectNext(pressed);
                }
            }
        } else {
            // Handle inputs in game mode
            if (this.#isBtnPressed(dst.FOOD)) {
                Needs.addFood();
                TimmyDB.saveNeeds(Needs.Timmy);
            } else if (this.#isBtnPressed(dst.WATER)) {
                Needs.addWater();
                TimmyDB.saveNeeds(Needs.Timmy);
            } else if (this.#isBtnPressed(dst.CLEAN)) {
                Needs.addClean();
                TimmyDB.saveNeeds(Needs.Timmy);
            } else if (this.#isBtnPressed(dst.CUSTOMIZE)) {
                TimmyDB.getCustomize().then(items => {
                    if(items != null){
                        Customize.Items = items;
                    }
                    this.#isCustomize = true;
                });
            }
        }
        this.#inputCoords = null;
    }

    // Checks if the input coordinates are within the bounds of a given button
    #isBtnPressed(button) {
        if (this.#inputCoords.y < button.y || this.#inputCoords.y > button.y + button.h) {
            return false;
        } else if (this.#inputCoords.x < button.x || this.#inputCoords.x > button.x + button.w) {
            return false;
        } else {
            return true;
        }
    }

    // Moves the selection of one customize category one step forward or back
    #selectNext({ selection, unlocked, step }) {
        const index = Customize.Items.Selected[selection] + step;
        const length = Customize.Items.Unlocked[unlocked].length;
        Customize.Items.Selected[selection] = this.#nextIndexLoop(index, length);
    }

    // Loops through the array indices with wrapping behavior
    #nextIndexLoop(nextIndex, length) {
        let lastIndex = length - 1;
        if (nextIndex > lastIndex) {
            return 0;
        } else if (nextIndex < 0) {
            return lastIndex;
        }
        return nextIndex;
    }

    // Renders a status bar indicating the percentage of a particular resource
    #renderStatusBar(target, percent) {
        let src = SPRITES.SRC.HUD.STATUSBAR;
        let srcBar = {
            x: src.x,
            y: src.y,
            w: src.w,
            h: src.h * percent,
        }
        let dstBar = {
            x: target.x,
            y: target.y + target.h * (1 - percent),
            w: target.w,
            h: target.h * percent,
        }
        Canvas.draw(srcBar, dstBar);
    }

    // Renders the age of the character as a series of digits
    #renderAge() {
        let age = Needs.getDaysLived();
        let len = age.length;
        let dstIndex = 0;
        let dst = [
            SPRITES.DST.HUD.AGE_ONE,
            SPRITES.DST.HUD.AGE_TEN,
            SPRITES.DST.HUD.AGE_HUNDRED
        ];

        while (len > 0) {
            if (dstIndex >= dst.length) {
                return;
            }
            let num = age.at(len - 1);
            let srcNum = this.#getNumberSprite(num);
            Canvas.draw(srcNum, dst.at(dstIndex));
            dstIndex++;
            len--;
        }
    }

    // Returns the sprite corresponding to a given digit
    #getNumberSprite(num) {
        let src = SPRITES.SRC.NUMBERS;
        switch (num) {
            case '1':
                return src.ONE;
            case '2':
                return src.TWO;
            case '3':
                return src.THREE;
            case '4':
                return src.FOUR;
            case '5':
                return src.FIVE;
            case '6':
                return src.SIX;
            case '7':
                return src.SEVEN;
            case '8':
                return src.EIGHT;
            case '9':
                return src.NINE;
            default:
                return src.ZERO;
        }
    }

    // Renders the game mode buttons on the HUD
    #renderGameBtn() {
        let srcBtn = SPRITES.SRC.BUTTON;
        let dstBtn = SPRITES.DST.BUTTON;
        Canvas.draw(srcBtn.FOOD, dstBtn.FOOD);
        Canvas.draw(srcBtn.WATER, dstBtn.WATER);
        Canvas.draw(srcBtn.CLEAN, dstBtn.CLEAN);
        Canvas.draw(srcBtn.CUSTOMIZE, dstBtn.CUSTOMIZE);
    }

    // Renders the customization mode buttons on the HUD
    #renderCustomizeBtn() {
        let srcBtn = SPRITES.SRC.BUTTON;
        let dstBtn = SPRITES.DST.BUTTON;
        Canvas.draw(srcBtn.CUSTOM_BACK, dstBtn.CUSTOM_BACK);
        Canvas.draw(srcBtn.CUSTOM_SAVE, dstBtn.CUSTOM_SAVE);
        Canvas.draw(srcBtn.NEXT, dstBtn.BG_NEXT);
        Canvas.draw(srcBtn.PREV, dstBtn.BG_PREV);
        Canvas.draw(srcBtn.NEXT, dstBtn.HAT_NEXT);
        Canvas.draw(srcBtn.PREV, dstBtn.HAT_PREV);
        Canvas.draw(srcBtn.NEXT, dstBtn.BODY_NEXT);
        Canvas.draw(srcBtn.PREV, dstBtn.BODY_PREV);
    }

    // Main render function for the HUD
    render() {
        let dstHUD = SPRITES.DST.HUD;
        let srcHUD = SPRITES.SRC.HUD;

        Canvas.ctx.fillStyle = "#ffffff";
        Canvas.ctx.fillRect(
            dstHUD.FRAME.x * Canvas.scale,
            dstHUD.FRAME.y * Canvas.scale,
            dstHUD.FRAME.w * Canvas.scale,
            dstHUD.FRAME.h * Canvas.scale
        );

        this.#renderStatusBar(dstHUD.FOOD_STAT, Needs.Percent.food);
        this.#renderStatusBar(dstHUD.WATER_STAT, Needs.Percent.water);
        this.#renderStatusBar(dstHUD.CLEAN_STAT, Needs.Percent.clean);
        this.#renderStatusBar(dstHUD.QUEST_STAT, Needs.Percent.quest);
        this.#renderStatusBar(dstHUD.HAPPY_STAT, Needs.Percent.happy);

        Canvas.draw(srcHUD.FRAME, dstHUD.FRAME);

        this.#renderAge();

        if (this.#isCustomize) {
            this.#renderCustomizeBtn();
        } else {
            this.#renderGameBtn();
        }
    };
}