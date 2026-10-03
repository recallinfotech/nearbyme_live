import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { useLocation } from '../context/LocationContext';
import { getProviders, getCombinedCategories, unlockProvider, getWallet, IMAGE_BASE_URL } from '../services/api';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { RefreshCw, AlertCircle, MapPin, Phone, Lock, Clock, Folder, CheckCircle2, MessageCircle, Wallet, Search, X, Tag, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const PROVIDER_CARD_THEMES = [
  {
    bg: 'bg-gradient-to-br from-indigo-50/80 via-blue-50/30 to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900',
    border: 'border-indigo-100/90 dark:border-indigo-900/40',
    hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700/60',
    bar: 'bg-indigo-600',
    imgBg: 'bg-indigo-50/50 dark:bg-slate-950 border-indigo-100 dark:border-indigo-900/40',
    catColor: 'text-indigo-600 dark:text-indigo-400',
    divider: 'border-indigo-100/80 dark:border-indigo-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900',
    border: 'border-emerald-100/90 dark:border-emerald-900/40',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700/60',
    bar: 'bg-emerald-600',
    imgBg: 'bg-emerald-50/50 dark:bg-slate-950 border-emerald-100 dark:border-emerald-900/40',
    catColor: 'text-emerald-600 dark:text-emerald-400',
    divider: 'border-emerald-100/80 dark:border-emerald-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900',
    border: 'border-amber-100/90 dark:border-amber-900/40',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700/60',
    bar: 'bg-amber-600',
    imgBg: 'bg-amber-50/50 dark:bg-slate-950 border-amber-100 dark:border-amber-900/40',
    catColor: 'text-amber-600 dark:text-amber-400',
    divider: 'border-amber-100/80 dark:border-amber-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-rose-50/80 via-pink-50/30 to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900',
    border: 'border-rose-100/90 dark:border-rose-900/40',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700/60',
    bar: 'bg-rose-600',
    imgBg: 'bg-rose-50/50 dark:bg-slate-950 border-rose-100 dark:border-rose-900/40',
    catColor: 'text-rose-600 dark:text-rose-400',
    divider: 'border-rose-100/80 dark:border-rose-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-purple-50/80 via-fuchsia-50/30 to-white dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-900',
    border: 'border-purple-100/90 dark:border-purple-900/40',
    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700/60',
    bar: 'bg-purple-600',
    imgBg: 'bg-purple-50/50 dark:bg-slate-950 border-purple-100 dark:border-purple-900/40',
    catColor: 'text-purple-600 dark:text-purple-400',
    divider: 'border-purple-100/80 dark:border-purple-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-cyan-50/80 via-sky-50/30 to-white dark:from-cyan-950/20 dark:via-slate-900 dark:to-slate-900',
    border: 'border-cyan-100/90 dark:border-cyan-900/40',
    hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-700/60',
    bar: 'bg-cyan-600',
    imgBg: 'bg-cyan-50/50 dark:bg-slate-950 border-cyan-100 dark:border-cyan-900/40',
    catColor: 'text-cyan-600 dark:text-cyan-400',
    divider: 'border-cyan-100/80 dark:border-cyan-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-lime-50/80 via-emerald-50/30 to-white dark:from-lime-950/20 dark:via-slate-900 dark:to-slate-900',
    border: 'border-lime-100/90 dark:border-lime-900/40',
    hoverBorder: 'hover:border-lime-300 dark:hover:border-lime-700/60',
    bar: 'bg-lime-600',
    imgBg: 'bg-lime-50/50 dark:bg-slate-950 border-lime-100 dark:border-lime-900/40',
    catColor: 'text-lime-600 dark:text-lime-400',
    divider: 'border-lime-100/80 dark:border-lime-900/30',
  },
  {
    bg: 'bg-gradient-to-br from-violet-50/80 via-indigo-50/30 to-white dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-900',
    border: 'border-violet-100/90 dark:border-violet-900/40',
    hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-700/60',
    bar: 'bg-violet-600',
    imgBg: 'bg-violet-50/50 dark:bg-slate-950 border-violet-100 dark:border-violet-900/40',
    catColor: 'text-violet-600 dark:text-violet-400',
    divider: 'border-violet-100/80 dark:border-violet-900/30',
  },
];

const DISTANCE_SLABS = [
  { min: 0, max: 2, label: '0 - 2 KM', active: 'bg-sky-600 text-white shadow-xs', inactive: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-900/40 hover:bg-sky-100' },
  { min: 2, max: 4, label: '2 - 4 KM', active: 'bg-emerald-600 text-white shadow-xs', inactive: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/40 hover:bg-emerald-100' },
  { min: 4, max: 6, label: '4 - 6 KM', active: 'bg-amber-600 text-white shadow-xs', inactive: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/40 hover:bg-amber-100' },
  { min: 6, max: 8, label: '6 - 8 KM', active: 'bg-rose-600 text-white shadow-xs', inactive: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/40 hover:bg-rose-100' },
  { min: 8, max: 10, label: '8 - 10 KM', active: 'bg-purple-600 text-white shadow-xs', inactive: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-900/40 hover:bg-purple-100' },
  { min: 0, max: 10, label: 'All (0-10 KM)', active: 'bg-indigo-600 text-white shadow-xs', inactive: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-900/40 hover:bg-indigo-100' },
];

export const ProvidersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryIdParam = searchParams.get('category_id');
  const subCategoryIdParam = searchParams.get('sub_category_id');
  const searchParam = searchParams.get('search');

  const { location } = useLocation();
  const { user, refreshProfile } = useAuth();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();

  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>(categoryIdParam || '');
  const [selectedSubCat, setSelectedSubCat] = useState<string>(subCategoryIdParam || '');
  const [selectedDistanceSlab, setSelectedDistanceSlab] = useState<{ min: number; max: number; label: string }>(DISTANCE_SLABS[5]);
  const [searchTerm, setSearchTerm] = useState<string>(searchParam || '');
  const [walletBalance, setWalletBalance] = useState<number>(user?.wallet_balance || 0);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);
  const [unlockingId, setUnlockingId] = useState<number | null>(null);

  // Sync searchParams
  useEffect(() => {
    if (categoryIdParam !== null) setSelectedCat(categoryIdParam || '');
    if (subCategoryIdParam !== null) setSelectedSubCat(subCategoryIdParam || '');
    if (searchParam !== null) setSearchTerm(searchParam || '');
    if (categoryIdParam || subCategoryIdParam || searchParam) {
      setSelectedDistanceSlab(DISTANCE_SLABS[5]); // Default to All (0-10 KM)
    }
  }, [categoryIdParam, subCategoryIdParam, searchParam]);

  // Load Wallet Balance from API
  const loadWallet = useCallback(async () => {
    if (user?.id) {
      try {
        const walletRes = await getWallet(user.id);
        if (walletRes.data?.data) {
          setWalletBalance(walletRes.data.data.balance || walletRes.data.data.wallet_balance || 0);
        }
      } catch (e) {
        console.error("Wallet Load Error:", e);
      }
    }
  }, [user?.id]);

  // Fetch Combined Categories
  useEffect(() => {
    getCombinedCategories({ lat: location?.latitude, lng: location?.longitude })
      .then((res) => {
        if (res.data?.data) setCategories(res.data.data);
      })
      .catch(() => {});
    loadWallet();
  }, [location?.latitude, location?.longitude, loadWallet]);

  // Active Category & Subcategories
  const activeCategoryObj = useMemo(() => {
    if (!selectedCat) return categories[0] || null;
    return categories.find((c) => (c.category_id || c.id || '').toString() === selectedCat) || null;
  }, [categories, selectedCat]);

  // Fetch Providers List with direct API radius parameter & user_id for unlocked status
  const fetchProvidersList = async (pageNum: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await getProviders({
        category_id: selectedCat ? parseInt(selectedCat) : null,
        sub_category_id: selectedSubCat ? parseInt(selectedSubCat) : null,
        min_radius: selectedDistanceSlab.min,
        radius: selectedDistanceSlab.max,
        lat: location?.latitude || 27.1767,
        lng: location?.longitude || 78.0081,
        search: searchTerm.trim() || undefined,
        page: pageNum,
        user_id: user?.id || null,
      });

      if (res.data?.data) {
        let list: any[] = [];
        let total = 0;
        let lastP = 1;

        if (Array.isArray(res.data.data)) {
          list = res.data.data;
          total = list.length;
          lastP = 1;
        } else if (res.data.data.data && Array.isArray(res.data.data.data)) {
          list = res.data.data.data;
          total = res.data.data.total || list.length;
          lastP = res.data.data.last_page || 1;
        }

        if (append) {
          setProviders((prev) => [...prev, ...list]);
        } else {
          setProviders(list);
        }

        setTotalRecords(total);
        setLastPage(lastP);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("Error fetching providers:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProvidersList(1, false);
  }, [selectedCat, selectedSubCat, selectedDistanceSlab, searchTerm, location?.latitude, location?.longitude, user?.id]);

  const handleLoadMore = () => {
    if (page < lastPage && !loadingMore) {
      fetchProvidersList(page + 1, true);
    }
  };

  // Haversine distance calculation in KM
  const getNumericDistance = (prov: any): number => {
    if (prov.distance !== undefined && prov.distance !== null && prov.distance !== '') {
      const num = Number(prov.distance);
      if (!isNaN(num)) return num;
    }

    const provLat = Number(prov.latitude || prov.lat);
    const provLng = Number(prov.longitude || prov.lng);
    if (location?.latitude && location?.longitude && !isNaN(provLat) && !isNaN(provLng) && provLat !== 0 && provLng !== 0) {
      const R = 6371; // Earth radius in km
      const dLat = ((provLat - location.latitude) * Math.PI) / 180;
      const dLng = ((provLng - location.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((location.latitude * Math.PI) / 180) *
          Math.cos((provLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    return 0;
  };

  const getProviderDistance = (prov: any): string | null => {
    const dist = getNumericDistance(prov);
    if (dist > 0) {
      return `${dist.toFixed(1)} km`;
    }
    return null;
  };

  const getProviderImage = (p: any) => {
    const src = p.icon_url || p.banner_image || p.image || p.logo || p.banner;
    if (!src || typeof src !== 'string') return 'https://cdn-icons-png.flaticon.com/512/869/869636.png';
    if (src.startsWith('http')) return src;
    return `${IMAGE_BASE_URL}storage/provider/${src.replace(/^\//, '')}`;
  };

  const maskPhone = (phone?: any) => {
    if (!phone) return '976*******';
    const str = phone.toString();
    if (str.length >= 6) {
      return `${str.slice(0, 3)}*******`;
    }
    return '976*******';
  };

  const formatTime = (timeStr?: any, defaultFallback: string = "9:00 AM") => {
    if (!timeStr || typeof timeStr !== 'string') return defaultFallback;
    if (timeStr.includes('-') || timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    const parts = timeStr.split(":");
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours}:${minutes} ${ampm}`;
  };

  // Filter providers locally by distance and searchTerm
  const displayedProviders = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return providers.filter((p) => {
      // 1. Distance Filter
      const dist = getNumericDistance(p);
      if (dist > 0) {
        if (selectedDistanceSlab.min > 0 && dist < selectedDistanceSlab.min) return false;
        if (selectedDistanceSlab.max > 0 && dist > selectedDistanceSlab.max) return false;
      }

      // 2. Search Term Filter
      if (!term) return true;
      const bName = (p.business_name || p.provider_name || p.name || '').toLowerCase();
      const sName = (p.service_name || p.category_name || p.sub_category_name || '').toLowerCase();
      const tags = (p.keywords || p.tags || p.tag || p.services || '').toLowerCase();
      const desc = (p.description || p.about || '').toLowerCase();
      const address = (p.address || p.city || p.location || '').toLowerCase();

      return (
        bName.includes(term) ||
        sName.includes(term) ||
        tags.includes(term) ||
        desc.includes(term) ||
        address.includes(term)
      );
    });
  }, [providers, searchTerm, selectedDistanceSlab, location]);

  // Handle Unlock Provider Contact Directly
  const handleUnlock = async (e: React.MouseEvent, providerId: number, price: number = 5) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/auth/login');
      return;
    }

    if (walletBalance < price) {
      setUnlockMessage(`Insufficient wallet balance! Please add ₹${price - walletBalance} to unlock this contact.`);
      setTimeout(() => setUnlockMessage(null), 5000);
      return;
    }

    setUnlockingId(providerId);
    try {
      const res = await unlockProvider({
        user_id: user.id,
        provider_id: providerId,
        amount: price,
      });

      if (res.data?.status === 'success' || res.data?.status === true || res.data?.message?.includes('success') || res.data?.message?.includes('Unlocked') || res.data?.success) {
        setUnlockMessage('🎉 Contact unlocked successfully!');
        setProviders((prev) =>
          prev.map((p) => {
            const currentId = p.provider_id || p.id;
            if (currentId === providerId) {
              return { ...p, is_unlocked: 1, unlocked: true };
            }
            return p;
          })
        );
        setWalletBalance((prev) => Math.max(0, prev - price));
        loadWallet();
        refreshProfile();
      } else {
        setUnlockMessage(res.data?.message || 'Could not unlock contact. Please try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Transaction failed. Please check wallet balance.';
      setUnlockMessage(msg);
    } finally {
      setUnlockingId(null);
      setTimeout(() => setUnlockMessage(null), 4000);
    }
  };

  const rangeLabel = selectedDistanceSlab.label;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header without Global Search Bar */}
      <Header categories={categories} />

      <main className="max-w-4xl mx-auto px-3 py-3 space-y-3">
        {/* Top Back Navigation & Wallet Header Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition flex items-center gap-1.5"
              title={t('back')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold">{t('back')}</span>
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {activeCategoryObj ? localize(activeCategoryObj.name) : t('searchServices')}
            </span>
          </div>
          <button
            onClick={() => navigate('/wallet')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-sm flex items-center gap-1 active:scale-95 transition"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>₹{walletBalance}</span>
          </button>
        </div>

        {/* 🔍 1. CATEGORY-SPECIFIC IN-PAGE SEARCH BAR (Standalone without box) */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400" />
          <input
            type="text"
            placeholder={
              activeCategoryObj
                ? `Search in ${localize(activeCategoryObj.name)} (by name, tags, services)...`
                : `Search providers, business name, or tags...`
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Active search filter badge */}
        {searchTerm.trim() && (
          <div className="flex items-center justify-between px-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            <span className="flex items-center gap-1 truncate">
              <Tag className="w-3 h-3 shrink-0" />
              <span>Searching: "{searchTerm}" {activeCategoryObj ? `in ${localize(activeCategoryObj.name)}` : ''}</span>
            </span>
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-rose-500 hover:underline shrink-0 ml-2 font-semibold"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* 2. SELECT DISTANCE RANGE Section with Colorful Buttons (Max 10 KM) */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2">
          <span className="text-[11px] font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider block">
            {t('filterByDistance')} (Max 10 KM)
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {DISTANCE_SLABS.map((chip) => {
              const isSelected = selectedDistanceSlab.label === chip.label;
              return (
                <button
                  key={chip.label}
                  onClick={() => setSelectedDistanceSlab(chip)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition active:scale-95 border ${
                    isSelected ? `${chip.active} border-transparent font-semibold` : chip.inactive
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. SELECTED CATEGORY & SUBCATEGORIES Section */}
        {activeCategoryObj && (
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 via-purple-50 to-white dark:from-slate-800 dark:to-slate-900 border border-violet-200/80 dark:border-slate-700 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                  {activeCategoryObj.icon_url ? (
                    <img src={activeCategoryObj.icon_url} alt={activeCategoryObj.name} className="w-full h-full object-contain" />
                  ) : (
                    <Folder className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    {localize(activeCategoryObj.name)}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-normal block">{t('categories')}</span>
                </div>
              </div>

              <Link
                to="/categories"
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t('edit')}
              </Link>
            </div>

            {/* Subcategories Horizontal Slider */}
            {activeCategoryObj.sub_categories && activeCategoryObj.sub_categories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-purple-100 dark:border-slate-800/60">
                <button
                  onClick={() => setSelectedSubCat('')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition ${
                    selectedSubCat === ''
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold'
                      : 'bg-purple-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t('all')} {t('subcategories')}
                </button>
                {activeCategoryObj.sub_categories.map((sub: any, idx: number) => {
                  const subId = (sub.sub_category_id || sub.id || '').toString();
                  const isSelected = selectedSubCat === subId;

                  return (
                    <button
                      key={subId || idx}
                      onClick={() => setSelectedSubCat(isSelected ? '' : subId)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-semibold'
                          : 'bg-purple-50 dark:bg-slate-800/80 border-purple-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {sub.icon_url && <img src={sub.icon_url} alt={sub.name} className="w-3.5 h-3.5 object-contain" />}
                      <span>{localize(sub.name)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. Unlock Alert Notification */}
        {unlockMessage && (
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium flex items-center justify-between shadow-sm">
            <span>{unlockMessage}</span>
            {unlockMessage.includes('add money') && (
              <button
                onClick={() => navigate('/wallet')}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs"
              >
                {t('addCredits')}
              </button>
            )}
          </div>
        )}

        {/* 5. SERVICE PROVIDERS LIST HEADER */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {t('serviceProviders')} ({rangeLabel})
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
            {displayedProviders.length} Results
          </span>
        </div>

        {/* 6. SERVICE PROVIDERS LIST CARDS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('pleaseWait')}</p>
          </div>
        ) : displayedProviders.length > 0 ? (
          <div className="space-y-3">
            {displayedProviders.map((prov, idx) => {
              const provId = prov.provider_id || prov.id;
              const isUnlocked = prov.is_unlocked === 1 || prov.is_unlocked === true || prov.unlocked === true || false;
              const isVerified = prov.is_verified === 1 || prov.verified;
              const theme = PROVIDER_CARD_THEMES[idx % PROVIDER_CARD_THEMES.length];

              return (
                <Link
                  key={provId ? `prov-${provId}-${idx}` : `prov-idx-${idx}`}
                  to={`/providers/${provId}`}
                  className={`${theme.bg} p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl border ${theme.border} shadow-2xs hover:shadow-xs ${theme.hoverBorder} transition group relative overflow-hidden block space-y-2.5`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bar} rounded-r-md`} />

                  {/* Top Row: Thumbnail on Left + Details on Right */}
                  <div className="flex gap-3 items-start pl-1">
                    {/* Provider Real Image Thumbnail */}
                    <div className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border ${theme.imgBg} shrink-0 flex items-center justify-center p-1 shadow-2xs`}>
                      <img
                        src={getProviderImage(prov)}
                        alt={prov.business_name || prov.name}
                        className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute(
                            'src',
                            'https://cdn-icons-png.flaticon.com/512/869/869636.png'
                          );
                        }}
                      />
                      {isVerified && (
                        <span className="absolute bottom-1 inset-x-1 py-0.5 rounded-md bg-emerald-600 text-white text-[8px] font-semibold flex items-center justify-center gap-0.5 shadow-xs">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{t('verified')} ✓</span>
                        </span>
                      )}
                    </div>

                    {/* Provider Details Content */}
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition leading-snug">
                        {prov.business_name || prov.name}
                      </h3>

                      {/* Category & Subcategory */}
                      <div className={`text-[11.5px] ${theme.catColor} font-medium flex items-center gap-1 line-clamp-1`}>
                        <span>
                          📁 {localize(prov.category_name || (typeof prov.category === 'object' ? prov.category?.name : prov.category) || t('serviceProviders'))}
                          {prov.sub_category_name ? ` • ${localize(prov.sub_category_name)}` : ''}
                        </span>
                      </div>

                      {/* Working Hours */}
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                        {prov.is_24x7_available === 1 ? (
                          <span className="inline-block px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[10px] font-medium">
                            🟢 24 {t('openNow')}
                          </span>
                        ) : (
                          <span>
                            🕒 {prov.working_from || prov.opening_time ? `${formatTime(prov.working_from || prov.opening_time, "9:00 AM")} - ${formatTime(prov.working_to || prov.closing_time, "9:00 PM")}` : "9:00 AM - 9:00 PM"}
                          </span>
                        )}
                      </div>

                      {/* Address & Calculated Distance */}
                      {(prov.address || prov.city) && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 line-clamp-1 pt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{prov.address || prov.city}</span>
                          {getProviderDistance(prov) && (
                            <span className={`${theme.catColor} font-medium ml-1 shrink-0`}>
                              ({getProviderDistance(prov)})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Full-Width Bottom Action Bar */}
                  <div className={`pt-2 pl-1 border-t ${theme.divider} flex items-center justify-between gap-2`}>
                    {/* Left: Mobile Phone Number */}
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <Phone className={`w-3.5 h-3.5 ${isUnlocked ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`} />
                      <span className={isUnlocked ? 'text-emerald-700 dark:text-emerald-400 font-semibold tracking-wide text-xs sm:text-sm' : 'text-slate-600 dark:text-slate-400'}>
                        {isUnlocked ? prov.phone : maskPhone(prov.phone)}
                      </span>
                    </div>

                    {/* Right: Unlock Button or Call / WhatsApp Icons */}
                    {!isUnlocked ? (
                      <button
                        type="button"
                        disabled={unlockingId === provId}
                        onClick={(e) => handleUnlock(e, provId, Number(prov.price || 5))}
                        className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 active:scale-95 transition shrink-0 disabled:opacity-75"
                      >
                        {unlockingId === provId ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Unlocking...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Unlock {prov.price || 5}</span>
                            <span>🪙</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${prov.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          title={t('call')}
                          className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xs active:scale-95 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        <a
                          href={`https://wa.me/${prov.phone?.toString().startsWith('91') ? prov.phone : `91${prov.phone}`}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={t('whatsapp')}
                          className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs active:scale-95 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}

            {/* Load More Button */}
            {page < lastPage && (
              <div className="pt-2 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="py-2.5 px-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs shadow-sm hover:bg-slate-50 transition"
                >
                  {loadingMore ? t('loading') : t('viewAll')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-3xl space-y-3 border border-slate-200 dark:border-slate-800 shadow-sm">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {searchTerm ? `No providers matching "${searchTerm}"` : t('noProvidersFound')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchTerm
                ? 'Try searching with another keyword, service name, or clear the search filter.'
                : t('trySearching')}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default ProvidersPage;
