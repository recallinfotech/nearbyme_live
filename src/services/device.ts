import { Device } from '@capacitor/device';
import { getStorageItem, setStorageItem } from './storage';

/**
 * Returns a persistent unique device identifier.
 * - On Mobile (Android / iOS): uses Device.getId().identifier
 * - On Web / fallback: generates or retrieves a persistent UUID from storage.
 */
export const getUniqueDeviceId = async (): Promise<string> => {
  try {
    const idInfo = await Device.getId();
    if (idInfo?.identifier && idInfo.identifier !== 'unknown' && idInfo.identifier.trim().length > 0) {
      return idInfo.identifier.trim();
    }
  } catch (e) {
    console.warn('Device.getId() not available or failed:', e);
  }

  // Persistent storage fallback for web / browser environment
  try {
    let savedId = await getStorageItem<string>('app_device_unique_id');
    if (!savedId) {
      savedId = 'web_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '_' + Math.random().toString(36).substring(2, 12)));
      await setStorageItem('app_device_unique_id', savedId);
    }
    return savedId;
  } catch {
    let local = typeof window !== 'undefined' ? localStorage.getItem('app_device_unique_id') : null;
    if (!local) {
      local = 'web_' + Date.now() + '_' + Math.random().toString(36).substring(2, 12);
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_device_unique_id', local);
      }
    }
    return local;
  }
};
