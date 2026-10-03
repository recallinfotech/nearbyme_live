import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { getNearbyEvents, getEventCategories, IMAGE_BASE_URL } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar,
  Plus,
  MapPin,
  RefreshCw,
  Briefcase,
  ShoppingBag,
  Home,
  Sparkles,
  Tag,
  Clock,
  Eye,
  Wallet,
  Building,
  CheckCircle2,
  Lock,
  Phone,
  MessageSquare,
  Search,
  Filter
} from 'lucide-react';

type ListingType = 'all' | 'job' | 'item_sale' | 'rental' | 'event';

const DISTANCE_SLABS = [
  { min: 0, max: 2, label: '0 - 2 KM', active: 'bg-sky-600 text-white shadow-xs', inactive: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-900/40 hover:bg-sky-100' },
  { min: 2, max: 4, label: '2 - 4 KM', active: 'bg-emerald-600 text-white shadow-xs', inactive: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/40 hover:bg-emerald-100' },
  { min: 4, max: 6, label: '4 - 6 KM', active: 'bg-amber-600 text-white shadow-xs', inactive: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/40 hover:bg-amber-100' },
  { min: 6, max: 8, label: '6 - 8 KM', active: 'bg-rose-600 text-white shadow-xs', inactive: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/40 hover:bg-rose-100' },
  { min: 8, max: 10, label: '8 - 10 KM', active: 'bg-purple-600 text-white shadow-xs', inactive: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-900/40 hover:bg-purple-100' },
  { min: 0, max: 50, label: 'All (Nearby)', active: 'bg-indigo-600 text-white shadow-xs', inactive: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-900/40 hover:bg-indigo-100' },
];

export const EventsPage: React.FC = () => {
  const { location } = useLocation();
  const { user } = useAuth();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlType = searchParams.get('type') as ListingType | null;

  const [activeTab, setActiveTab] = useState<ListingType>(
    urlType && ['all', 'job', 'item_sale', 'rental', 'event'].includes(urlType) ? urlType : 'all'
  );
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDistanceSlab, setSelectedDistanceSlab] = useState<{ min: number; max: number; label: string }>(DISTANCE_SLABS[5]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Keep activeTab in sync if URL query parameter changes
  useEffect(() => {
    if (urlType && ['all', 'job', 'item_sale', 'rental', 'event'].includes(urlType)) {
      setActiveTab(urlType);
    } else if (!urlType) {
      setActiveTab('all');
    }
  }, [urlType]);

  // Listing Category Tabs
  const typeTabs: { id: ListingType; label: string; icon: any; color: string; bg: string }[] = [
    { id: 'all', label: t('allListings'), icon: Sparkles, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500' },
    { id: 'job', label: t('jobs'), icon: Briefcase, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500' },
    { id: 'item_sale', label: t('buySell'), icon: ShoppingBag, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' },
    { id: 'rental', label: t('rentals'), icon: Home, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' },
    { id: 'event', label: t('communityEvents'), icon: Calendar, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500' },
  ];

  const fetchEventsData = async () => {
    setLoading(true);
    try {
      const [catsRes, eventsRes] = await Promise.all([
        getEventCategories(activeTab !== 'all' ? { type: activeTab } : undefined).catch(() => ({ data: { data: [] } })),
        getNearbyEvents({
          latitude: location?.latitude || 27.1767,
          longitude: location?.longitude || 78.0081,
          category_id: selectedCategory || null,
          listing_type: activeTab === 'all' ? null : activeTab,
          min_radius: selectedDistanceSlab.min,
          radius: selectedDistanceSlab.max,
          search: searchTerm,
          user_id: user?.id || null,
        }).catch(() => ({ data: { data: [] } })),
      ]);

      if (catsRes.data?.data) {
        setCategories(catsRes.data.data);
      }
      if (eventsRes.data?.data) {
        const rawEvents = Array.isArray(eventsRes.data.data) ? eventsRes.data.data : [];
        setEvents(rawEvents);
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedCategory('');
  }, [activeTab]);

  useEffect(() => {
    fetchEventsData();
  }, [location, activeTab, selectedCategory, selectedDistanceSlab, searchTerm, user?.id]);

  const getListingImage = (item: any) => {
    if (item.image) {
      if (typeof item.image === 'string' && item.image.startsWith('http')) return item.image;
      return `${IMAGE_BASE_URL}storage/events/${item.image.replace(/^\//, '')}`;
    }
    switch (item.listing_type) {
      case 'job':
        return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=60';
      case 'item_sale':
        return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60';
      case 'rental':
        return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=60';
      default:
        return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=60';
    }
  };

  const getListingBadgeInfo = (item: any) => {
    switch (item.listing_type) {
      case 'job':
        return {
          tag: item.job_salary ? `₹${item.job_salary}` : 'Job Vacancy',
          subTag: item.job_type || 'Full-time',
          bg: 'bg-gradient-to-r from-sky-600 to-indigo-600',
          typeText: t('jobs'),
          badgeColor: 'text-sky-400'
        };
      case 'item_sale':
        return {
          tag: item.item_price ? `₹${item.item_price}` : 'For Sale',
          subTag: item.item_condition || 'Used',
          bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
          typeText: t('buySell'),
          badgeColor: 'text-amber-400'
        };
      case 'rental':
        return {
          tag: item.rental_price ? `₹${item.rental_price}/mo` : 'For Rent',
          subTag: item.rental_type || 'Rental',
          bg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
          typeText: t('rentals'),
          badgeColor: 'text-emerald-400'
        };
      default:
        return {
          tag: item.entry_fee && Number(item.entry_fee) > 0 ? `₹${item.entry_fee}` : t('freeEntry'),
          subTag: item.event_date || 'Upcoming',
          bg: 'bg-gradient-to-r from-rose-600 to-purple-600',
          typeText: t('communityEvents'),
          badgeColor: 'text-rose-400'
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 space-y-2.5">
        {/* Top Header Bar (Single Line with Compact Actions) */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight whitespace-nowrap shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-amber-500 shrink-0" />
            <span>{t('nearbyEvents')}</span>
          </h1>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to="/my-listings"
              className="py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1 shadow-2xs active:scale-95 transition"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>My Ads</span>
            </Link>

            <Link
              to="/events/add"
              className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-semibold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post</span>
            </Link>
          </div>
        </div>

        {/* Type Filter Tabs Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {typeTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition active:scale-95 shadow-2xs ${
                  isSelected
                    ? `${tab.bg} text-white shadow-xs`
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Distance Range Filter Slabs */}
        <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {t('filterByDistance')} ({selectedDistanceSlab.label})
            </span>
            {selectedDistanceSlab.label !== 'All (Nearby)' && (
              <button
                onClick={() => setSelectedDistanceSlab(DISTANCE_SLABS[5])}
                className="text-[10px] text-rose-500 hover:underline font-semibold"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {DISTANCE_SLABS.map((chip) => {
              const isSelected = selectedDistanceSlab.label === chip.label;
              return (
                <button
                  key={chip.label}
                  onClick={() => setSelectedDistanceSlab(chip)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition active:scale-95 border ${
                    isSelected ? `${chip.active} border-transparent font-semibold` : chip.inactive
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Category Pills Filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition ${
                selectedCategory === ''
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {t('all')}
            </button>
            {categories.map((c: any) => {
              const cId = String(c.id);
              const isSelected = selectedCategory === cId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(isSelected ? '' : cId)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold shrink-0 transition border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {localize(c.name)}
                </button>
              );
            })}
          </div>
        )}

        {/* Listings Feed Cards Grid */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-9 h-9 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('pleaseWait')}
            </p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
            {events.map((ev: any) => {
              const eventId = ev.id || ev.event_id;
              const badge = getListingBadgeInfo(ev);
              const isUnlocked = ev.is_unlocked || ev.is_owner;

              return (
                <Link
                  key={eventId}
                  to={`/events/${eventId}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/50 transition flex flex-col justify-between group cursor-pointer relative"
                >
                  <div>
                    {/* Media Thumbnail - 1:1 Square Ratio to prevent cutting */}
                    <div className="w-full aspect-square bg-slate-950 overflow-hidden relative">
                      <img
                        src={getListingImage(ev)}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute(
                            'src',
                            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=60'
                          );
                        }}
                      />

                      {/* Top Gradient Badge */}
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-white text-[9px] sm:text-[10px] font-medium shadow-md flex items-center gap-1 backdrop-blur-md bg-slate-950/75 border border-white/20">
                        <span className={badge.badgeColor}>●</span>
                        <span className="truncate max-w-[80px] sm:max-w-none">{badge.typeText}</span>
                      </div>

                      {/* Price / Salary / Date Tag Pill */}
                      <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-white text-[9px] sm:text-xs font-semibold shadow-lg ${badge.bg}`}>
                        {badge.tag}
                      </div>

                      {/* Sub-Tag Badge (e.g. Full-time, Like New, 2 BHK, etc.) */}
                      {badge.subTag && (
                        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md bg-slate-950/80 text-white text-[9px] sm:text-[10px] font-medium border border-white/20 backdrop-blur-md truncate max-w-[90px] sm:max-w-none">
                          {badge.subTag}
                        </div>
                      )}

                      {/* Views Count */}
                      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md bg-slate-950/80 text-slate-300 text-[9px] sm:text-[10px] font-medium border border-white/10 flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                        <span>{ev.views || 0}</span>
                      </div>
                    </div>

                    {/* Listing Content Details */}
                    <div className="p-2.5 sm:p-3.5 space-y-1 sm:space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] sm:text-[10px] font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider block truncate">
                          📁 {localize(ev.category_name || badge.typeText)}
                        </span>
                        {ev.company_name && (
                          <span className="text-[9px] sm:text-[10px] font-normal text-slate-500 dark:text-slate-400 truncate">
                            🏢 {ev.company_name}
                          </span>
                        )}
                        {ev.item_brand_model && (
                          <span className="text-[9px] sm:text-[10px] font-normal text-amber-600 dark:text-amber-400 truncate">
                            🏷️ {ev.item_brand_model}
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug">
                        {ev.title}
                      </h3>

                      {ev.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {ev.description}
                        </p>
                      )}

                      {/* Location & Date Footnotes */}
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1 truncate text-slate-600 dark:text-slate-300 font-medium">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span className="truncate">{ev.address || ev.city || 'Nearby'}</span>
                        </div>
                        <strong className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-1 font-extrabold text-[10px] sm:text-[11px]">
                          {typeof ev.distance === 'number' ? `${ev.distance.toFixed(1)} km` : (ev.distance || 'Near you')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Contact Bar */}
                  <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] sm:text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1 truncate">
                      {isUnlocked ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">📞 {ev.contact_number || 'Available'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">📞 {ev.masked_phone || '98765XXXXX'}</span>
                        </>
                      )}
                    </span>

                    <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-semibold text-center shrink-0 ${
                      isUnlocked
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-indigo-600 text-white shadow-2xs'
                    }`}>
                      {isUnlocked ? '✓' : `Unlock ${ev.unlock_price || 5} 🪙`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('noDataFound')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('trySearching')}
            </p>
            <Link
              to="/events/add"
              className="inline-block mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-md"
            >
              + {t('postListing')}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};
export default EventsPage;
