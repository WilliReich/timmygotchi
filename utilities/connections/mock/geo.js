/*
 * Small geo helpers for the demo mode. Accurate enough for the few kilometres
 * the demo works with.
 */
const EARTH_RADIUS_M = 6371000;

const toRad = (deg) => deg * Math.PI / 180;
const toDeg = (rad) => rad * 180 / Math.PI;

// Great-circle distance in metres between two {latitude, longitude} points
export function distanceMeters(from, to) {
    const dLat = toRad(to.latitude - from.latitude);
    const dLng = toRad(to.longitude - from.longitude);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

// Point reached from `from` after `distance` metres in direction `bearingDeg` (0 = north)
export function destinationPoint(from, bearingDeg, distance) {
    const delta = distance / EARTH_RADIUS_M;
    const theta = toRad(bearingDeg);
    const lat1 = toRad(from.latitude);
    const lng1 = toRad(from.longitude);

    const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(delta) + Math.cos(lat1) * Math.sin(delta) * Math.cos(theta)
    );
    const lng2 = lng1 + Math.atan2(
        Math.sin(theta) * Math.sin(delta) * Math.cos(lat1),
        Math.cos(delta) - Math.sin(lat1) * Math.sin(lat2)
    );
    return { latitude: toDeg(lat2), longitude: toDeg(lng2) };
}

// Point `distance` metres along the straight line from `from` towards `to`
export function moveTowards(from, to, distance) {
    const total = distanceMeters(from, to);
    if (total === 0 || distance >= total) {
        return { latitude: to.latitude, longitude: to.longitude };
    }
    const fraction = distance / total;
    return {
        latitude: from.latitude + (to.latitude - from.latitude) * fraction,
        longitude: from.longitude + (to.longitude - from.longitude) * fraction,
    };
}
