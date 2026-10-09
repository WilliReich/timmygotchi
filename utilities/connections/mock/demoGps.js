import { distanceMeters, moveTowards } from "./geo.js";

/*
 * Simulated GPS position for the demo mode.
 *
 * The position follows the real geolocation of the device ("home") while
 * nothing else is going on. When geolocation is unavailable it starts at the
 * HSBI Campus Minden instead. Once the quest search has armed the walker, the
 * position moves in a straight line to the closest quest, waits there until
 * the quest is finished and then walks back home. Without a real geolocation
 * it simply stays at the quest.
 *
 * States: idle -> armed -> walking -> arrived -> returning -> idle
 */
const DemoGps = {
    HOME_FALLBACK: { latitude: 52.2963, longitude: 8.9068 },     // HSBI Campus Minden
    WALK_SPEED_MPS: 10,                                          // fast walker, keeps the demo short
    ARRIVE_TOLERANCE_M: 2,

    state: 'idle',
    home: null,             // latest real position, null when geolocation is unavailable
    current: null,          // simulated position reported to the app
    target: null,
    lastTickMs: 0,
};

// Subscribes once to the real geolocation, if the browser provides one
DemoGps.init = function () {
    if (this.current != null) {
        return;
    }
    this.current = { ...this.HOME_FALLBACK };

    if (!navigator.geolocation) {
        return;
    }
    navigator.geolocation.watchPosition(
        (position) => {
            this.home = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        },
        () => {
            // permission denied or no signal: stay at the fallback position
            this.home = null;
        },
        { enableHighAccuracy: false, maximumAge: 10000 }
    );
};

// Called when the player searches for quests: the next target will be walked to
DemoGps.arm = function () {
    this.state = 'armed';
    this.target = null;
};

// Start walking to a quest, only accepted while armed
DemoGps.walkTo = function (latitude, longitude) {
    if (this.state !== 'armed') {
        return;
    }
    this.target = { latitude, longitude };
    this.state = 'walking';
    this.lastTickMs = Date.now();
};

// Walk back to the real position, or stay at the quest when there is none
DemoGps.returnHome = function () {
    if (this.home != null) {
        this.target = { ...this.home };
        this.state = 'returning';
        this.lastTickMs = Date.now();
    } else {
        this.target = null;
        this.state = 'idle';
    }
};

// Centre for generated demo data: the real position if known, otherwise the simulated one
DemoGps.center = function () {
    this.init();
    return this.home || this.current;
};

// Moves the simulated position according to the time passed since the last call
DemoGps.advance = function () {
    const now = Date.now();
    const seconds = (now - this.lastTickMs) / 1000;
    this.lastTickMs = now;

    if (this.state === 'walking' || this.state === 'returning') {
        const step = this.WALK_SPEED_MPS * seconds;
        const remaining = distanceMeters(this.current, this.target);
        if (remaining <= Math.max(step, this.ARRIVE_TOLERANCE_M)) {
            this.current = { ...this.target };
            this.target = null;
            this.state = (this.state === 'walking') ? 'arrived' : 'idle';
        } else {
            this.current = moveTowards(this.current, this.target, step);
        }
    } else if ((this.state === 'idle' || this.state === 'armed') && this.home != null) {
        this.current = { ...this.home };
    }
};

// Advances the simulation and returns the position in the GeolocationPosition format
DemoGps.currentPosition = function () {
    this.init();
    this.advance();
    const isMoving = this.state === 'walking' || this.state === 'returning';
    return {
        coords: {
            latitude: this.current.latitude,
            longitude: this.current.longitude,
            accuracy: 5,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: isMoving ? this.WALK_SPEED_MPS : 0,
        },
        timestamp: Date.now(),
    };
};

export default DemoGps;
