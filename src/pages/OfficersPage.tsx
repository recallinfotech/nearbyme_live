import React, { useState } from 'react';
import { OFFICERS_DATA, DirectoryItem } from '../data/staticData';
import { useLanguage } from '../context/LanguageContext';
import {
  Phone,
  Building2,
  Building,
  Landmark,
  ShieldCheck,
  Scale,
  BadgeCheck,
  Crown,
  Car,
  Activity,
  Zap,
  Droplets,
  GraduationCap,
  Compass,
  ArrowLeft,
  Search,
  X,
  AlertOctagon,
  UserCheck,
  Lock,
  LucideIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Icon resolution helper for Officers Directory
const getOfficerIcon = (title: string): LucideIcon => {
  const t = title.toLowerCase();
  if (t.includes('dm') || t.includes('magistrate')) return UserCheck;
  if (t.includes('cp') || t.includes('commissioner of police') || t.includes('ssp') || t.includes('sp city')) return ShieldCheck;
  if (t.includes('sdm')) return Scale;
  if (t.includes('co (circle')) return BadgeCheck;
  if (t.includes('sho police')) return Lock;
  if (t.includes('mayor')) return Crown;
  if (t.includes('municipal commissioner') || t.includes('nagar aayukt')) return Landmark;
  if (t.includes('ada') || t.includes('development authority')) return Building2;
  if (t.includes('rto') || t.includes('transport')) return Car;
  if (t.includes('cmo') || t.includes('medical') || t.includes('health')) return Activity;
  if (t.includes('uppcl') || t.includes('electricity') || t.includes('torrent')) return Zap;
  if (t.includes('jal sansthan') || t.includes('water')) return Droplets;
  if (t.includes('bsac') || t.includes('shiksha') || t.includes('education')) return GraduationCap;
  if (t.includes('tourism')) return Compass;
  return Building;
};

export const OfficersPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filteredData = OFFICERS_DATA.filter((item) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.subtitle.toLowerCase().includes(term) ||
      item.number.includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-24">
      {/* Top Header Banner with Safe Top Padding */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 pt-10 sm:pt-11 pb-5 px-4 sm:px-6 rounded-b-[1.75rem] sm:rounded-b-[2.25rem] shadow-xl shadow-indigo-950/20 text-white">
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
              {t('officersTitle')}
            </h1>
          </div>

          {/* Translucent Banner Alert Box */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-xs flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-white/20 shrink-0 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-medium leading-snug text-white/95">
              {t('officersBannerText')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 -mt-3 space-y-3">
        {/* Search Bar */}
        <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-slate-200/90 dark:border-slate-800 p-0.5 flex items-center transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
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

        {/* Directory Helpline Cards List */}
        <div className="space-y-2 pt-0.5">
          {filteredData.map((item) => {
            const ItemIcon = getOfficerIcon(item.title);

            return (
              <a
                key={item.id}
                href={`tel:${item.number}`}
                className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all active:scale-[0.99] group block"
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
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 leading-snug line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>

                {/* Right Side: Contact Number + Call Icon */}
                <div className="flex items-center gap-2 shrink-0 pl-1">
                  <span
                    className="font-semibold text-xs sm:text-sm tracking-tight"
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
            <p className="text-xs font-medium text-slate-800 dark:text-slate-300">
              {t('noOfficersFound')} "{search}"
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
export default OfficersPage;
