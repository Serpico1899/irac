import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Dispatch a custom event to notify other components/tabs
        window.dispatchEvent(new CustomEvent('local-storage', {
          detail: { key, newValue: valueToStore }
        }));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) {
        return;
      }

      try {
        const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
        setStoredValue(newValue);
      } catch (error) {
        console.error(`Error parsing localStorage value for key "${key}":`, error);
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key !== key) {
        return;
      }
      setStoredValue(e.detail.newValue);
    };

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Listen for changes from current tab
    window.addEventListener('local-storage', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleCustomStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}

// Additional utility hook for removing items from localStorage
export function useRemoveFromLocalStorage() {
  return useCallback((key: string) => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
        window.dispatchEvent(new CustomEvent('local-storage', {
          detail: { key, newValue: null }
        }));
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, []);
}

// Utility hook for clearing all localStorage
export function useClearLocalStorage() {
  return useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.dispatchEvent(new CustomEvent('local-storage', {
          detail: { key: null, newValue: null }
        }));
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, []);
}
