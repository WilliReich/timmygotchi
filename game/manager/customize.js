import SPRITES from "./sprites.js";
import Toast from "../../utilities/toast.js";
import TimmyDB from "./database.js";

let Customize = {
    Items: {
        // Currently selected items
        Selected: {
            background: 0,
            hat: 0,
            body: 0,
        },

        // Items that are unlocked and available for use
        Unlocked: {
            backgroundArray: [
                SPRITES.SRC.BACKGROUND.BG_01,
            ],
            hatArray: [
                'NONE',
            ],
            bodyArray: [
                'NONE',
            ],
        },

        // Items that are initially locked and available for unlocking
        lockedArray: [
            {category: 'BG', sprite: SPRITES.SRC.BACKGROUND.BG_02},
            {category: 'BG', sprite: SPRITES.SRC.BACKGROUND.BG_03},
            {category: 'HAT', sprite: SPRITES.SRC.HAT.HAT_01},
            {category: 'HAT', sprite: SPRITES.SRC.HAT.HAT_02},
            {category: 'HAT', sprite: SPRITES.SRC.HAT.HAT_03},
            {category: 'HAT', sprite: SPRITES.SRC.HAT.HAT_04},
            {category: 'BODY', sprite: SPRITES.SRC.BODY.BODY_01},
            {category: 'BODY', sprite: SPRITES.SRC.BODY.BODY_02},
            {category: 'BODY', sprite: SPRITES.SRC.BODY.BODY_03},
            {category: 'BODY', sprite: SPRITES.SRC.BODY.BODY_04},
        ]
    },

};

// Function to unlock a random item and update the database
Customize.unlockItem = function () {
    TimmyDB.getCustomize().then(items => {
        if(items != null) {
            let len = Customize.Items.lockedArray.length;
            if (len === 0) {
                Toast.show('no items to unlock');
                return;
            }

            // Randomly select an item to unlock
            let index = Math.floor(Math.random() * parseInt(len + ''));
            let unlockedItem = Customize.Items.lockedArray.at(index);

            // Add the unlocked item to the appropriate unlocked category
            if (unlockedItem.category === 'BG') {
                Customize.Items.Unlocked.backgroundArray.push(unlockedItem.sprite);
            } else if (unlockedItem.category === 'HAT') {
                Customize.Items.Unlocked.hatArray.push(unlockedItem.sprite);
            } else if (unlockedItem.category === 'BODY') {
                Customize.Items.Unlocked.bodyArray.push(unlockedItem.sprite);
            }

            // Remove the unlocked item from the locked items array and save
            Customize.Items.lockedArray.splice(index, 1);
            TimmyDB.saveCustomize(Customize.Items);
        }
    });
};

export default Customize;

