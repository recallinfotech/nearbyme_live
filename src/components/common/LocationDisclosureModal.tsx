import React from 'react';
import { MapPin, Briefcase, ShoppingBag, Home, Calendar, ShieldCheck } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
}

export const LocationDisclosureModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
}) => {
  if (!isOpen) return null;

  const handleRequestLocation = async () => {
    try {
      // 1. Close the custom disclosure dialog
      onClose();

      // 2. Request native Capacitor permission
      const status = await Geolocation.requestPermissions();
      if (status.location === 'granted') {
        onPermissionGranted();
      }
    } catch (error) {
      console.error('Location permission error:', error);
      // Fallback: trigger permission granted handler so browser/native fallback can handle it
      onPermissionGranted();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl transition-all border border-slate-100 dark:border-slate-800"
        >
          {/* Header Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <MapPin className="h-7 w-7" />
          </div>

          {/* Title */}
          <h3 className="text-center text-xl font-bold text-gray-900 dark:text-white">
            Allow Location Access for Nearby Me
          </h3>

          {/* Disclosure Body */}
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <span className="font-semibold text-gray-800 dark:text-gray-100">Nearby Me</span> collects and uses your device's location data while the app is in use to show relevant listings around you:
          </p>

          {/* Feature Highlights Grid */}
          <div className="my-4 space-y-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 p-3.5 text-sm text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                <Briefcase className="h-4 w-4 shrink-0" />
              </div>
              <span className="font-medium">Local Jobs & Hiring nearby</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <ShoppingBag className="h-4 w-4 shrink-0" />
              </div>
              <span className="font-medium">Buy & Sell used items in your area</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                <Home className="h-4 w-4 shrink-0" />
              </div>
              <span className="font-medium">Homes, Offices & Shops for rent</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                <Calendar className="h-4 w-4 shrink-0" />
              </div>
              <span className="font-medium">Local Events & Community Gatherings</span>
            </div>
          </div>

          {/* Privacy Assurance */}
          <div className="mb-5 flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Used only when app is open • Encrypted in transit • Never sold</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleRequestLocation}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.98]"
            >
              Continue & Allow Location
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Not Now (Select City Manually)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
