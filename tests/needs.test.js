import { describe, it, expect, beforeEach } from 'vitest';
import Needs from '../game/manager/needs.js';

const DAY_MIN = 1440;

function resetTimmy() {
    Needs.SPEED_FACTOR = 1;
    Needs.Timmy.food = Needs.FOOD.LIMIT;
    Needs.Timmy.water = Needs.WATER.LIMIT;
    Needs.Timmy.clean = Needs.CLEAN.LIMIT;
    Needs.Timmy.quest = Needs.QUEST.LIMIT;
    Needs.Timmy.BIRTHDAY_MIN = Date.now() / 60000;
    Needs.setup();
}

describe('Needs.setup', () => {
    beforeEach(resetTimmy);

    it('derives the loss per tick from limit and lifetime', () => {
        // cleanliness: 100 points over 12 hours, in ticks of 10 seconds
        expect(Number(Needs.SUBTRAHEND.CLEAN)).toBeCloseTo(100 / (12 * 3600) * 10, 5);
        expect(Number(Needs.SUBTRAHEND.FOOD)).toBeCloseTo(300 / (32 * 3600) * 10, 5);
    });

    it('scales the loss with the speed factor', () => {
        Needs.SPEED_FACTOR = 360;
        Needs.setup();
        expect(Number(Needs.SUBTRAHEND.CLEAN)).toBeCloseTo(8.33333, 4);
    });
});

describe('Needs.update', () => {
    beforeEach(resetTimmy);

    it('subtracts the loss once per tick', () => {
        Needs.SPEED_FACTOR = 360;
        Needs.setup();
        Needs.update(2);
        expect(Needs.Timmy.food).toBeCloseTo(300 - 2 * 9.375, 3);
    });

    it('never lets a need drop below zero', () => {
        Needs.SPEED_FACTOR = 360;
        Needs.setup();
        Needs.Timmy.clean = 10;
        Needs.update(5);
        expect(Needs.Timmy.clean).toBe(0);
    });
});

describe('feeding', () => {
    beforeEach(resetTimmy);

    it('adds the configured amount', () => {
        Needs.Timmy.water = 100;
        Needs.addWater();
        expect(Needs.Timmy.water).toBe(200);
    });

    it('never exceeds the limit', () => {
        Needs.Timmy.food = 290;
        Needs.addFood();
        expect(Needs.Timmy.food).toBe(Needs.FOOD.LIMIT);
    });
});

describe('happiness', () => {
    beforeEach(resetTimmy);

    it('is the mean of the four needs in percent', () => {
        Needs.Timmy.food = 150;     // 50 %
        Needs.Timmy.water = 300;    // 100 %
        Needs.Timmy.clean = 50;     // 50 %
        Needs.Timmy.quest = 100;    // 100 %
        Needs.updatePercent();
        expect(Needs.Percent.happy).toBeCloseTo(0.75, 5);
        expect(Number(Needs.Timmy.happy)).toBe(75);
    });
});

describe('Needs.getDaysLived', () => {
    beforeEach(resetTimmy);

    it('counts the days since the birthday', () => {
        Needs.Timmy.BIRTHDAY_MIN = Date.now() / 60000 - 5 * DAY_MIN;
        expect(Needs.getDaysLived()).toBe('5');
    });

    it('caps the age at 999 days, the HUD has three digits', () => {
        Needs.Timmy.BIRTHDAY_MIN = Date.now() / 60000 - 1000 * DAY_MIN;
        expect(Needs.getDaysLived()).toBe('999');
    });
});
