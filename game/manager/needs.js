let Needs = {
    TICK_SEC: 10, // Interval in seconds between each update of needs
    SPEED_FACTOR: 1, // > 1 lets the needs drop faster, the demo mode uses this

    // Configuration for each type of need
    FOOD: {
        LIMIT: 300,
        LAST_HOURS: 32,
        ADD: 50,
    },
    WATER: {
        LIMIT: 300,
        LAST_HOURS: 24,
        ADD: 100,
    },
    CLEAN: {
        LIMIT: 100,
        LAST_HOURS: 12,
        ADD: 100,
    },
    QUEST: {
        LIMIT: 100,
        LAST_HOURS: 48,
        ADD: 100,
    },

    // Subtraction values for needs per tick
    SUBTRAHEND: {
        FOOD: 1,
        WATER: 1,
        CLEAN: 1,
        QUEST: 1,
    },

    // Timmy's current state and needs values
    Timmy: {
        BIRTHDAY_MIN: null,
        lastUpdateSec: null,
        food: 300,
        water: 300,
        clean: 100,
        quest: 100,
        happy: 100,
    },

    // Percentage values for needs to be displayed in the HUD
    Percent: {
        food: 0,
        water: 0,
        clean: 0,
        quest: 0,
        happy: 0,
    },
};

// Initialize the subtrahend values and update percentages
Needs.setup = function () {
    this.SUBTRAHEND.FOOD = this.calcSubtrahend(this.FOOD);
    this.SUBTRAHEND.WATER = this.calcSubtrahend(this.WATER);
    this.SUBTRAHEND.CLEAN = this.calcSubtrahend(this.CLEAN);
    this.SUBTRAHEND.QUEST = this.calcSubtrahend(this.QUEST);
    this.updatePercent();
};

// Calculate how much a need decreases per tick
Needs.calcSubtrahend = function (need) {
    const subPerSecond = need.LIMIT * Needs.SPEED_FACTOR / (need.LAST_HOURS * 3600);
    return (subPerSecond * Needs.TICK_SEC).toFixed(5);
};

// Update Timmy's needs based on the elapsed ticks
Needs.update = function (ticks) {
    while (ticks > 0) {
        this.Timmy.food = this.subtractFromNeed(this.Timmy.food, this.SUBTRAHEND.FOOD);
        this.Timmy.water = this.subtractFromNeed(this.Timmy.water, this.SUBTRAHEND.WATER);
        this.Timmy.clean = this.subtractFromNeed(this.Timmy.clean, this.SUBTRAHEND.CLEAN);
        this.Timmy.quest = this.subtractFromNeed(this.Timmy.quest, this.SUBTRAHEND.QUEST);
        ticks--;
    }
    this.updatePercent();
};

// Subtract the subtrahend value from a need, ensuring it doesn’t go below zero
Needs.subtractFromNeed = function (need, subtrahend) {
    if (need > 0) {
        let result = (need - subtrahend);
        if (result > 0) {
            return result;
        }
    }
    return 0;
};

// Update percentage values for needs and calculate Timmy’s happiness
Needs.updatePercent = function () {
    this.Percent.food = this.calcPercent(this.FOOD, this.Timmy.food);
    this.Percent.water = this.calcPercent(this.WATER, this.Timmy.water);
    this.Percent.clean = this.calcPercent(this.CLEAN, this.Timmy.clean);
    this.Percent.quest = this.calcPercent(this.QUEST, this.Timmy.quest);
    this.Percent.happy = (this.Percent.food + this.Percent.water + this.Percent.clean + this.Percent.quest) / 4;
    this.Timmy.happy = (this.Percent.happy * 100).toFixed(0);
};

// Calculate the percentage of a need’s current value relative to its limit
Needs.calcPercent = function (need, value) {
    return 1 / need.LIMIT * Math.ceil(value);
};

// Get the number of days Timmy has lived
Needs.getDaysLived = function () {
    const milliMin = 60000;
    const minDay = 1440;
    const secondsNow = new Date().getTime() / milliMin;

    let days = ((secondsNow - Needs.Timmy.BIRTHDAY_MIN) / minDay).toFixed(0);
    if (days > '999') {
        return '999'
    } else {
        return days;
    }
};


Needs.addFood = function () {
    this.Timmy.food = this.add(this.Timmy.food, this.FOOD);
    this.updatePercent();
};

Needs.addWater = function () {
    this.Timmy.water = this.add(this.Timmy.water, this.WATER);
    this.updatePercent();
};

Needs.addClean = function () {
    this.Timmy.clean = this.add(this.Timmy.clean, this.CLEAN);
    this.updatePercent();
};

Needs.addQuest = function () {
    this.Timmy.quest = this.add(this.Timmy.quest, this.QUEST);
    this.updatePercent();
};

// Add a specified amount to a need, ensuring it doesn’t exceed the limit
Needs.add = function (value, need) {
    const result = value + need.ADD;
    if (result > need.LIMIT) {
        return need.LIMIT;
    } else {
        return result;
    }
};

export default Needs;