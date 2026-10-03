import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SplashScreen: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden select-none"
        >
          {/* Ambient Background Gradient Orbs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl" />

          {/* Logo Container */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center gap-4 text-center z-10"
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900 border border-slate-800 p-2.5 shadow-2xl shadow-indigo-500/30 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Nearby Me Logo"
                className="w-full h-full object-contain drop-shadow-lg animate-pulse"
              />
            </div>

            <div className="space-y-1 pt-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                Nearby <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-indigo-400 to-purple-400">Me</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Discover Services, Businesses & Events
              </p>
            </div>
          </motion.div>

          {/* Bottom Loading Progress Indicator */}
          <div className="absolute bottom-10 flex flex-col items-center gap-3">
            <div className="w-28 h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
                className="w-full h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-500"
              />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
              Connecting Nearby...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
