const SPRITES = {
    // Source coordinates in the sprite sheet
    SRC: {
        BACKGROUND: {
            BG_01: {x: 16, y: 32, w: 350, h: 550},
            BG_02: {x: 368, y: 32, w: 350, h: 550},
            BG_03: {x: 720, y: 32, w: 350, h: 550},
        },

        TIMMY: {
            HAPPY: {x: 16, y: 656, w: 256, h: 256},
            NORMAL: {x: 16, y: 928, w: 256, h: 256},
            MAD: {x: 16, y: 1200, w: 256, h: 256},
            ANGRY: {x: 16, y: 1472, w: 256, h: 256},
        },

        HAT:{
            HAT_01: {x: 400,y: 656, w: 256, h: 256},
            HAT_02: {x: 672,y: 656, w: 256, h: 256},
            HAT_03: {x: 944,y: 656, w: 256, h: 256},
            HAT_04: {x: 1216,y: 656, w: 256, h: 256},
        },

        BODY:{
            BODY_01: {x: 400,y: 944, w: 256, h: 256},
            BODY_02: {x: 672,y: 944, w: 256, h: 256},
            BODY_03: {x: 944,y: 944, w: 256, h: 256},
            BODY_04: {x: 1216,y: 944, w: 256, h: 256},
        },

        HUD: {
            FRAME: {x: 400, y: 1296, w: 1050, h: 270},
            STATUSBAR: {x: 1467, y: 1308, w: 66, h: 156},
        },

        NUMBERS: {
          ZERO: {x: 16, y: 2016, w: 32, h: 32},
          ONE: {x: 48, y: 2016, w: 32, h: 32},
          TWO: {x: 80, y: 2016, w: 32, h: 32},
          THREE: {x: 112, y: 2016, w: 32, h: 32},
          FOUR: {x: 144, y: 2016, w: 32, h: 32},
          FIVE: {x: 176, y: 2016, w: 32, h: 32},
          SIX: {x: 208, y: 2016, w: 32, h: 32},
          SEVEN: {x: 240, y: 2016, w: 32, h: 32},
          EIGHT: {x: 272, y: 2016, w: 32, h: 32},
          NINE: {x: 304, y: 2016, w: 32, h: 32},
        },

        BUTTON: {
            FOOD: {x: 192, y: 1792, w: 64, h: 64},
            WATER: {x: 272, y: 1792, w: 64, h: 64},
            CLEAN: {x: 272, y: 1888, w: 64, h: 64},
            CUSTOMIZE: {x: 176, y: 1888, w: 64, h: 64},
            CUSTOM_BACK: {x: 16, y: 1888, w: 64, h: 64},
            CUSTOM_SAVE: {x: 96, y: 1888, w: 64, h: 64},
            NEXT:{x: 96, y: 1792, w: 64, h: 64},
            PREV:{x: 16, y: 1792, w: 64, h: 64},
        },
    },

    // Destination coordinates on the canvas
    DST: {
        BACKGROUND: {x: 0, y: 0, w: 350, h: 550},
        TIMMY: {x: 47, y: 227, w: 256, h: 256},
        HUD: {
            FRAME: {x: 0, y: 0, w: 350, h: 90},
            FOOD_STAT: {x: 21, y: 36, w: 24, h: 44},
            WATER_STAT: {x: 67, y: 36, w: 24, h: 44},
            CLEAN_STAT: {x: 113, y: 36, w: 24, h: 44},
            QUEST_STAT: {x: 159, y: 36, w: 24, h: 44},
            HAPPY_STAT: {x: 205, y: 36, w: 24, h: 44},
            AGE_HUNDRED: {x: 252, y: 38, w: 24, h: 24},
            AGE_TEN: {x: 276, y: 38, w: 24, h: 24},
            AGE_ONE: {x: 300, y: 38, w: 24, h: 24},
        },

        // Button positions on the HUD for interaction
        BUTTON: {
            CUSTOMIZE: {x: 15, y: 110, w: 32, h: 32},
            FOOD: {x: 77, y: 495, w: 40, h: 40},
            WATER: {x: 155, y: 495, w: 40, h: 40},
            CLEAN: {x: 233, y: 495, w: 40, h: 40},

            CUSTOM_BACK: {x: 15, y: 110, w: 32, h: 32},
            CUSTOM_SAVE: {x: 57, y: 110, w: 32, h: 32},
            BG_NEXT:{x: 305, y: 180, w: 32, h: 32},
            BG_PREV:{x: 15, y: 180, w: 32, h: 32},
            HAT_NEXT:{x: 305, y: 300, w: 32, h: 32},
            HAT_PREV:{x: 15, y: 300, w: 32, h: 32},
            BODY_NEXT:{x: 305, y: 400, w: 32, h: 32},
            BODY_PREV:{x: 15, y: 400, w: 32, h: 32},
        }
    },

};

export default SPRITES;