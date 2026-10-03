import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SideMenu } from './SideMenu';
import {
  MapPin,
  Search,
  User as UserIcon,
  Menu,
  X,
  Grid,
  Layers,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Building2,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { getCombinedCategories, IMAGE_BASE_URL } from '../../services/api';

interface HeaderProps {
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  categories?: any[];
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm = '',
  onSearchChange,
  categories: initialCategories
}) => {
  const {
    location,
    requestLocation,
    isLoading: isLocationLoading,
    openLocationModal,
    isManualLocation,
  } = useLocation();
  const { user, refreshProfile } = useAuth();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [internalCategories, setInternalCategories] = useState<any[]>(initialCategories || []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshingLoc, setIsRefreshingLoc] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      refreshProfile();
    }
  }, [user?.id]);

  // Sync passed categories if any
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setInternalCategories(initialCategories);
    }
  }, [initialCategories]);

  // Load categories once if not provided
  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      getCombinedCategories({ lat: location?.latitude, lng: location?.longitude })
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            setInternalCategories(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [initialCategories ? initialCategories.length : 0, location?.latitude, location?.longitude]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronize native mobile status bar color seamlessly with header
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const updateStatusBar = async () => {
        try {
          await StatusBar.setOverlaysWebView({ overlay: true });
          const isDark = document.documentElement.classList.contains('dark');
          if (isDark) {
            await StatusBar.setStyle({ style: Style.Light });
          } else {
            await StatusBar.setStyle({ style: Style.Dark });
          }
        } catch (e) {
          // StatusBar plugin fallback
        }
      };
      updateStatusBar();
    }
  }, []);

  // Filter matching categories & sub-categories
  const searchResults = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) {
      return { categories: [], subCategories: [] };
    }
    const term = searchTerm.toLowerCase().trim();
    const matchedCats: any[] = [];
    const matchedSubs: any[] = [];

    internalCategories.forEach((cat) => {
      const catName = cat.name || '';
      const catTags = cat.tags || '';
      const catId = cat.category_id || cat.id;

      if (catName.toLowerCase().includes(term) || catTags.toLowerCase().includes(term)) {
        matchedCats.push(cat);
      }

      if (cat.sub_categories && Array.isArray(cat.sub_categories)) {
        cat.sub_categories.forEach((sub: any) => {
          if (sub.name?.toLowerCase().includes(term) || sub.tags?.toLowerCase().includes(term)) {
            matchedSubs.push({
              ...sub,
              parent_category_name: catName,
              parent_category_id: catId,
            });
          }
        });
      }
    });

    return {
      categories: matchedCats.slice(0, 6),
      subCategories: matchedSubs.slice(0, 8),
    };
  }, [internalCategories, searchTerm]);

  // Handlers for direct navigation to service providers listing
  const handleSelectCategory = (cat: any) => {
    const catId = cat.category_id || cat.id;
    setIsDropdownOpen(false);
    navigate(`/providers?category_id=${catId}&category_name=${encodeURIComponent(cat.name || '')}`);
  };

  const handleSelectSubCategory = (sub: any) => {
    const subId = sub.sub_category_id || sub.id;
    const parentId = sub.parent_category_id;
    setIsDropdownOpen(false);
    navigate(`/providers?category_id=${parentId}&sub_category_id=${subId}&sub_category_name=${encodeURIComponent(sub.name || '')}`);
  };

  const handleGeneralSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsDropdownOpen(false);
    navigate(`/providers?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 dark:from-indigo-900 dark:via-purple-900 dark:to-violet-950 text-white shadow-xl shadow-indigo-950/30 rounded-b-[1.75rem] sm:rounded-b-[2.25rem] px-4 sm:px-6 pt-10 sm:pt-11 pb-3.5 sm:pb-4 transition-colors duration-300 border-b border-indigo-400/30 dark:border-purple-500/30 drop-shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5 sm:gap-3">
          <div className="flex items-center justify-between">
            {/* Hamburger Button + Logo */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsSideMenuOpen(true)}
                aria-label="Open Navigation Menu"
                className="p-1 text-white hover:text-purple-200 active:scale-90 transition shrink-0"
              >
                <Menu className="w-6 h-6 stroke-[2.2]" />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <Link to="/" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md hover:scale-105 transition-transform bg-white border border-white/30 p-0.5 shrink-0 flex items-center justify-center">
                  <img src="/logo.png" alt="Nearby Me Logo" className="w-full h-full object-contain" />
                </Link>
                <div className="min-w-0">
                  <Link to="/" className="text-base sm:text-lg font-bold text-white leading-none block whitespace-nowrap tracking-tight hover:text-purple-100 transition">
                    Nearby Me
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openLocationModal();
                    }}
                    title="Tap to change location or search city"
                    aria-label="Change Location"
                    className="flex items-center gap-1 text-[10px] sm:text-[11px] text-purple-200 hover:text-white font-medium pt-0.5 whitespace-nowrap truncate max-w-[155px] sm:max-w-[240px] transition text-left cursor-pointer group/loc active:scale-95 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full border border-white/20 shadow-xs mt-0.5"
                  >
                    <MapPin className={`w-3 h-3 text-amber-300 shrink-0 ${isRefreshingLoc || isLocationLoading ? 'animate-bounce text-amber-200' : 'group-hover/loc:scale-110'}`} />
                    <span className="truncate font-semibold text-white">
                      {isRefreshingLoc || isLocationLoading
                        ? 'Updating...'
                        : location?.areaName || location?.city || (location ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : 'Select Location')}
                    </span>
                    <ChevronDown className="w-3 h-3 text-purple-200 group-hover/loc:text-white shrink-0 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Wallet & Profile Avatar */}
            <div className="flex items-center gap-2">
              {user && (
                <Link
                  to="/wallet"
                  className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white font-semibold text-xs shadow-sm flex items-center gap-1 hover:opacity-95 transition shrink-0"
                >
                  <span>🪙 ₹{Number(user.wallet_balance || 0).toLocaleString('en-IN')}</span>
                </Link>
              )}

              <Link
                to={user ? "/profile" : "/auth/login"}
                className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center transition overflow-hidden shadow-xs hover:border-white active:scale-95 shrink-0"
              >
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
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    );
                  }

                  if (user) {
                    return (
                      <div className="w-full h-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                        {(user.first_name || user.name || user.email || user.phone || 'U').trim().charAt(0).toUpperCase()}
                      </div>
                    );
                  }

                  return (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center text-white">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  );
                })()}
              </Link>
            </div>
          </div>

          {/* Search Bar with Instant Interactive Category & Subcategory Dropdown */}
          {onSearchChange && (
            <div ref={searchContainerRef} className="relative z-50">
              <form onSubmit={handleGeneralSearch} className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-200" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onFocus={() => {
                    if (searchTerm.trim().length > 0) setIsDropdownOpen(true);
                  }}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    if (e.target.value.trim().length > 0) {
                      setIsDropdownOpen(true);
                    } else {
                      setIsDropdownOpen(false);
                    }
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/15 dark:bg-white/10 border border-white/30 text-white placeholder-purple-200/80 text-xs sm:text-sm font-medium focus:outline-none focus:border-white focus:ring-2 focus:ring-white/30 transition shadow-inner backdrop-blur-xs"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange('');
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-purple-200/80 hover:text-white hover:bg-white/20 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* 🎯 Instant Floating Category & Subcategory Search Dropdown */}
              {isDropdownOpen && searchTerm.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[75vh] sm:max-h-[480px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 text-slate-900 dark:text-white divide-y divide-slate-100 dark:divide-slate-800">
                  
                  {/* Results Header */}
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Search Suggestions for "{searchTerm}"
                    </span>
                    <button
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. Matching Categories Section */}
                  {searchResults.categories.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="px-2.5 py-1 text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Grid className="w-3.5 h-3.5" />
                        <span>Categories ({searchResults.categories.length})</span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.categories.map((cat: any) => {
                          const iconUrl = cat.icon_url || cat.icon || cat.image;
                          return (
                            <button
                              key={`cat-${cat.category_id || cat.id}`}
                              onClick={() => handleSelectCategory(cat)}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50/80 dark:hover:bg-slate-800/80 flex items-center justify-between group transition active:scale-[0.99]"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                                  {iconUrl ? (
                                    <img src={iconUrl} alt="" className="w-full h-full object-contain" />
                                  ) : (
                                    <Grid className="w-4 h-4 text-indigo-600" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                    {localize(cat.name)}
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                    Main Category • Click to view providers
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <span>Explore</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. Matching Sub-Categories Section */}
                  {searchResults.subCategories.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="px-2.5 py-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Sub-Categories & Services ({searchResults.subCategories.length})</span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.subCategories.map((sub: any) => {
                          const iconUrl = sub.icon_url || sub.icon;
                          return (
                            <button
                              key={`sub-${sub.sub_category_id || sub.id}`}
                              onClick={() => handleSelectSubCategory(sub)}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/80 dark:hover:bg-slate-800/80 flex items-center justify-between group transition active:scale-[0.99]"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                                  {iconUrl ? (
                                    <img src={iconUrl} alt="" className="w-full h-full object-contain" />
                                  ) : (
                                    <Layers className="w-4 h-4 text-emerald-600" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                                    {localize(sub.name)}
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                    In <span className="font-bold text-slate-700 dark:text-slate-300">{localize(sub.parent_category_name)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <span>View</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. Direct Service Provider Keyword Search Option */}
                  <div className="p-2 bg-slate-50/70 dark:bg-slate-800/40">
                    <button
                      onClick={handleGeneralSearch}
                      className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-blue-600/10 hover:from-indigo-600 hover:to-purple-600 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:text-white flex items-center justify-between group transition font-extrabold text-xs shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-indigo-600 transition">
                          <Search className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">
                          Search all service providers for "{searchTerm}"
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Side Navigation Drawer Menu */}
      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />
    </>
  );
};

