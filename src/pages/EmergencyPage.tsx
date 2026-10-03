import React, { useState } from 'react';
import { EMERGENCY_DATA, DirectoryItem } from '../data/staticData';
import { useLanguage } from '../context/LanguageContext';
import {
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ambulance,
  Flame,
  Heart,
  HeartHandshake,
  Users,
  Award,
  Laptop,
  Eye,
  AlertTriangle,
  Car,
  Train,
  LifeBuoy,
  Fingerprint,
  ArrowLeft,
  Search,
  X,
  AlertOctagon,
  LucideIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Icon resolution helper for Emergency Directory
const getEmergencyIcon = (item: DirectoryItem): LucideIcon => {
  const t = item.title.toLowerCase();
  const num = item.number;

  if (num === '112' || t.includes('emergency police')) return Shield;
  if (num === '100' || t.includes('alternate police')) return Phone;
  if (num === '108' || t.includes('ambulance') || t.includes('medical')) return Ambulance;
  if (num === '101' || t.includes('fire')) return Flame;
  if (num === '1091' || (t.includes('women') && !t.includes('distress'))) return HeartHandshake;
  if (num === '181' || t.includes('distress')) return Heart;
  if (num === '1098' || t.includes('child')) return Users;
  if (num === '14567' || t.includes('elder') || t.includes('senior')) return Award;
  if (num === '1930' || t.includes('cyber')) return Laptop;
  if (num === '1064' || t.includes('corruption')) return Eye;
  if (num === '1906' || t.includes('gas') || t.includes('leakage')) return AlertTriangle;
  if (num === '1033' || t.includes('highway')) return Car;
  if (num === '1095' || t.includes('traffic')) return Car;
  if (num === '1072' || num === '139' || t.includes('railway') || t.includes('train')) return Train;
  if (num === '1070' || t.includes('disaster') || t.includes('ndrf')) return LifeBuoy;
  if (num === '1947' || t.includes('aadhaar')) return Fingerprint;

  return ShieldAlert;
};

export const EmergencyPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: t('allHelplines') },
    { id: 'police', label: t('policeSecurity') },
    { id: 'medical', label: t('medicalFire') },
    { id: 'women', label: t('womenChild') },
    { id: 'relief', label: t('reliefUtilities') },
  ];

  const filteredData = EMERGENCY_DATA.filter((item) => {
    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase();
      const matchSearch = (
        item.title.toLowerCase().includes(term) ||
        item.subtitle.toLowerCase().includes(term) ||
        item.number.includes(term)
      );
      if (!matchSearch) return false;
    }

    // Category filter
    if (activeCategory === 'police') {
      return ['112', '100', '1930', '1064', '1095'].includes(item.number);
    }
    if (activeCategory === 'medical') {
      return ['108', '101', '1033'].includes(item.number);
    }
    if (activeCategory === 'women') {
      return ['1091', '181', '1098', '14567'].includes(item.number);
    }
    if (activeCategory === 'relief') {
      return ['1906', '1072', '1070', '1947'].includes(item.number);
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-24">
      {/* Top Header Banner - Crimson Gradient Style with Safe Top Padding */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-rose-900 pt-10 sm:pt-11 pb-5 px-4 sm:px-6 rounded-b-[1.75rem] sm:rounded-b-[2.25rem] shadow-xl shadow-rose-950/20 text-white">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Header Title Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-1 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition text-white backdrop-blur-sm shadow-xs"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex-1">
              {t('emergencyTitle')}
            </h1>
          </div>

          {/* Translucent Banner Alert Box */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-xs flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-white/20 shrink-0 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-medium leading-snug text-white/95">
              {t('emergencyBannerText')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 -mt-3 space-y-3">
        {/* Search Bar */}
        <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-slate-200/90 dark:border-slate-800 p-0.5 flex items-center transition-all focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500">
          <Search className="w-3.5 h-3.5 ml-3 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-2 pr-8 py-2 bg-transparent text-slate-900 dark:text-white text-xs font-medium focus:outline-none placeholder-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Quick Filter Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Directory Helpline Cards List */}
        <div className="space-y-2 pt-0.5">
          {filteredData.map((item) => {
            const ItemIcon = getEmergencyIcon(item);

            return (
              <a
                key={item.id}
                href={`tel:${item.number}`}
                className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3 hover:border-rose-500/40 dark:hover:border-rose-500/40 transition-all active:scale-[0.99] group block"
              >
                {/* Left Side Icon Badge */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105"
                  style={{ backgroundColor: item.bg, color: item.color }}
                >
                  <ItemIcon className="w-5 h-5 stroke-[2]" />
                </div>

                {/* Middle Title & Subtitle */}
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 leading-snug line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>

                {/* Right Side: Helpline Number + Call Icon */}
                <div className="flex items-center gap-2 shrink-0 pl-1">
                  <span
                    className="font-semibold text-sm sm:text-base tracking-tight"
                    style={{ color: item.color }}
                  >
                    {item.number}
                  </span>
                  <div
                    className="w-7.5 h-7.5 rounded-full flex items-center justify-center text-white shadow-2xs transition-transform active:scale-90 shrink-0"
                    style={{ backgroundColor: item.color }}
                  >
                    <Phone className="w-3.5 h-3.5 fill-white text-white" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 mt-4">
            <AlertOctagon className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">
              {t('noHelplineFound')} "{search}"
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
export default EmergencyPage;
