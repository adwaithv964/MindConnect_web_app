import { openDB } from 'idb';

const DB_NAME = 'mind-connect-db';
const DB_VERSION = 1;

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('moodLogs')) {
                db.createObjectStore('moodLogs', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('appointments')) {
                db.createObjectStore('appointments', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('syncQueue')) {
                db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            }
        },
    });
};

export const saveMoodLog = async (log) => {
    const db = await initDB();
    const tx = db.transaction('moodLogs', 'readwrite');
    await tx.store.add({ ...log, createdAt: new Date().toISOString(), synced: false });
    await tx.done;
};

export const getMoodLogs = async () => {
    const db = await initDB();
    return db.getAll('moodLogs');
};

export const saveAppointment = async (appointment) => {
    const db = await initDB();
    const tx = db.transaction('appointments', 'readwrite');
    await tx.store.add({ ...appointment, createdAt: new Date().toISOString(), synced: false });
    await tx.done;
};

export const getAppointments = async () => {
    const db = await initDB();
    return db.getAll('appointments');
};
