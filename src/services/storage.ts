import { Preferences } from '@capacitor/preferences';

export const setStorageItem = async (key: string, value: any): Promise<void> => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    await Preferences.set({ key, value: stringValue });
  } catch {
    localStorage.setItem(key, stringValue);
  }
};

export const getStorageItem = async <T = any>(key: string): Promise<T | null> => {
  try {
    const { value } = await Preferences.get({ key });
    if (!value) {
      const fallback = localStorage.getItem(key);
      if (!fallback) return null;
      try { return JSON.parse(fallback); } catch { return fallback as unknown as T; }
    }
    try {
      return JSON.parse(value);
    } catch {
      return value as unknown as T;
    }
  } catch {
    const fallback = localStorage.getItem(key);
    if (!fallback) return null;
    try { return JSON.parse(fallback); } catch { return fallback as unknown as T; }
  }
};

export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await Preferences.remove({ key });
  } catch {
    localStorage.removeItem(key);
  }
};

export const clearStorage = async (): Promise<void> => {
  try {
    await Preferences.clear();
  } catch {
    localStorage.clear();
  }
};
