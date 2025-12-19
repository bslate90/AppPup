import { useState, useEffect, useCallback } from 'react';

/**
 * Generic localStorage hook with JSON serialization
 * Provides reactive state that persists across page refreshes
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    // Get initial value from localStorage or use default
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update localStorage whenever value changes
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.warn(`Error writing to localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Setter function that handles both direct values and updater functions
    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        setStoredValue((prev) => {
            const newValue = value instanceof Function ? value(prev) : value;
            return newValue;
        });
    }, []);

    // Reset to initial value
    const resetValue = useCallback(() => {
        setStoredValue(initialValue);
        window.localStorage.removeItem(key);
    }, [key, initialValue]);

    return [storedValue, setValue, resetValue];
}

export default useLocalStorage;
