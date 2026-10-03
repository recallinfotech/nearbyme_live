import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getMyEvents, getEventUnlockLeads, updateEvent, deleteEvent, toggleEventStatus, getEventCategories, IMAGE_BASE_URL } from '../services/api';
import {
  ArrowLeft,
  Briefcase,
  ShoppingBag,
  Home,
  Calendar,
  Sparkles,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Users,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
  DollarSign,
  ChevronRight,
  TrendingUp,
  Award,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

type ListingType = 'all' | 'job' | 'item_sale' | 'rental' | 'event';

// Indian Date Formatter
const formatIndianDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    const isoString = dateString.replace(' ', 'T');
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  } catch {
    return dateString;
  }
};

export const MyListingsPage: React.FC = () => {
  const { user } = useAuth();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTypeTab, setActiveTypeTab] = useState<ListingType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'expired'>('all');

  // Leads Modal State
  const [leadsModalOpen, setLeadsModalOpen] = useState<boolean>(false);
  const [selectedListingForLeads, setSelectedListingForLeads] = useState<any | null>(null);
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState<boolean>(false);

  // Action states
  const [toggleLoadingId, setToggleLoadingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Fetch My Listings
  const fetchListings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await getMyEvents(user.id);
      if (res.data?.data) {
        setListings(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error('Error fetching my listings:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Overall Metrics
  const stats = useMemo(() => {
    const total = listings.length;
    const active = listings.filter((item) => !item.is_expired && Number(item.is_running) === 1).length;
    const paused = listings.filter((item) => !item.is_expired && Number(item.is_running) === 0).length;
    const totalLeads = listings.reduce((acc, curr) => acc + (Number(curr.unlock_count) || 0), 0);
    return { total, active, paused, totalLeads };
  }, [listings]);

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.company_name || '').toLowerCase().includes(q) ||
        (item.address || '').toLowerCase().includes(q) ||
        (item.item_brand_model || '').toLowerCase().includes(q);

      const matchesType = activeTypeTab === 'all' || item.listing_type === activeTypeTab;

      let matchesStatus = true;
      const isRunning = Number(item.is_running) === 1;
      const isExpired = !!item.is_expired;

      if (statusFilter === 'active') matchesStatus = !isExpired && isRunning;
      if (statusFilter === 'paused') matchesStatus = !isExpired && !isRunning;
      if (statusFilter === 'expired') matchesStatus = isExpired;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [listings, searchTerm, activeTypeTab, statusFilter]);

  // Handle Pause / Resume toggle
  const handleToggleEventStatus = async (item: any) => {
    if (!user?.id || !item?.id) return;
    setToggleLoadingId(item.id);
    try {
      const res = await toggleEventStatus(item.id, user.id);
      if (res.data?.status) {
        const newRunning = res.data.is_running;
        setListings((prev) =>
          prev.map((l) => (l.id === item.id ? { ...l, is_running: newRunning } : l))
        );
        showToast(res.data.message || (newRunning ? 'Listing resumed on feed!' : 'Listing paused / hidden.'), 'success');
      } else {
        showToast(res.data?.message || 'Failed to toggle status.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error updating listing status.', 'error');
    } finally {
      setToggleLoadingId(null);
    }
  };

  // Open Leads Modal
  const handleOpenLeads = async (listing: any) => {
    if (!user?.id) return;
    setSelectedListingForLeads(listing);
    setLeadsModalOpen(true);
    setLeadsLoading(true);
    setLeadsData([]);
    try {
      const res = await getEventUnlockLeads(listing.id, user.id);
      if (res.data?.data?.leads) {
        setLeadsData(res.data.data.leads);
      }
    } catch (err) {
      console.error('Error loading leads:', err);
    } finally {
      setLeadsLoading(false);
    }
  };

  // Open Edit Page
  const handleOpenEdit = (listing: any) => {
    if (listing?.id) {
      navigate(`/events/edit/${listing.id}`);
    }
  };

  // Delete Listing
  const handleConfirmDelete = async () => {
    if (!deletingId || !user?.id) return;
    setDeleteLoading(true);
    try {
      const res = await deleteEvent(deletingId, user.id);
      if (res.data?.status) {
        setListings((prev) => prev.filter((item) => item.id !== deletingId));
        setDeleteConfirmOpen(false);
        setDeletingId(null);
        showToast(res.data.message || 'Listing deleted permanently.', 'success');
      } else {
        showToast(res.data?.message || 'Failed to delete listing.', 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error deleting listing.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Helper for listing type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'job':
        return {
          label: 'Job Vacancy',
          icon: Briefcase,
          color: 'text-sky-600 dark:text-sky-400',
          bg: 'bg-sky-50 dark:bg-sky-950/80 border-sky-200 dark:border-sky-800/60'
        };
      case 'item_sale':
        return {
          label: 'Purana Saman',
          icon: ShoppingBag,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800/60'
        };
      case 'rental':
        return {
          label: 'Rental Property',
          icon: Home,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800/60'
        };
      default:
        return {
          label: 'Event / Notice',
          icon: Calendar,
          color: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60'
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in slide-in-from-top duration-300">
          <div className={`p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 border ${
            toastMsg.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
              : 'bg-rose-600 text-white border-rose-500 shadow-rose-600/20'
          }`}>
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{toastMsg.text}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-3.5">
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('back')}</span>
          </button>

          <Link
            to="/events/add"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('postListing')}</span>
          </Link>
        </div>

        {/* Title Header Card */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 text-white shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-200 block">
                MANAGE ADS & CLASSIFIEDS
              </span>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white">My Ads, Jobs & Listings</h1>
              <p className="text-xs text-indigo-100 font-normal">
                Edit, pause, activate, or delete listings, and track leads!
              </p>
            </div>

            <button
              onClick={fetchListings}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-90"
              title="Refresh Listings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-indigo-500/30">
            <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
              <span className="text-[10px] font-medium text-indigo-200 block">Total Posted</span>
              <span className="text-base sm:text-lg font-bold text-white">{stats.total}</span>
            </div>

            <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
              <span className="text-[10px] font-medium text-emerald-200 block">Active Running</span>
              <span className="text-base sm:text-lg font-bold text-emerald-300">{stats.active}</span>
            </div>

            <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
              <span className="text-[10px] font-medium text-amber-200 block">Leads / Unlocks</span>
              <span className="text-base sm:text-lg font-bold text-amber-300">👥 {stats.totalLeads}</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="space-y-2">
          {/* Listing Type Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'All Listings', icon: Sparkles },
              { id: 'job', label: 'Jobs', icon: Briefcase },
              { id: 'item_sale', label: 'Buy & Sell', icon: ShoppingBag },
              { id: 'rental', label: 'Rentals', icon: Home },
              { id: 'event', label: 'Events', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTypeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTypeTab(tab.id as ListingType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition active:scale-95 shadow-2xs ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search + Status Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by title, role, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-9 pr-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0">
              {(['all', 'active', 'paused', 'expired'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Loading your listings...</p>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="space-y-3 pt-1">
            {filteredListings.map((item) => {
              const badge = getTypeBadge(item.listing_type);
              const Icon = badge.icon;
              const isExpired = !!item.is_expired;
              const isRunning = Number(item.is_running) === 1;
              const unlockCount = Number(item.unlock_count || 0);
              const isCurrentToggleLoading = toggleLoadingId === item.id;

              const imageSrc = item.image
                ? typeof item.image === 'string' && item.image.startsWith('http')
                  ? item.image
                  : `${IMAGE_BASE_URL}storage/events/${item.image.replace(/^\//, '')}`
                : null;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs p-4 space-y-3 transition hover:border-indigo-500/40"
                >
                  {/* Top Bar: Type Badge + Expiry / Running Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 text-[10px] font-semibold ${badge.bg} ${badge.color}`}>
                      <Icon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isExpired ? (
                        <span className="px-2 py-0.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[10px] font-semibold border border-red-200 dark:border-red-800/40">
                          Expired
                        </span>
                      ) : !isRunning ? (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-semibold border border-amber-200 dark:border-amber-800/40 flex items-center gap-1">
                          <PauseCircle className="w-3 h-3 text-amber-600" />
                          <span>Paused (Hidden)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active {item.days_remaining ? `(${item.days_remaining}d left)` : ''}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    {imageSrc ? (
                      <div className="w-18 h-18 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-800">
                        <img src={imageSrc} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-18 h-18 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Icon className="w-7 h-7" />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h3>

                      {/* Type-Specific Highlights */}
                      {item.listing_type === 'job' && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {item.company_name && (
                            <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-sky-500" />
                              <span className="truncate max-w-[140px]">{item.company_name}</span>
                            </span>
                          )}
                          {item.job_salary && (
                            <span className="font-semibold text-sky-700 dark:text-sky-300">
                              💰 {item.job_salary}
                            </span>
                          )}
                        </div>
                      )}

                      {item.listing_type === 'item_sale' && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {item.item_price && (
                            <span className="font-semibold text-amber-700 dark:text-amber-300 text-xs sm:text-sm">
                              ₹{Number(item.item_price).toLocaleString('en-IN')}
                            </span>
                          )}
                          {item.item_brand_model && (
                            <span className="text-slate-500 text-[11px] font-medium">
                              • {item.item_brand_model}
                            </span>
                          )}
                        </div>
                      )}

                      {item.listing_type === 'rental' && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {item.rental_price && (
                            <span className="font-semibold text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm">
                              ₹{Number(item.rental_price).toLocaleString('en-IN')} / mo
                            </span>
                          )}
                          {item.rental_type && (
                            <span className="text-slate-500 text-[11px] font-medium">
                              • {item.rental_type}
                            </span>
                          )}
                        </div>
                      )}

                      {item.listing_type === 'event' && (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{item.event_date || 'Upcoming'}</span>
                          </span>
                        </div>
                      )}

                      {item.address && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 font-normal">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{item.address}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Footer (Pause / Resume, Edit, Delete, Leads) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                    {/* View Leads Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenLeads(item)}
                      className="py-1.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{unlockCount} Leads</span>
                    </button>

                    {/* Action Controls: Pause / Resume + Edit + Delete */}
                    <div className="flex items-center gap-1.5">
                      {/* Pause / Resume Button */}
                      {!isExpired && (
                        <button
                          type="button"
                          disabled={isCurrentToggleLoading}
                          onClick={() => handleToggleEventStatus(item)}
                          className={`py-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition active:scale-95 disabled:opacity-50 ${
                            isRunning
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100'
                          }`}
                          title={isRunning ? 'Pause listing (hide from feed)' : 'Resume listing (show on feed)'}
                        >
                          {isRunning ? (
                            <>
                              <PauseCircle className={`w-3.5 h-3.5 text-amber-600 ${isCurrentToggleLoading ? 'animate-spin' : ''}`} />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <PlayCircle className={`w-3.5 h-3.5 text-emerald-600 ${isCurrentToggleLoading ? 'animate-spin' : ''}`} />
                              <span>Resume</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1 transition active:scale-95"
                        title="Edit Listing"
                      >
                        <Edit className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingId(item.id);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/40 transition active:scale-95"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">No Listings Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-normal">
                No ads or classifieds match your current search or filter criteria.
              </p>
            </div>
            <Link
              to="/events/add"
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Your First Post</span>
            </Link>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 👥 UNLOCKED LEADS MODAL */}
      {/* ========================================================================= */}
      {leadsModalOpen && selectedListingForLeads && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Candidate & Buyer Leads ({leadsData.length})
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[220px]">
                    {selectedListingForLeads.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLeadsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              {leadsLoading ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-xs">Fetching candidate details...</p>
                </div>
              ) : leadsData.length > 0 ? (
                leadsData.map((lead, idx) => (
                  <div
                    key={lead.unlock_id || idx}
                    className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                        {(lead.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {lead.full_name}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                          <Clock className="w-3 h-3" />
                          <span>{formatIndianDateTime(lead.unlocked_at)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition"
                          title="Call Lead"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/91${lead.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-1">
                  <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Leads Unlocked Yet</p>
                  <p className="text-[11px] text-slate-400">
                    When interested candidates or buyers unlock your contact, their details will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🗑️ DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmOpen && deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete this Listing?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this ad/classified? All details, unlock records, and candidate leads will be permanently deleted.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeletingId(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
