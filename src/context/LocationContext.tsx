import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrentUserLocation,
  getAreaNameFromCoords,
  LocationCoords,
  checkLocationPermission,
  saveLocationToStorage,
  getSavedLocationFromStorage,
  saveRecentLocation,
  getRecentLocations,
  clearRecentLocationsStorage
} from '../services/location';
import { clearCategoriesCache } from '../services/api';
import { MapPin, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LocationDisclosureModal } from '../components/common/LocationDisclosureModal';
import { LocationModal } from '../components/common/LocationModal';

interface LocationContextType {
  location: LocationCoords | null;
  isManualLocation: boolean;
  isLoading: boolean;
  error: string | null;
  isLocationModalOpen: boolean;
  recentLocations: LocationCoords[];
  requestLocation: () => Promise<void>;
  resetToLiveGps: () => Promise<void>;
  openDisclosure: () => void;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  setLocationManually: (coords: LocationCoords) => void;
  clearRecentLocations: () => void;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  isManualLocation: false,
  isLoading: true,
  error: null,
  isLocationModalOpen: false,
  recentLocations: [],
  requestLocation: async () => {},
  resetToLiveGps: async () => {},
  openDisclosure: () => {},
  openLocationModal: () => {},
  closeLocationModal: () => {},
  setLocationManually: () => {},
  clearRecentLocations: () => {},
});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationCoords | null>(() => getSavedLocationFromStorage());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [recentLocations, setRecentLocations] = useState<LocationCoords[]>(() => getRecentLocations());

  const openLocationModal = useCallback(() => {
    setIsLocationModalOpen(true);
  }, []);

  const closeLocationModal = useCallback(() => {
    setIsLocationModalOpen(false);
  }, []);

  const openDisclosure = useCallback(() => {
    setIsDisclosureOpen(true);
  }, []);

  const requestLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const coords = await getCurrentUserLocation();
      setLocation(coords);
      saveLocationToStorage(coords);
      clearCategoriesCache();
    } catch (err: any) {
      console.error('Location Fetch Error:', err);
      setError(err.message || 'LOCATION_REQUIRED');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToLiveGps = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const coords = await getCurrentUserLocation();
      const updatedCoords: LocationCoords = {
        ...coords,
        isManual: false,
      };
      setLocation(updatedCoords);
      saveLocationToStorage(updatedCoords);
      clearCategoriesCache();
    } catch (err: any) {
      console.error('Reset to GPS Error:', err);
      setError(err.message || 'LOCATION_REQUIRED');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setLocationManually = useCallback((coords: LocationCoords) => {
    const manualLocation: LocationCoords = {
      ...coords,
      isManual: true,
    };
    setLocation(manualLocation);
    saveLocationToStorage(manualLocation);
    saveRecentLocation(manualLocation);
    setRecentLocations(getRecentLocations());
    clearCategoriesCache();
    setError(null);
    setIsDisclosureOpen(false);
    setIsLocationModalOpen(false);
  }, []);

  const clearRecentLocations = useCallback(() => {
    clearRecentLocationsStorage();
    setRecentLocations([]);
  }, []);

  useEffect(() => {
    const initLocationFlow = async () => {
      // 1. Check if user already has a saved manual or persisted location
      const saved = getSavedLocationFromStorage();
      if (saved) {
        setLocation(saved);
        setIsLoading(false);
        return;
      }

      // 2. Otherwise check GPS permission
      try {
        const permStatus = await checkLocationPermission();
        if (permStatus.location === 'granted') {
          await requestLocation();
        } else {
          // Show Prominent Disclosure Modal
          setIsLoading(false);
          setIsDisclosureOpen(true);
        }
      } catch (e) {
        setIsLoading(false);
        setIsDisclosureOpen(true);
      }
    };

    initLocationFlow();
  }, []);

  // Background resolution if areaName is missing
  useEffect(() => {
    if (location?.latitude && location?.longitude && !location.areaName) {
      getAreaNameFromCoords(location.latitude, location.longitude)
        .then((info) => {
          if (info.areaName) {
            setLocation((prev) => {
              if (!prev) return prev;
              const updated = { ...prev, ...info };
              saveLocationToStorage(updated);
              return updated;
            });
          }
        })
        .catch(() => {});
    }
  }, [location?.latitude, location?.longitude, location?.areaName]);

  const isManualLocation = Boolean(location?.isManual);

  return (
    <LocationContext.Provider
      value={{
        location,
        isManualLocation,
        isLoading,
        error,
        isLocationModalOpen,
        recentLocations,
        requestLocation,
        resetToLiveGps,
        openDisclosure,
        openLocationModal,
        closeLocationModal,
        setLocationManually,
        clearRecentLocations,
      }}
    >
      {children}

      {/* Manual Location Selection Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
      />

      {/* Prominent Disclosure & Consent Modal (Google Play Compliant) */}
      <LocationDisclosureModal
        isOpen={isDisclosureOpen}
        onClose={() => {
          setIsDisclosureOpen(false);
          // Allow picking manual location immediately
          if (!location) {
            openLocationModal();
          }
        }}
        onPermissionGranted={() => {
          setIsDisclosureOpen(false);
          requestLocation();
        }}
      />

      {/* Retry Screen if Location Error Occurs */}
      <AnimatePresence>
        {error && !isDisclosureOpen && !isLocationModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 text-center"
          >
            <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5 text-blue-600 dark:text-blue-400">
                <MapPin className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Location Access Needed</h2>
              <p className="text-gray-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
                Nearby Me uses your location to discover nearby jobs, used buy & sell items, rental properties, and local events.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setError(null);
                    setIsDisclosureOpen(true);
                  }}
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-600/30"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Fetching GPS Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      Allow Location Access
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    openLocationModal();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  Choose City Manually
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);


