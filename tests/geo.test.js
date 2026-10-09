import { describe, it, expect } from 'vitest';
import { distanceMeters, destinationPoint, moveTowards } from '../utilities/connections/mock/geo.js';

const MINDEN = { latitude: 52.2963, longitude: 8.9068 };

describe('distanceMeters', () => {
    it('is zero for the same point', () => {
        expect(distanceMeters(MINDEN, MINDEN)).toBe(0);
    });

    it('measures one degree of latitude as roughly 111 km', () => {
        const north = { latitude: MINDEN.latitude + 1, longitude: MINDEN.longitude };
        expect(distanceMeters(MINDEN, north)).toBeCloseTo(111195, -2);
    });
});

describe('destinationPoint', () => {
    it('lands at the requested distance', () => {
        const point = destinationPoint(MINDEN, 45, 150);
        expect(distanceMeters(MINDEN, point)).toBeCloseTo(150, 0);
    });

    it('moves north along the same longitude', () => {
        const point = destinationPoint(MINDEN, 0, 500);
        expect(point.latitude).toBeGreaterThan(MINDEN.latitude);
        expect(point.longitude).toBeCloseTo(MINDEN.longitude, 6);
    });
});

describe('moveTowards', () => {
    const target = destinationPoint(MINDEN, 90, 100);

    it('moves the requested distance towards the target', () => {
        const point = moveTowards(MINDEN, target, 40);
        expect(distanceMeters(MINDEN, point)).toBeCloseTo(40, 0);
        expect(distanceMeters(point, target)).toBeCloseTo(60, 0);
    });

    it('stops at the target when the step is longer than the remaining distance', () => {
        expect(moveTowards(MINDEN, target, 500)).toEqual(target);
    });

    it('stays put when it is already at the target', () => {
        expect(moveTowards(target, target, 10)).toEqual(target);
    });
});
