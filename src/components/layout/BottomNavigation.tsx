import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Home, Grid, Calendar, Megaphone, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNavigation: React.FC = () => {
  const { pathname, search } = useLocation();
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'services',
      label: 'Services',
      path: '/categories',
      icon: Grid,
      isCenter: false,
      isActive: pathname === '/categories' || pathname.startsWith('/providers'),
    },
    {
      id: 'events',
      label: t('events'),
      path: '/events?type=event',
      icon: Calendar,
      isCenter: false,
      isActive: pathname === '/events' && (!search || search.includes('type=event')),
    },
    {
      id: 'home',
      label: t('home'),
      path: '/',
      icon: Home,
      isCenter: true,
      isActive: pathname === '/',
    },
    {
      id: 'ads_jobs',
      label: 'Ads & Jobs',
      path: '/events?type=job',
      icon: Megaphone,
      isCenter: false,
      isActive:
        (pathname === '/events' &&
          (search.includes('type=job') ||
            search.includes('type=item_sale') ||
            search.includes('type=rental') ||
            search.includes('type=all'))) ||
        pathname.startsWith('/my-listings') ||
        pathname.startsWith('/add-event'),
    },
    {
      id: 'partner',
      label: t('partner'),
      path: '/partner',
      icon: Handshake,
      isCenter: false,
      isActive: pathname.startsWith('/partner') || pathname.startsWith('/my-businesses'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/80 px-1.5 py-1.5 transition-colors duration-300 shadow-lg">
      <div className="max-w-lg mx-auto flex items-center justify-between relative px-1">
        {navItems.map((item) => {
          const isActive = item.isActive;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.id}
                to={item.path}
                className="relative -top-4 flex flex-col items-center group z-20 shrink-0 px-1"
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-indigo-500/40 ring-4 ring-indigo-100 dark:ring-indigo-950/80'
                      : 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-indigo-500/25 group-hover:shadow-indigo-500/40'
                  }`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </motion.div>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold mt-1 transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-300 group-hover:text-indigo-500'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className="relative flex flex-col items-center py-1 px-1.5 sm:px-2 rounded-2xl transition group flex-1 min-w-0"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-4.5 h-4.5 sm:w-5 sm:h-5 relative z-10 transition-colors shrink-0 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-110'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                }`}
              />
              <span
                className={`text-[9.5px] sm:text-[10.5px] font-semibold mt-0.5 relative z-10 transition-colors text-center truncate max-w-full leading-tight ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-300 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
