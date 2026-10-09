import DemoGps from "./demoGps.js";
import { distanceMeters, destinationPoint } from "./geo.js";

/*
 * In-browser stand-in for the services the app talks to:
 *   - SmartGamification: players, sessions, scores
 *   - SmartDataAirquality: measurement positions (quests), measurement upload
 *
 * MockServer.fetch() mimics window.fetch(): it matches the request URL against
 * the routes below and resolves with a Response object carrying JSON.
 */
const LATENCY_MS = 100;

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const QUEST_DISTANCES_M = [150, 400, 700, 1100, 1500, 1900];   // the first one is reachable within seconds
const RECENTER_DISTANCE_M = 5000;                              // regenerate quests when the player moved this far

// --- fake database ---------------------------------------------------------------------------
const db = {
    players: [
        { id: 1, player_name: 'Luna', score: 2450 },
        { id: 2, player_name: 'Mika', score: 2210 },
        { id: 3, player_name: 'Finn', score: 1980 },
        { id: 4, player_name: 'Nala', score: 1730 },
        { id: 5, player_name: 'Ida', score: 1420 },
        { id: 6, player_name: 'Leo', score: 1150 },
        { id: 7, player_name: 'Zoe', score: 860 },
        { id: 8, player_name: 'Timmy', score: 420 },
    ],
    sessions: new Map(),
    nextPlayerId: 9,
    nextSessionId: 1,
    questPositions: null,     // { center, records }
};

// --- helpers ---------------------------------------------------------------------------------
function json(status, body) {
    return new Response(JSON.stringify(body), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}

const round = (value, digits) => Number(value.toFixed(digits));
const pad = (value) => String(value).padStart(2, '0');

function timeStringFromNow(offsetMinutes) {
    const date = new Date(Date.now() + offsetMinutes * 60000);
    return pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function findPlayerByName(name) {
    const wanted = (name || '').trim().toLowerCase();
    return db.players.find(player => player.player_name.toLowerCase() === wanted) || null;
}

function findPlayerById(id) {
    return db.players.find(player => player.id === Number(id)) || null;
}

function sessionScore(session) {
    return session.quest_normal * 100 + session.quest_bonus * 250 + Math.round(session.distance * 10);
}

// Quest positions around the player. Generated once and kept until the player moves far away.
function questPositions() {
    const center = DemoGps.center();
    const cached = db.questPositions;
    if (cached != null && distanceMeters(cached.center, center) < RECENTER_DISTANCE_M) {
        return cached.records;
    }

    const today = WEEKDAYS[new Date().getDay()];
    const records = QUEST_DISTANCES_M.map((distance, index) => {
        const point = destinationPoint(center, Math.random() * 360, distance);
        const record = {
            latitude: round(point.latitude, 6),
            longitude: round(point.longitude, 6),
            mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '',
        };
        // closest quest: measuring time right now (bonus), second quest: later today
        if (index === 0) {
            record[today] = timeStringFromNow(0);
        } else if (index === 1) {
            record[today] = timeStringFromNow(120);
        }
        return record;
    });

    db.questPositions = { center: { ...center }, records: records };
    return records;
}

// --- routes ----------------------------------------------------------------------------------
const routes = [
    // SmartGamification: players
    {
        method: 'POST', path: '/SmartGamification/smartdata/player/create',
        handle: (url, body) => {
            const name = (body && body.player_name || '').trim();
            if (name === '') {
                return json(400, { error: 'player_name missing' });
            }
            let player = findPlayerByName(name);
            if (player == null) {
                player = { id: db.nextPlayerId++, player_name: name, score: 0 };
                db.players.push(player);
            }
            return json(201, { id: player.id });
        },
    },
    {
        method: 'GET', path: '/SmartGamification/smartdata/player/getid',
        handle: (url) => {
            const player = findPlayerByName(url.searchParams.get('playername'));
            return player ? json(200, { id: player.id }) : json(404, { error: 'unknown player' });
        },
    },

    // SmartGamification: sessions
    {
        method: 'POST', path: '/SmartGamification/smartdata/session/create',
        handle: (url, body) => {
            const session = {
                id: db.nextSessionId++,
                player_id: Number(body.player_id),
                start_ts: body.start_ts,
                mac: body.mac,
                quest_normal: Number(body.quest_normal) || 0,
                quest_bonus: Number(body.quest_bonus) || 0,
                distance: round(1 + Math.random() * 3, 2),       // km
                altitude: round(10 + Math.random() * 40, 1),     // m
                scored: false,
            };
            db.sessions.set(session.id, session);
            return json(201, session.id);
        },
    },
    {
        method: 'GET', path: '/SmartGamification/smartdata/session/getbyid',
        handle: (url) => {
            const session = db.sessions.get(Number(url.searchParams.get('sessionid')));
            return session ? json(200, session) : json(404, { error: 'unknown session' });
        },
    },

    // SmartGamification: scores
    {
        method: 'PUT', path: '/SmartGamification/smartdata/score/updateplayerscore',
        handle: (url, body) => {
            const session = db.sessions.get(Number(body && body.sessionid));
            if (session == null) {
                return json(404, { error: 'unknown session' });
            }
            const player = findPlayerById(session.player_id);
            if (player != null && !session.scored) {
                player.score += sessionScore(session);
                session.scored = true;
            }
            return json(200, { score: player ? player.score : 0 });
        },
    },
    {
        method: 'GET', path: '/SmartGamification/smartdata/score/getsessionscore',
        handle: (url) => {
            const session = db.sessions.get(Number(url.searchParams.get('sessionid')));
            return session ? json(200, { score: sessionScore(session) }) : json(404, { error: 'unknown session' });
        },
    },
    {
        method: 'GET', path: '/SmartGamification/smartdata/score/getbyplayerid',
        handle: (url) => {
            const player = findPlayerById(url.searchParams.get('playerid'));
            return player ? json(200, { score: player.score }) : json(404, { error: 'unknown player' });
        },
    },
    {
        method: 'GET', path: '/SmartGamification/smartdata/score/listbyscore',
        handle: (url) => {
            const size = Number(url.searchParams.get('size')) || 10;
            const highscore = [...db.players]
                .sort((a, b) => b.score - a.score)
                .slice(0, size)
                .map(player => ({ player_name: player.player_name, score: player.score }));
            return json(200, { highscore: highscore });
        },
    },

    // SmartDataAirquality
    {
        method: 'GET', path: '/SmartDataAirquality/smartdata/records/tbl_measurement_pos',
        handle: () => json(200, { records: questPositions() }),
    },
    {
        method: 'POST', pathPrefix: '/SmartDataAirquality/smartdata/records/sensor_',
        handle: (url, body) => json(201, { stored: Array.isArray(body) ? body.length : 0 }),
    },
];

// --- entry point -----------------------------------------------------------------------------
const MockServer = {};

MockServer.fetch = async function (url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const parsed = new URL(url, window.location.href);
    const body = options.body ? JSON.parse(options.body) : null;

    await new Promise(resolve => setTimeout(resolve, LATENCY_MS));

    const route = routes.find(candidate =>
        candidate.method === method && (
            candidate.path != null
                ? parsed.pathname === candidate.path
                : parsed.pathname.startsWith(candidate.pathPrefix)
        )
    );
    if (route == null) {
        console.warn('[MockServer] no route for', method, url);
        return json(404, { error: 'no mock route for ' + method + ' ' + parsed.pathname });
    }
    return route.handle(parsed, body);
};

export default MockServer;
