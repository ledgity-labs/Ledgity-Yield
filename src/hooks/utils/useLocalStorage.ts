import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): {
  localData: T;
  lastUpdate: number | null;
  setLocalData: (value: T) => void;
} {
  // State to store our value
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [localData, setLocalData] = useState<T>(initialValue);

  // Initialize on client-side only
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);

      if (item !== JSON.stringify(initialValue)) {
        setLocalData(item ? JSON.parse(item) : initialValue);
      }
    } catch (error) {
      console.error(error);
      setLocalData(initialValue);
    }
  }, [initialValue]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  function handleSetLocalData(value: T) {
    const stringData = JSON.stringify(value);
    const currentStringData = window.localStorage.getItem(key);

    setLastUpdate(Date.now());

    if (stringData !== currentStringData) {
      setLocalData(value);
      window.localStorage.setItem(key, stringData);
    }
  }

  return {
    localData: localData || initialValue,
    lastUpdate: lastUpdate,
    setLocalData: handleSetLocalData,
  };
}
