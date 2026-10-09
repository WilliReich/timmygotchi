import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../utilities/connections/api.js', () => ({
    default: { Game: { sendQuestDone: vi.fn() } },
}));
vi.mock('../utilities/database.js', () => ({
    default: {
        QuestsDone: { add: vi.fn() },
        Parameter: { addOneToReward: vi.fn() },
        Measurements: { questNormal: 0, questBonus: 0 },
    },
}));
vi.mock('../utilities/toast.js', () => ({
    default: { show: vi.fn() },
}));

import ActiveQuest from '../views/Quest/activeQuest.js';
import Database from '../utilities/database.js';
import ConnectionsApi from '../utilities/connections/api.js';
import Settings from '../utilities/settings.js';

const NOON = new Date(2026, 9, 9, 12, 0, 0);
const QUEST = { lat: 52.2963, lng: 8.9068 };
const STAY_MS = (Settings.Quest.STAY_TIME_SEC + 1) * 1000;

// A quest map with one marker per bonus time; the distance to the player is changed by the tests
function fakeQuestMap(...bonusTimes) {
    const markers = (bonusTimes.length > 0 ? bonusTimes : ['']).map(bonusTime => ({
        getLatLng: () => QUEST,
        bonusTime,
    }));
    return {
        distance: 100,
        markers,
        getClosestMarker() {
            return this.markers.length > 0
                ? { marker: this.markers[0], distance: this.distance }
                : { marker: null, distance: -1 };
        },
        deleteOneQuestMarker(marker) {
            this.markers = this.markers.filter(other => other !== marker);
        },
    };
}

function finishQuest(map, quest) {
    const finished = [];
    quest.addEventListener('questfinished', event => finished.push(event.detail));
    map.distance = 10;                  // inside the 30 m radius
    quest.update();
    vi.advanceTimersByTime(STAY_MS);
    quest.update();
    return finished;
}

describe('ActiveQuest', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOON);
        vi.clearAllMocks();
        Database.Measurements.questNormal = 0;
        Database.Measurements.questBonus = 0;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('announces the targeted quest once', () => {
        const quest = new ActiveQuest(fakeQuestMap());
        const targets = [];
        quest.addEventListener('targetchanged', event => targets.push(event.detail));
        quest.update();
        quest.update();
        expect(targets).toEqual([{ latitude: QUEST.lat, longitude: QUEST.lng }]);
    });

    it('counts down only while the player stays in range', () => {
        const map = fakeQuestMap();
        const quest = new ActiveQuest(map);
        quest.update();
        expect(quest.getCountdown()).toBe(Settings.Quest.STAY_TIME_SEC);

        map.distance = 10;
        quest.update();
        vi.advanceTimersByTime(15000);
        expect(quest.getCountdown()).toBeCloseTo(Settings.Quest.STAY_TIME_SEC - 15, 3);

        map.distance = 50;                  // left the radius: the countdown starts over
        quest.update();
        expect(quest.getCountdown()).toBe(Settings.Quest.STAY_TIME_SEC);
    });

    it('finishes a normal quest after the stay time', () => {
        const map = fakeQuestMap();
        const finished = finishQuest(map, new ActiveQuest(map));

        expect(finished).toEqual([{ latitude: QUEST.lat, longitude: QUEST.lng, isBonus: false }]);
        expect(Database.QuestsDone.add).toHaveBeenCalledWith(QUEST.lat, QUEST.lng);
        expect(Database.Parameter.addOneToReward).toHaveBeenCalledWith(false);
        expect(ConnectionsApi.Game.sendQuestDone).toHaveBeenCalledOnce();
        expect(Database.Measurements).toMatchObject({ questNormal: 1, questBonus: 0 });
        expect(map.markers).toHaveLength(0);
    });

    it('counts a quest with a measuring time close to now as bonus', () => {
        const map = fakeQuestMap('09:00,12:03');    // 12:03 is within five minutes of noon
        const finished = finishQuest(map, new ActiveQuest(map));

        expect(finished[0].isBonus).toBe(true);
        expect(Database.Parameter.addOneToReward).toHaveBeenCalledWith(true);
        expect(Database.Measurements).toMatchObject({ questNormal: 0, questBonus: 1 });
    });

    it('does not count a measuring time outside the tolerance as bonus', () => {
        const map = fakeQuestMap('12:10');
        const finished = finishQuest(map, new ActiveQuest(map));

        expect(finished[0].isBonus).toBe(false);
        expect(Database.Measurements).toMatchObject({ questNormal: 1, questBonus: 0 });
    });

    it('needs a fresh stay time for the next quest in range', () => {
        const map = fakeQuestMap('', '');
        const quest = new ActiveQuest(map);
        const finished = finishQuest(map, quest);
        expect(finished).toHaveLength(1);
        expect(map.markers).toHaveLength(1);

        quest.update();                     // the second quest is in range, but the player just arrived
        expect(finished).toHaveLength(1);
        expect(quest.getCountdown()).toBe(Settings.Quest.STAY_TIME_SEC);

        vi.advanceTimersByTime(STAY_MS);
        quest.update();
        expect(finished).toHaveLength(2);
    });
});
