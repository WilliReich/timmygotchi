import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import DemoGps from '../utilities/connections/mock/demoGps.js';
import { distanceMeters, destinationPoint } from '../utilities/connections/mock/geo.js';

const MINDEN = DemoGps.HOME_FALLBACK;
const NOON = new Date(2026, 9, 9, 12, 0, 0);

function coords(position) {
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}

// Fakes navigator.geolocation and hands back the success callback, so a test can push positions
function fakeGeolocation() {
    const watch = { success: null };
    vi.stubGlobal('navigator', {
        geolocation: {
            watchPosition: (success) => {
                watch.success = success;
                return 1;
            },
        },
    });
    return watch;
}

describe('DemoGps', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOON);
        vi.stubGlobal('navigator', {});     // no geolocation unless a test says otherwise
        Object.assign(DemoGps, { state: 'idle', home: null, current: null, target: null, lastTickMs: 0 });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('starts at Campus Minden when there is no geolocation', () => {
        const position = DemoGps.currentPosition();
        expect(coords(position)).toEqual(MINDEN);
        expect(position.coords.speed).toBe(0);
    });

    it('ignores a target until the quest search arms it', () => {
        DemoGps.currentPosition();
        DemoGps.walkTo(52.3, 8.9);
        expect(DemoGps.state).toBe('idle');
        DemoGps.arm();
        DemoGps.walkTo(52.3, 8.9);
        expect(DemoGps.state).toBe('walking');
    });

    it('walks towards the target at walking speed and stops there', () => {
        const target = destinationPoint(MINDEN, 90, 100);
        DemoGps.currentPosition();
        DemoGps.arm();
        DemoGps.walkTo(target.latitude, target.longitude);

        vi.advanceTimersByTime(5000);
        const halfway = DemoGps.currentPosition();
        expect(distanceMeters(MINDEN, coords(halfway))).toBeCloseTo(5 * DemoGps.WALK_SPEED_MPS, 0);
        expect(halfway.coords.speed).toBe(DemoGps.WALK_SPEED_MPS);

        vi.advanceTimersByTime(6000);
        const arrived = DemoGps.currentPosition();
        expect(coords(arrived)).toEqual(target);
        expect(DemoGps.state).toBe('arrived');
        expect(arrived.coords.speed).toBe(0);
    });

    it('stays at the quest after finishing when no real position is known', () => {
        const target = destinationPoint(MINDEN, 180, 50);
        DemoGps.currentPosition();
        DemoGps.arm();
        DemoGps.walkTo(target.latitude, target.longitude);
        vi.advanceTimersByTime(10000);
        DemoGps.currentPosition();

        DemoGps.returnHome();
        expect(DemoGps.state).toBe('idle');
        vi.advanceTimersByTime(10000);
        expect(coords(DemoGps.currentPosition())).toEqual(target);
    });

    it('follows the real position and walks back to it after finishing', () => {
        const watch = fakeGeolocation();
        const home = { latitude: 52.52, longitude: 13.405 };
        DemoGps.currentPosition();
        watch.success({ coords: home });
        expect(coords(DemoGps.currentPosition())).toEqual(home);

        const target = destinationPoint(home, 0, 80);
        DemoGps.arm();
        DemoGps.walkTo(target.latitude, target.longitude);
        vi.advanceTimersByTime(10000);
        DemoGps.currentPosition();
        expect(DemoGps.state).toBe('arrived');

        DemoGps.returnHome();
        expect(DemoGps.state).toBe('returning');
        vi.advanceTimersByTime(10000);
        expect(coords(DemoGps.currentPosition())).toEqual(home);
        expect(DemoGps.state).toBe('idle');
    });
});
