import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Header } from '../components/layout/Header';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';
import { getCombinedCategories, getBanners, getNearbyEvents, IMAGE_BASE_URL } from '../services/api';
import { Sparkles, Grid, ArrowRight, Calendar, MapPin, Layers, Search, AlertCircle, RefreshCw, Building2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_ICON_THEMES = [
  'bg-gradient-to-br from-indigo-50 to-blue-100/70 dark:from-indigo-950/40 dark:to-slate-800 border-indigo-200/80 dark:border-indigo-900/40',
  'bg-gradient-to-br from-emerald-50 to-teal-100/70 dark:from-emerald-950/40 dark:to-slate-800 border-emerald-200/80 dark:border-emerald-900/40',
  'bg-gradient-to-br from-amber-50 to-orange-100/70 dark:from-amber-950/40 dark:to-slate-800 border-amber-200/80 dark:border-amber-900/40',
  'bg-gradient-to-br from-rose-50 to-pink-100/70 dark:from-rose-950/40 dark:to-slate-800 border-rose-200/80 dark:border-rose-900/40',
  'bg-gradient-to-br from-purple-50 to-fuchsia-100/70 dark:from-purple-950/40 dark:to-slate-800 border-purple-200/80 dark:border-purple-900/40',
  'bg-gradient-to-br from-cyan-50 to-sky-100/70 dark:from-cyan-950/40 dark:to-slate-800 border-cyan-200/80 dark:border-cyan-900/40',
  'bg-gradient-to-br from-lime-50 to-emerald-100/70 dark:from-lime-950/40 dark:to-slate-800 border-lime-200/80 dark:border-lime-900/40',
  'bg-gradient-to-br from-violet-50 to-indigo-100/70 dark:from-violet-950/40 dark:to-slate-800 border-violet-200/80 dark:border-violet-900/40',
  'bg-gradient-to-br from-fuchsia-50 to-pink-100/70 dark:from-fuchsia-950/40 dark:to-slate-800 border-fuchsia-200/80 dark:border-fuchsia-900/40',
  'bg-gradient-to-br from-teal-50 to-cyan-100/70 dark:from-teal-950/40 dark:to-slate-800 border-teal-200/80 dark:border-teal-900/40',
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const { t, localize } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleNextBanner = useCallback(() => {
    if (banners.length <= 1) return;
    setSlideDirection(1);
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const handlePrevBanner = useCallback(() => {
    if (banners.length <= 1) return;
    setSlideDirection(-1);
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX > 0) {
        handleNextBanner();
      } else {
        handlePrevBanner();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [bannersRes, catRes] = await Promise.all([
          getBanners().catch(() => ({ data: { data: [] } })),
          getCombinedCategories({ lat: location?.latitude, lng: location?.longitude }).catch(() => ({ data: { data: [] } }))
        ]);

        if (bannersRes.data?.data) setBanners(bannersRes.data.data);
        if (catRes.data?.data) setCategories(catRes.data.data);

        // Fetch Nearby Events
        const lat = location?.latitude || 27.1767;
        const lng = location?.longitude || 78.0081;
        const eventsRes = await getNearbyEvents({
          latitude: lat,
          longitude: lng,
          radius: 50,
        }).catch(() => ({ data: { data: [] } }));

        if (eventsRes.data?.data) {
          const rawEvents = Array.isArray(eventsRes.data.data) ? eventsRes.data.data : [];
          setEvents(rawEvents);
        }
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [location]);

  const getBannerImageUrl = (b: any) => {
    if (b.full_image_url) return b.full_image_url;
    if (b.image_url) return b.image_url;
    if (b.banner_url) return b.banner_url;
    if (b.image) {
      if (typeof b.image === 'string' && b.image.startsWith('http')) return b.image;
      return `${IMAGE_BASE_URL}storage/banners/${b.image}`;
    }
    return 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=60';
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      handleNextBanner();
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length, currentBannerIndex, handleNextBanner]);

  // Combined Categories Search Logic
  const filteredCategoriesResult = useMemo(() => {
    if (!searchTerm.trim()) return { categories: categories.slice(0, 16), subCategories: [] };
    const term = searchTerm.toLowerCase().trim();

    const matchedCats: any[] = [];
    const matchedSubs: any[] = [];

    categories.forEach((cat) => {
      const catName = cat.name || '';
      const catId = cat.category_id || cat.id;

      if (catName.toLowerCase().includes(term)) {
        matchedCats.push(cat);
      }

      if (cat.sub_categories && Array.isArray(cat.sub_categories)) {
        cat.sub_categories.forEach((sub: any) => {
          if (sub.name?.toLowerCase().includes(term)) {
            matchedSubs.push({
              ...sub,
              parent_category_name: catName,
              parent_category_id: catId,
            });
          }
        });
      }
    });

    return { categories: matchedCats, subCategories: matchedSubs };
  }, [categories, searchTerm]);

  // Helper for Distance formatting
  const formatEventDistance = (ev: any) => {
    if (ev.distance !== undefined && ev.distance !== null) {
      return typeof ev.distance === 'number' ? `${ev.distance.toFixed(1)} ${t('kmAway')}` : `${ev.distance} ${t('kmAway')}`;
    }
    return `0.1 ${t('kmAway')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} categories={categories} />

      <main className="max-w-7xl mx-auto px-4 py-2.5 space-y-4">
        {/* Loading Indicator for Initial App Fetch */}
        {loading && (
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t('pleaseWait')}</span>
          </div>
        )}

        {/* 1. Banner Section (Top) */}
        {banners.length > 0 ? (
          <div className="space-y-2 select-none">
            <div
              className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-slate-900/10 dark:bg-slate-900 transition-all"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence initial={false} mode="wait" custom={slideDirection}>
                <motion.div
                  key={currentBannerIndex}
                  custom={slideDirection}
                  initial={{ opacity: 0, x: slideDirection > 0 ? 60 : -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: slideDirection > 0 ? -60 : 60 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, { offset }) => {
                    if (offset.x < -35) {
                      handleNextBanner();
                    } else if (offset.x > 35) {
                      handlePrevBanner();
                    }
                  }}
                  className="w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                  <img
                    src={getBannerImageUrl(banners[currentBannerIndex])}
                    alt={`Banner ${currentBannerIndex + 1}`}
                    className="w-full h-auto object-contain rounded-2xl sm:rounded-3xl pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute(
                        'src',
                        'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=60'
                      );
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrow Controls */}
              {banners.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous Banner"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevBanner();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition active:scale-90 z-20 opacity-70 hover:opacity-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next Banner"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextBanner();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition active:scale-90 z-20 opacity-70 hover:opacity-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Slider Dots Indicator Below Banner */}
            {banners.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-0.5 pb-0.5">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to slide ${idx + 1}`}
                    onClick={() => {
                      setSlideDirection(idx > currentBannerIndex ? 1 : -1);
                      setCurrentBannerIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentBannerIndex
                        ? 'w-5 bg-indigo-600 dark:bg-indigo-500 shadow-xs'
                        : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-950/80 to-slate-900 p-5 border border-indigo-500/30 shadow-xl">
            <div className="max-w-md space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                {t('findServicesTitle')}
              </h1>
              <p className="text-xs text-slate-300">
                {t('findServicesSubtitle')}
              </p>
            </div>
          </div>
        )}

        {/* 2. Upcoming Nearby Events (Second - Horizontal Slider) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('nearbyEvents')}</span>
            </h2>
            <Link to="/events" className="text-xs font-bold text-amber-600 dark:text-amber-500 hover:underline flex items-center gap-1.5">
              <span>{t('viewAll')}</span>
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px] sm:text-xs">
                &rarr;
              </div>
            </Link>
          </div>

          {/* Events Horizontal Slider */}
          {events.length > 0 ? (
            <div className="flex snap-x snap-mandatory overflow-x-auto gap-2.5 sm:gap-3.5 no-scrollbar pb-0 pt-0.5">
              {events.map((ev: any) => {
                const eventId = ev.id || ev.event_id;
                return (
                  <Link
                    key={eventId}
                    to={`/events/${eventId}`}
                    className="w-[calc((100%-0.75rem)/2.3)] sm:w-48 md:w-52 shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md dark:shadow-xl hover:border-amber-500/50 transition group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Event Image Banner */}
                      <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                        <img
                          src={ev.image || ev.full_image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&auto=format&fit=crop&q=60'}
                          alt={ev.title || ev.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-400 text-[9px] font-bold border border-amber-500/30 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 shrink-0 text-amber-400" />
                          <span className="line-clamp-1">{ev.event_date ? String(ev.event_date).split(' ')[0] : t('events')}</span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="p-2 sm:p-2.5 space-y-0.5">
                        <span className="text-[9px] font-semibold uppercase text-amber-600 dark:text-amber-500 tracking-wider block line-clamp-1">
                          {localize(ev.category_name || ev.category?.name || t('events'))}
                        </span>

                        <h3 className="text-slate-900 dark:text-white font-semibold text-xs line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                          {ev.title || ev.name}
                        </h3>

                        <div className="text-slate-500 dark:text-slate-400 text-[10px] font-normal flex items-center gap-1 pt-0.5">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span className="line-clamp-1">{formatEventDistance(ev)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-4 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              {t('noEventsFound')}
            </div>
          )}
        </section>

        {/* 3. Explore Categories & Search Results Section */}
        <section className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Grid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{searchTerm ? `${t('search')}: "${searchTerm}"` : t('exploreCategories')}</span>
            </h2>
            <Link to="/categories" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <span>{t('viewAll')} ({categories.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Search Sub-Categories Results */}
          {searchTerm && filteredCategoriesResult.subCategories.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                {t('subcategories')} ({filteredCategoriesResult.subCategories.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {filteredCategoriesResult.subCategories.map((sub: any, idx: number) => {
                  const subId = sub.sub_category_id || sub.id;
                  const parentId = sub.parent_category_id;
                  const iconUrl = sub.icon_url || sub.icon;
                  const subTheme = CATEGORY_ICON_THEMES[idx % CATEGORY_ICON_THEMES.length];

                  return (
                    <Link
                      key={subId || idx}
                      to={`/providers?category_id=${parentId}&sub_category_id=${subId}`}
                      className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl flex items-center gap-2.5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 shadow-sm transition group"
                    >
                      <div className={`w-9 h-9 rounded-xl ${subTheme} border flex items-center justify-center shrink-0 overflow-hidden shadow-2xs p-1.5`}>
                        {iconUrl ? (
                          <img src={iconUrl} alt={sub.name} className="w-full h-full object-contain" />
                        ) : (
                          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 line-clamp-1">
                          {localize(sub.name)}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {localize(sub.parent_category_name)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Categories Grid */}
          {filteredCategoriesResult.categories.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 sm:gap-4">
              {filteredCategoriesResult.categories.map((cat: any, idx: number) => {
                const catId = cat.category_id || cat.id;
                const iconUrl = cat.icon_url || cat.icon || cat.image;
                const iconTheme = CATEGORY_ICON_THEMES[idx % CATEGORY_ICON_THEMES.length];

                return (
                  <Link
                    key={catId || idx}
                    to={`/providers?category_id=${catId}`}
                    className="flex flex-col items-center text-center gap-1.5 group cursor-pointer active:scale-95 transition-transform"
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${iconTheme} border shadow-2xs flex items-center justify-center p-2.5 group-hover:scale-105 group-hover:shadow-xs transition-all duration-300 overflow-hidden`}>
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={cat.name}
                          className="w-full h-full object-contain filter drop-shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Grid className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <span className="text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-tight line-clamp-2 w-full transition-colors">
                      {localize(cat.name)}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            searchTerm && filteredCategoriesResult.subCategories.length === 0 && (
              <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-300">
                  {t('noCategoriesFound')} "{searchTerm}"
                </p>
                <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  {t('trySearching')}
                </p>
              </div>
            )
          )}
        </section>

        {/* 🏬 List Your Business Promotional Card */}
        <section className="pt-2">
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-md">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base">Grow Your Business Locally</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400 text-slate-900 shadow-sm">
                    Free
                  </span>
                </div>
                <p className="text-xs text-indigo-100 font-normal mt-0.5">
                  List your shop, clinic, or service firm on NearbyMe & reach thousands of local customers!
                </p>
              </div>
            </div>

            <div className="z-10 shrink-0">
              <button
                onClick={() => navigate('/partner/add-business')}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-white text-indigo-700 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ List Business Free</span>
              </button>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          </div>
        </section>
      </main>
    </div>
  );
};
