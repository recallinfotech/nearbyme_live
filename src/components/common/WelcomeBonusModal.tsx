import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gift, CheckCircle2, ArrowRight } from 'lucide-react';

interface WelcomeBonusModalProps {
  isOpen: boolean;
  amount: number;
  message?: string;
  onClose: () => void;
}

export const WelcomeBonusModal: React.FC<WelcomeBonusModalProps> = ({
  isOpen,
  amount,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 p-6 text-center text-white shadow-2xl border border-indigo-500/30"
        >
          {/* Glowing Ambient Background Circles */}
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-indigo-500/25 rounded-full blur-2xl pointer-events-none" />

          {/* Animated Icon Badge */}
          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-900">
              <Gift className="h-10 w-10 text-amber-400 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* Title & Amount Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> First Login Bonus
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-white mb-1">
            ₹{amount.toFixed(0)} Welcome Gift!
          </h3>

          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            {message || `Welcome to Nearby! ₹${amount.toFixed(0)} has been credited to your wallet to get you started.`}
          </p>

          {/* Feature highlights */}
          <div className="mb-6 rounded-2xl bg-slate-800/60 p-3.5 border border-slate-700/60 text-left space-y-2">
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instantly available in your Nearby wallet</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Use to unlock contacts & verified services</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-98 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <span>Awesome, Let's Explore!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
