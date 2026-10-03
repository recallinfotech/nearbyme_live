import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Navigation,
  X,
  Clock,
  Building2,
  Check,
  RefreshCw,
  Sparkles,
  MapPinned,
  ChevronRight,
  Compass
} from 'lucide-react';
import {
  LocationCoords,
  LocationPredictionItem,
  POPULAR_CITIES,
  searchLocationPredictions,
  resolveLocationCoordinates
} from '../../services/location';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const {
    location,
    isManualLocation,
    setLocationManually,
    resetToLiveGps,
    recentLocations,
    isLoading: isGpsLoading,
  } = useLocation();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationPredictionItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [isAcquiringGps, setIsAcquiringGps] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');

  // Custom manual input state
  const [customCity, setCustomCity] = useState('Agra');
  const [customArea, setCustomArea] = useState('');
  const [customState, setCustomState] = useState('Uttar Pradesh');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setResolvingId(null);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Live debounced search (Predictions only - 0 Geocoding Billing while typing)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchLocationPredictions(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search predictions error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 380);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  if (!isOpen) return null;

  // Single-item on-demand geocoding only when tapped
  const handleSelectPrediction = async (item: LocationPredictionItem) => {
    if (resolvingId) return;
    setResolvingId(item.id);
    try {
      const resolvedCoords = await resolveLocationCoordinates(item);
      setLocationManually(resolvedCoords);
      onClose();
    } catch (err) {
      console.error('Error resolving location:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleSelectPopularCity = (city: typeof POPULAR_CITIES[0]) => {
    const newLocation: LocationCoords = {
      latitude: city.latitude,
      longitude: city.longitude,
      areaName: `${city.name}, ${city.state}`,
      city: 'Agra',
      state: 'Uttar Pradesh',
      fullAddress: `${city.name}, Agra, Uttar Pradesh, India`,
      isManual: true,
    };
    setLocationManually(newLocation);
    onClose();
  };

  const handleSelectRecent = (recent: LocationCoords) => {
    setLocationManually({ ...recent, isManual: true });
    onClose();
  };

  const handleUseGps = async () => {
    setIsAcquiringGps(true);
    try {
      await resetToLiveGps();
      onClose();
    } catch (err) {
      console.error('GPS Acquire error:', err);
    } finally {
      setIsAcquiringGps(false);
    }
  };

  const handleApplyCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customArea.trim()) return;

    const fullAreaName = `${customArea.trim()}, ${customCity.trim() || 'Agra'}`;
    const customLoc: LocationCoords = {
      latitude: 27.1767,
      longitude: 78.0081,
      areaName: fullAreaName,
      city: customCity.trim() || 'Agra',
      state: customState.trim() || 'Uttar Pradesh',
      fullAddress: `${fullAreaName}, ${customState.trim() || 'Uttar Pradesh'}, India`,
      isManual: true,
    };
    setLocationManually(customLoc);
    onClose();
  };

  const isCurrentActive = (item: { name?: string; areaName?: string; latitude: number; longitude: number }) => {
    if (!location) return false;
    
    // Exact locality name match
    if (item.name && location.areaName) {
      const locArea = location.areaName.toLowerCase();
      const cleanItemName = item.name.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
      if (locArea.includes(cleanItemName) || cleanItemName.includes(locArea.split(',')[0].trim())) {
        return true;
      }
    }

    if (item.areaName && location.areaName) {
      const a1 = item.areaName.toLowerCase().split(',')[0].trim();
      const a2 = location.areaName.toLowerCase().split(',')[0].trim();
      if (a1 === a2) return true;
    }
    
    // Strict coordinate proximity (< 150m)
    return (
      Math.abs(location.latitude - item.latitude) < 0.0015 &&
      Math.abs(location.longitude - item.longitude) < 0.0015
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, y: '100%', scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: '100%', scale: 0.98 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full sm:max-w-xl max-h-[88vh] sm:max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    Change Location
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Search any city, locality, or choose from Agra areas
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition active:scale-95 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Active Location Banner */}
            {location && (
              <div className="mt-2 p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-indigo-100 dark:border-slate-700 shadow-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span>Currently Active</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-semibold ${
                        isManualLocation
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {isManualLocation ? 'Manual Location' : 'Live GPS'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {location.areaName || location.city || `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar & Actions */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any area, city, pincode (e.g. Bodla, Jaipur, Rohini Delhi, Sadar)..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : isSearching ? (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                </div>
              ) : null}
            </div>

            {/* Use Current GPS Location Button */}
            <button
              onClick={handleUseGps}
              disabled={isAcquiringGps || isGpsLoading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-between group transition active:scale-[0.99] disabled:opacity-75"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  {isAcquiringGps || isGpsLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Navigation className="w-4 h-4 text-white group-hover:rotate-45 transition-transform" />
                  )}
                </div>
                <div className="text-left min-w-0">
                  <div className="truncate">
                    {isAcquiringGps ? 'Detecting GPS Location...' : 'Use Current Device Location'}
                  </div>
                  <div className="text-[10px] text-emerald-100 font-normal">
                    Auto-fetch live coordinates via GPS
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* 1. Live Search Results */}
            {searchQuery.trim().length >= 2 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Search Results</span>
                  {isSearching && (
                    <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 normal-case">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Searching...
                    </span>
                  )}
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-1.5">
                    {searchResults.map((item, idx) => {
                      const isResolving = resolvingId === item.id;
                      return (
                        <button
                          key={`${item.id}-${idx}`}
                          onClick={() => handleSelectPrediction(item)}
                          disabled={Boolean(resolvingId)}
                          className="w-full text-left p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-indigo-50/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between group transition active:scale-[0.99] shadow-xs disabled:opacity-60"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                              {isResolving ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                              ) : (
                                <MapPinned className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                {item.mainText}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {item.secondaryText || item.fullAddress}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 ml-2">
                            {isResolving ? (
                              <span className="text-[10px] font-bold text-indigo-600 animate-pulse">Setting...</span>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : !isSearching ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No matching places found for "{searchQuery}"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try searching with city name or choose from popular cities below.
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* 2. Recent Locations (if available and no active search) */}
            {!searchQuery && recentLocations && recentLocations.length > 0 && (
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Recent Locations</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recentLocations.slice(0, 4).map((rec, idx) => {
                    const active = isCurrentActive({
                      areaName: rec.areaName,
                      name: rec.city,
                      latitude: rec.latitude,
                      longitude: rec.longitude,
                    });
                    return (
                      <button
                        key={`rec-${idx}-${rec.latitude}`}
                        onClick={() => handleSelectRecent(rec)}
                        className={`text-left p-2.5 rounded-2xl border flex items-center justify-between gap-2 transition active:scale-[0.98] ${
                          active
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <div className="min-w-0">
                            <div className="font-bold text-xs truncate">
                              {rec.areaName || rec.city}
                            </div>
                            {rec.state && (
                              <div className="text-[10px] text-slate-400 truncate">{rec.state}</div>
                            )}
                          </div>
                        </div>
                        {active && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Agra Localities & Areas (when no active search) */}
            {!searchQuery && (
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Agra Localities & Areas</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Tap to explore</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_CITIES.map((city) => {
                    const active = isCurrentActive({
                      name: city.name,
                      areaName: `${city.name}, Agra`,
                      latitude: city.latitude,
                      longitude: city.longitude,
                    });
                    return (
                      <button
                        key={`city-${city.name}`}
                        onClick={() => handleSelectPopularCity(city)}
                        className={`text-left p-3 rounded-2xl border transition active:scale-[0.98] group flex flex-col justify-between ${
                          active
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-transparent text-white shadow-md shadow-indigo-600/20'
                            : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="font-bold text-xs truncate">
                            {city.name}
                          </div>
                          {active ? (
                            <Check className="w-3.5 h-3.5 text-white shrink-0" />
                          ) : city.tag ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold shrink-0">
                              {city.tag}
                            </span>
                          ) : null}
                        </div>
                        <div
                          className={`text-[10px] truncate ${
                            active ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {city.state}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Fallback: Manual Locality Input Option */}
            {!searchQuery && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab(activeTab === 'custom' ? 'search' : 'custom')}
                  className="w-full py-2 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1"
                >
                  <span>{activeTab === 'custom' ? 'Hide Custom Input' : 'Can\'t find your area? Enter manually'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeTab === 'custom' ? 'rotate-90' : ''}`} />
                </button>

                {activeTab === 'custom' && (
                  <form
                    onSubmit={handleApplyCustomLocation}
                    className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Locality / Area Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customArea}
                        onChange={(e) => setCustomArea(e.target.value)}
                        placeholder="e.g. Bodla, Sadar Bazar, Dayalbagh"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={customCity || 'Agra'}
                          onChange={(e) => setCustomCity(e.target.value)}
                          placeholder="Agra"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={customState || 'Uttar Pradesh'}
                          onChange={(e) => setCustomState(e.target.value)}
                          placeholder="Uttar Pradesh"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition active:scale-95"
                    >
                      Set Location & Update App
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
