import axios from 'axios';
import { saveToLocalStorage, getFromLocalStorage, clearLocalStorage } from './offlineStorage';

// Keys for LocalStorage
const MOOD_LOGS_KEY = 'offline_mood_logs';
const APPOINTMENTS_KEY = 'offline_appointments';

export const saveData = async (type, data) => {
    if (navigator.onLine) {
        try {
            // Prepare payload based on type
            const payload = {};
            if (type === 'moodLog') payload.moodLogs = [data];
            if (type === 'appointment') payload.appointments = [data];

            const response = await axios.post('/api/sync', payload);
            console.log('Online: Data saved to MongoDB', response.data);
            return true;
        } catch (error) {
            console.error('Online save failed, falling back to offline storage:', error);
            // Fallback to offline storage if server error
            saveToOffline(type, data);
            return false;
        }
    } else {
        console.log('Offline: Saving to LocalStorage');
        saveToOffline(type, data);
        return false;
    }
};

const saveToOffline = (type, data) => {
    if (type === 'moodLog') {
        saveToLocalStorage(MOOD_LOGS_KEY, data);
    } else if (type === 'appointment') {
        saveToLocalStorage(APPOINTMENTS_KEY, data);
    }
};

export const syncData = async () => {
    if (!navigator.onLine) {
        console.log('Offline: Cannot sync data.');
        return;
    }

    const moodLogs = getFromLocalStorage(MOOD_LOGS_KEY);
    const appointments = getFromLocalStorage(APPOINTMENTS_KEY);

    if (moodLogs.length === 0 && appointments.length === 0) {
        console.log('No offline data to sync.');
        return;
    }

    console.log('Syncing offline data...', { moodLogs, appointments });

    try {
        const response = await axios.post('/api/sync', {
            moodLogs,
            appointments
        });

        if (response.data.success) {
            console.log('Sync successful:', response.data);

            // Clear LocalStorage on success
            clearLocalStorage(MOOD_LOGS_KEY);
            clearLocalStorage(APPOINTMENTS_KEY);
        }
    } catch (error) {
        console.error('Sync failed:', error);
    }
};

// Auto-sync when online
window.addEventListener('online', () => {
    console.log('Network restored. Attempting sync...');
    syncData();
});

// Initial sync check on load
window.addEventListener('load', () => {
    if (navigator.onLine) {
        syncData();
    }
});
