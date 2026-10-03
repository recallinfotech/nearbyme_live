import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  User,
  BookOpen,
  Users,
  Search,
  Calendar,
  Wallet,
  AlertTriangle,
  Building2,
  LogOut,
  X,
  ChevronRight,
  Sun,
  Moon,
  Plus,
  Globe,
  Briefcase,
  ShoppingBag,
  Sparkles,
  PlusCircle,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../../services/api';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const { location, openLocationModal, isManualLocation } = useLocation();
  const navigate = useNavigate();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showEventsMenu, setShowEventsMenu] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      refreshProfile();
    }
  }, [isOpen, user?.id]);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/');
  };

  const eventSubItems = [
    { label: t('allListings'), path: '/events?type=all', icon: Sparkles, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' },
    { label: t('jobs'), path: '/events?type=job', icon: Briefcase, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60' },
    { label: t('buySell'), path: '/events?type=item_sale', icon: ShoppingBag, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' },
    { label: t('rentals'), path: '/events?type=rental', icon: Home, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' },
    { label: t('communityEvents'), path: '/events?type=event', icon: Calendar, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60' },
  ];

  const topMenuItems = [
    { label: t('home'), path: '/', icon: Home, color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' },
    { label: t('profile'), path: '/profile', icon: User, color: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400' },
    { label: t('myPhonebook'), path: '/phonebook', icon: BookOpen, color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' },
    { label: t('partnerDashboard'), path: '/partner', icon: Users, color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' },
    { label: t('searchServices'), path: '/categories', icon: Search, color: 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400' },
  ];

  const bottomMenuItems = [
    { label: t('creditWallet'), path: '/wallet', icon: Wallet, color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' },
    { label: t('emergencyPhonebook'), path: '/emergency', icon: AlertTriangle, color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' },
    { label: t('officersDirectory'), path: '/officers', icon: Building2, color: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Side Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-slate-950 shadow-2xl flex flex-col justify-between overflow-y-auto no-scrollbar"
          >
            <div>
              {/* Header Compact Gradient Card with Camera Notch / Status Bar Safe-Area Padding */}
              <div className="relative bg-gradient-to-br from-violet-700 via-indigo-600 to-purple-800 px-4 pt-11 pb-4 text-white space-y-3 shadow-md">
                <button
                  onClick={onClose}
                  className="absolute top-7 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* User Info */}
                <div className="flex items-center gap-2.5 pt-0.5">
                  <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0">
                    {(() => {
                      const userAvatarUrl =
                        user?.profile_image_url ||
                        user?.avatar ||
                        (user?.profile_image
                          ? user.profile_image.startsWith('http')
                            ? user.profile_image
                            : `${IMAGE_BASE_URL}storage/${user.profile_image.replace(/^\//, '')}`
                          : null);

                      if (userAvatarUrl) {
                        return (
                          <img
                            src={userAvatarUrl}
                            alt={user?.name || 'User'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        );
                      }

                      return (
                        <span>{(user?.first_name || user?.name || user?.email || 'U').trim().charAt(0).toUpperCase()}</span>
                      );
                    })()}
                  </div>

                  <div className="min-w-0 pr-6">
                    <h3 className="font-extrabold text-sm leading-tight line-clamp-1">
                      {user?.name || t('profile')}
                    </h3>
                    <p className="text-[10px] text-indigo-100 font-medium line-clamp-1 opacity-90">
                      {user?.email || user?.phone || t('loginToManage')}
                    </p>
                  </div>
                </div>

                {/* Compact Available Balance Pill Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 px-3 flex items-center justify-between border border-white/30">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                      🪙
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-100 block leading-none">
                        {t('availableBalance')}
                      </span>
                      <span className="text-xs font-black text-white leading-tight">
                        ₹{Number(user?.wallet_balance || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavigate('/wallet')}
                    className="px-2.5 py-1 bg-white text-indigo-950 hover:bg-indigo-50 text-[10px] font-extrabold rounded-full flex items-center gap-1 shadow-sm active:scale-95 transition"
                  >
                    <span>{t('addCredits')}</span>
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Location Quick Switcher Button */}
                <button
                  onClick={() => {
                    onClose();
                    openLocationModal();
                  }}
                  className="w-full mt-1 p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 flex items-center justify-between text-left transition active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-900" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase tracking-wider font-bold text-indigo-100 flex items-center gap-1">
                        <span>{t('location') || 'Location'}</span>
                        <span className="text-[8px] font-bold px-1 rounded bg-white/20 text-white">
                          {isManualLocation ? 'Manual' : 'Live GPS'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {location?.areaName || location?.city || 'Select Location'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-100 group-hover:text-white px-2 py-0.5 rounded-full bg-white/10 shrink-0">
                    Change ▾
                  </span>
                </button>
              </div>

              {/* Navigation Menu List */}
              <div className="p-2.5 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-2 py-0.5">
                  {t('accountMenu')}
                </span>

                <div className="space-y-0.5">
                  {/* Top 5 Menu Items */}
                  {topMenuItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleNavigate(item.path)}
                        className="w-full py-1.5 px-2.5 rounded-xl flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-900 transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg p-1.5 flex items-center justify-center shrink-0 ${item.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 transition" />
                      </button>
                    );
                  })}

                  {/* 📅 EXPANDABLE EVENTS & CLASSIFIEDS ACCORDION */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setShowEventsMenu(!showEventsMenu)}
                      className={`w-full py-1.5 px-2.5 rounded-xl flex items-center justify-between text-left transition group ${
                        showEventsMenu
                          ? 'bg-pink-50/80 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg p-1.5 flex items-center justify-center shrink-0 bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 shadow-xs">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400 block">
                            {t('events')}
                          </span>
                          <span className="text-[9px] text-pink-600 dark:text-pink-400 font-semibold block leading-none opacity-85">
                            Jobs, Buy/Sell, Rentals & More
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showEventsMenu ? 'rotate-90 text-pink-600' : 'opacity-60'}`} />
                    </button>

                    {/* Sub-menu Tabs */}
                    <AnimatePresence>
                      {showEventsMenu && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-3 pr-1 py-1 space-y-1 overflow-hidden border-l-2 border-pink-400 dark:border-pink-600 ml-4 rounded-r-xl bg-pink-50/30 dark:bg-pink-950/20"
                        >
                          {eventSubItems.map((sub, sIdx) => {
                            const SubIcon = sub.icon;
                            return (
                              <button
                                key={sIdx}
                                onClick={() => handleNavigate(sub.path)}
                                className="w-full py-1.5 px-2 rounded-lg flex items-center justify-between text-left hover:bg-white dark:hover:bg-slate-900 shadow-xs transition group"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded-md p-1 flex items-center justify-center shrink-0 ${sub.color}`}>
                                    <SubIcon className="w-3 h-3" />
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400">
                                    {sub.label}
                                  </span>
                                </div>
                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-pink-500 transition" />
                              </button>
                            );
                          })}

                          {/* My Ads & Listings Management Link */}
                          <button
                            onClick={() => handleNavigate('/my-listings')}
                            className="w-full py-1.5 px-2 rounded-lg flex items-center justify-between text-left bg-indigo-50/70 dark:bg-indigo-950/50 hover:bg-white dark:hover:bg-slate-900 shadow-xs transition group"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md p-1 flex items-center justify-center shrink-0 bg-indigo-600 text-white">
                                <Briefcase className="w-3 h-3" />
                              </div>
                              <span className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300">
                                My Ads, Jobs & Leads
                              </span>
                            </div>
                            <ChevronRight className="w-3 h-3 text-indigo-500" />
                          </button>

                          {/* + Post Ad / Event Action Button */}
                          <button
                            onClick={() => handleNavigate('/events/add')}
                            className="w-full mt-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white flex items-center justify-between text-[11px] font-black shadow-md shadow-pink-500/20 active:scale-98 transition"
                          >
                            <span className="flex items-center gap-1.5">
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>{t('postAd')}</span>
                            </span>
                            <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-md uppercase font-bold">New</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Remaining Bottom Menu Items */}
                  {bottomMenuItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleNavigate(item.path)}
                        className="w-full py-1.5 px-2.5 rounded-xl flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-900 transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg p-1.5 flex items-center justify-center shrink-0 ${item.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 transition" />
                      </button>
                    );
                  })}

                  {/* Multi-Language Selector Accordion */}
                  <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                    <button
                      onClick={() => setShowLangMenu(!showLangMenu)}
                      className="w-full py-1.5 px-2.5 rounded-xl flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-900 transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg p-1.5 flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {t('selectLanguage')}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold block leading-none">
                            {supportedLanguages.find((l) => l.code === language)?.nativeName}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showLangMenu ? 'rotate-90' : ''}`} />
                    </button>

                    {showLangMenu && (
                      <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        {supportedLanguages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`p-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold transition ${
                              language === lang.code
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-indigo-500'
                            }`}
                          >
                            <span>{lang.flag}</span>
                            <span>{lang.nativeName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dark / Light Theme Toggle Menu Item */}
                  <button
                    onClick={toggleTheme}
                    className="w-full py-1.5 px-2.5 rounded-xl flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-900 transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg p-1.5 flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                        {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {t('theme')}: {theme === 'dark' ? `${t('darkMode')} 🌙` : `${t('lightMode')} ☀️`}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Logout Button */}
            <div className="p-2.5 border-t border-slate-200 dark:border-slate-800/80">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-xl flex items-center justify-between text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition font-bold text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg p-1.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    <span>{t('logout')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleNavigate('/auth/login')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30 text-center"
                >
                  {t('loginRegister')}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default SideMenu;
