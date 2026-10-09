/*
 * Clears everything the demo mode stored and restarts the demo from scratch:
 * the fake server state in localStorage and the demo databases of the app.
 * Triggered by ?demo=reset, see index.js.
 */
const DEMO_DATABASES = ['db-demo', 'timmyDB-demo'];
const SERVER_STORAGE_KEY = 'timmygotchi-demo-server';

function deleteDatabase(name) {
    return new Promise(resolve => {
        const request = indexedDB.deleteDatabase(name);
        request.onsuccess = request.onerror = request.onblocked = () => resolve();
    });
}

export default async function resetDemo() {
    localStorage.removeItem(SERVER_STORAGE_KEY);
    await Promise.all(DEMO_DATABASES.map(deleteDatabase));
    window.location.replace('?demo=1');
}
