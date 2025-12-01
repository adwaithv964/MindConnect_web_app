export const saveToLocalStorage = (key, data) => {
    try {
        const existingData = JSON.parse(localStorage.getItem(key) || '[]');
        const newData = [...existingData, data];
        localStorage.setItem(key, JSON.stringify(newData));
        console.log(`Saved to LocalStorage [${key}]:`, data);
    } catch (error) {
        console.error('Error saving to LocalStorage:', error);
    }
};

export const getFromLocalStorage = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
        console.error('Error reading from LocalStorage:', error);
        return [];
    }
};

export const clearLocalStorage = (key) => {
    try {
        localStorage.removeItem(key);
        console.log(`Cleared LocalStorage [${key}]`);
    } catch (error) {
        console.error('Error clearing LocalStorage:', error);
    }
};
