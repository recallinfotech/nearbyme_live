import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { getCombinedCategories, getWallet } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Folder, Layers, Search, ArrowRight, Wallet, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CARD_THEMES = [
  {
    bg: 'bg-gradient-to-br from-indigo-50/90 via-blue-50/40 to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900',
    border: 'border-indigo-100/90 dark:border-indigo-900/40',
    hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700/60',
    iconBg: 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    pillBg: 'bg-white/90 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border-indigo-100/80 dark:border-indigo-950',
    subIconBg: 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-100 dark:border-indigo-900/30',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    divider: 'border-indigo-100/80 dark:border-indigo-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900',
    border: 'border-emerald-100/90 dark:border-emerald-900/40',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700/60',
    iconBg: 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    pillBg: 'bg-white/90 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border-emerald-100/80 dark:border-emerald-950',
    subIconBg: 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/30',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    divider: 'border-emerald-100/80 dark:border-emerald-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900',
    border: 'border-amber-100/90 dark:border-amber-900/40',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700/60',
    iconBg: 'bg-white dark:bg-slate-800 border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400',
    pillBg: 'bg-white/90 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border-amber-100/80 dark:border-amber-950',
    subIconBg: 'bg-amber-50/70 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/30',
    accentText: 'text-amber-600 dark:text-amber-400',
    divider: 'border-amber-100/80 dark:border-amber-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900',
    border: 'border-rose-100/90 dark:border-rose-900/40',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700/60',
    iconBg: 'bg-white dark:bg-slate-800 border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400',
    pillBg: 'bg-white/90 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border-rose-100/80 dark:border-rose-950',
    subIconBg: 'bg-rose-50/70 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/30',
    accentText: 'text-rose-600 dark:text-rose-400',
    divider: 'border-rose-100/80 dark:border-rose-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-purple-50/90 via-fuchsia-50/40 to-white dark:from-purple-950/30 dark:via-slate-900 dark:to-slate-900',
    border: 'border-purple-100/90 dark:border-purple-900/40',
    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700/60',
    iconBg: 'bg-white dark:bg-slate-800 border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400',
    pillBg: 'bg-white/90 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border-purple-100/80 dark:border-purple-950',
    subIconBg: 'bg-purple-50/70 dark:bg-purple-950/50 border-purple-100 dark:border-purple-900/30',
    accentText: 'text-purple-600 dark:text-purple-400',
    divider: 'border-purple-100/80 dark:border-purple-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-cyan-50/90 via-sky-50/40 to-white dark:from-cyan-950/30 dark:via-slate-900 dark:to-slate-900',
    border: 'border-cyan-100/90 dark:border-cyan-900/40',
    hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-700/60',
    iconBg: 'bg-white dark:bg-slate-800 border-cyan-100 dark:border-cyan-900/40 text-cyan-600 dark:text-cyan-400',
    pillBg: 'bg-white/90 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border-cyan-100/80 dark:border-cyan-950',
    subIconBg: 'bg-cyan-50/70 dark:bg-cyan-950/50 border-cyan-100 dark:border-cyan-900/30',
    accentText: 'text-cyan-600 dark:text-cyan-400',
    divider: 'border-cyan-100/80 dark:border-cyan-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-lime-50/90 via-emerald-50/40 to-white dark:from-lime-950/30 dark:via-slate-900 dark:to-slate-900',
    border: 'border-lime-100/90 dark:border-lime-900/40',
    hoverBorder: 'hover:border-lime-300 dark:hover:border-lime-700/60',
    iconBg: 'bg-white dark:bg-slate-800 border-lime-100 dark:border-lime-900/40 text-lime-600 dark:text-lime-400',
    pillBg: 'bg-white/90 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border-lime-100/80 dark:border-lime-950',
    subIconBg: 'bg-lime-50/70 dark:bg-lime-950/50 border-lime-100 dark:border-lime-900/30',
    accentText: 'text-lime-600 dark:text-lime-400',
    divider: 'border-lime-100/80 dark:border-lime-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-violet-50/90 via-indigo-50/40 to-white dark:from-violet-950/30 dark:via-slate-900 dark:to-slate-900',
    border: 'border-violet-100/90 dark:border-violet-900/40',
    hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-700/60',
    iconBg: 'bg-white dark:bg-slate-800 border-violet-100 dark:border-violet-900/40 text-violet-600 dark:text-violet-400',
    pillBg: 'bg-white/90 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border-violet-100/80 dark:border-violet-950',
    subIconBg: 'bg-violet-50/70 dark:bg-violet-950/50 border-violet-100 dark:border-violet-900/30',
    accentText: 'text-violet-600 dark:text-violet-400',
    divider: 'border-violet-100/80 dark:border-violet-900/30',
  },
];

export const CategoriesPage: React.FC = () => {
  const { location } = useLocation();
  const { user } = useAuth();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(user?.wallet_balance || 0);
  const [loading, setLoading] = useState<boolean>(true);

  // Load Wallet Balance
  const loadWallet = useCallback(async () => {
    if (user?.id) {
      try {
        const walletRes = await getWallet(user.id);
        if (walletRes.data?.data) {
          setWalletBalance(walletRes.data.data.balance || walletRes.data.data.wallet_balance || 0);
        }
      } catch (e) {
        console.error("Wallet error:", e);
      }
    }
  }, [user?.id]);

  // Load Combined Categories
  useEffect(() => {
    const fetchCombined = async () => {
      setLoading(true);
      try {
        const res = await getCombinedCategories({ lat: location?.latitude, lng: location?.longitude });
        if (res.data?.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCombined();
    loadWallet();
  }, [location?.latitude, location?.longitude, loadWallet]);

  // Filter Categories and their Subcategories based on in-page Search (Name + Tags)
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase().trim();

    return categories
      .map((cat) => {
        const catNameMatches = (cat.name || '').toLowerCase().includes(term);
        const catTagsMatches = (cat.tags || '').toLowerCase().includes(term);
        const matchedSubs = (cat.sub_categories || []).filter((sub: any) =>
          (sub.name || '').toLowerCase().includes(term) ||
          (sub.tags || '').toLowerCase().includes(term)
        );

        if (catNameMatches || catTagsMatches) {
          return cat;
        }

        if (matchedSubs.length > 0) {
          return {
            ...cat,
            sub_categories: matchedSubs,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [categories, searchTerm]);

  const handleCategoryClick = (catId: number | string) => {
    navigate(`/providers?category_id=${catId}`);
  };

  const handleSubCategoryClick = (catId: number | string, subId: number | string) => {
    navigate(`/providers?category_id=${catId}&sub_category_id=${subId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header without search bar */}
      <Header categories={categories} />

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Top Wallet & Title Bar */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t('categories')}</h1>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
              {t('selectCategoryType')}
            </p>
          </div>

          <button
            onClick={() => navigate('/wallet')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>₹{walletBalance}</span>
          </button>
        </div>

        {/* In-Page Search Categories & Services Input */}
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5 shadow-xs">
          <div className="flex items-center px-3 gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={t('searchServicesPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-1.5 bg-transparent text-xs font-normal text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories List Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-xs font-medium">{t('pleaseWait')}</p>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="space-y-3">
            {filteredCategories.map((cat, idx) => {
              const catId = cat.category_id || cat.id;
              const subCats = cat.sub_categories || [];
              const theme = CARD_THEMES[idx % CARD_THEMES.length];

              return (
                <div
                  key={catId ? `cat-${catId}-${idx}` : `cat-idx-${idx}`}
                  className={`${theme.bg} p-3.5 sm:p-4 rounded-2xl border ${theme.border} shadow-2xs space-y-2.5 transition hover:shadow-xs ${theme.hoverBorder}`}
                >
                  {/* Category Header */}
                  <div
                    onClick={() => handleCategoryClick(catId)}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl ${theme.iconBg} border p-1.5 flex items-center justify-center shrink-0 shadow-2xs`}>
                        {cat.icon_url ? (
                          <img src={cat.icon_url} alt={cat.name} className="w-full h-full object-contain" />
                        ) : (
                          <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug">
                          {localize(cat.name)}
                        </h2>
                        <span className="text-[11px] text-slate-400 font-normal block">{t('servicesOffered')}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(catId);
                      }}
                      className={`text-xs font-medium ${theme.accentText} hover:opacity-80 flex items-center gap-1 shrink-0`}
                    >
                      <span>{t('viewAll')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subcategories 2-Column Horizontal Pills */}
                  {subCats.length > 0 && (
                    <div className={`grid grid-cols-2 gap-1.5 sm:gap-2 pt-2 border-t ${theme.divider}`}>
                      {subCats.map((sub: any, subIdx: number) => {
                        const subId = sub.sub_category_id || sub.id;

                        return (
                          <div
                            key={subId ? `sub-${subId}-${subIdx}` : `sub-idx-${subIdx}`}
                            onClick={() => handleSubCategoryClick(catId, subId)}
                            className="flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer group/sub min-w-0 active:scale-98"
                          >
                            <div className="w-5 h-5 flex items-center justify-center shrink-0 group-hover/sub:scale-110 transition-transform">
                              {sub.icon_url ? (
                                <img src={sub.icon_url} alt={sub.name} className="w-full h-full object-contain" />
                              ) : (
                                <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                              )}
                            </div>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover/sub:text-indigo-600 dark:group-hover/sub:text-indigo-400 leading-tight transition break-words line-clamp-2">
                              {localize(sub.name)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-3xl space-y-2 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Folder className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('noCategoriesFound')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('trySearching')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
export default CategoriesPage;
