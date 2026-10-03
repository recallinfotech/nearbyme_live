import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { getEventDetails, unlockEvent, getWallet, IMAGE_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Globe,
  ArrowLeft,
  Eye,
  Ticket,
  Users,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Briefcase,
  ShoppingBag,
  Home,
  Tag,
  Lock,
  LockOpen,
  CheckCircle2,
  Wallet,
  Navigation,
  ShieldCheck,
  Building2,
  DollarSign,
  Edit
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshProfile } = useAuth();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();

  const [event, setEvent] = useState<any | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(user?.wallet_balance || 0);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unlockMsg, setUnlockMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load Wallet
  const loadWallet = useCallback(async () => {
    if (user?.id) {
      try {
        const walletRes = await getWallet(user.id);
        if (walletRes.data?.data) {
          setWalletBalance(walletRes.data.data.balance || walletRes.data.data.wallet_balance || 0);
        }
      } catch (e) {}
    }
  }, [user?.id]);

  // Load Event Details
  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getEventDetails(Number(id), user?.id || null);
      if (res.data?.status && res.data?.data) {
        const evData = res.data.data;
        setEvent(evData);
        setIsUnlocked(evData.is_unlocked || evData.is_owner || false);
      } else {
        setErrorMsg("Listing details not found.");
      }
    } catch (err: any) {
      console.error("Error fetching listing details:", err);
      setErrorMsg(err.response?.data?.message || "Failed to load details.");
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchDetails();
    loadWallet();
  }, [fetchDetails, loadWallet]);

  // Unlock Contact Handler
  const handleUnlockContact = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    if (!event?.id) return;

    const unlockFee = Number(event.unlock_price || 5);
    if (walletBalance < unlockFee) {
      alert(`Insufficient wallet balance! (Required: ₹${unlockFee}, Available: ₹${walletBalance}). Please recharge.`);
      navigate('/wallet');
      return;
    }

    setUnlocking(true);
    setUnlockMsg(null);

    try {
      const res = await unlockEvent({
        user_id: user.id,
        event_id: event.id,
      });

      if (res.data?.status || res.data?.success) {
        setIsUnlocked(true);
        setUnlockMsg(res.data?.message || t('unlockSuccess'));
        setWalletBalance((prev) => Math.max(0, prev - unlockFee));
        await refreshProfile();
        await loadWallet();
        await fetchDetails();
      } else {
        alert(res.data?.message || t('insufficientBalance'));
        setUnlockMsg(res.data?.message || t('insufficientBalance'));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to unlock contact.';
      alert(msg);
      setUnlockMsg(msg);
    } finally {
      setUnlocking(false);
      setTimeout(() => setUnlockMsg(null), 4000);
    }
  };

  const getImageUrl = (ev: any) => {
    if (ev?.image) {
      if (typeof ev.image === 'string' && ev.image.startsWith('http')) return ev.image;
      return `${IMAGE_BASE_URL}storage/events/${ev.image.replace(/^\//, '')}`;
    }
    switch (ev?.listing_type) {
      case 'job':
        return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60';
      case 'item_sale':
        return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=60';
      case 'rental':
        return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60';
      default:
        return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60';
    }
  };

  const openGoogleMaps = () => {
    if (event?.latitude && event?.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`, '_blank');
    } else if (event?.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`, '_blank');
    }
  };

  const getPriceTag = (ev: any) => {
    switch (ev.listing_type) {
      case 'job':
        return ev.job_salary ? `₹${ev.job_salary}` : 'Competitive Salary';
      case 'item_sale':
        return ev.item_price ? `₹${ev.item_price}` : 'Price on Request';
      case 'rental':
        return ev.rental_price ? `₹${ev.rental_price} / Month` : 'Rent on Request';
      default:
        return ev.entry_fee && Number(ev.entry_fee) > 0 ? `₹${ev.entry_fee}` : t('freeEntry');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="max-w-3xl mx-auto px-3.5 sm:px-6 py-4 space-y-4">
        {/* Top Back Navigation & Wallet Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back')}</span>
          </button>

          <div className="flex items-center gap-2">
            {(event?.is_owner || (user?.id && event?.user_id === user.id)) && (
              <Link
                to={`/events/edit/${event.id || id}`}
                title="Edit Listing"
                className="px-2.5 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-sm flex items-center gap-1 active:scale-95 transition hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            )}

            <Link
              to="/wallet"
              className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>₹{walletBalance}</span>
            </Link>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-9 h-9 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('pleaseWait')}
            </p>
          </div>
        ) : errorMsg || !event ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('noDataFound')}</h2>
            <p className="text-xs text-slate-500">{errorMsg}</p>
            <Link
              to="/events"
              className="inline-block mt-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-2xl text-xs"
            >
              {t('viewAll')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Hero Image Card */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xl group">
              <div className="relative w-full aspect-square sm:aspect-4/3 max-h-[520px] bg-slate-950 overflow-hidden flex items-center justify-center">
                {/* Ambient Blurred Background */}
                <img
                  src={getImageUrl(event)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                  aria-hidden="true"
                />

                {/* Full Sharp Image without cropping */}
                <img
                  src={getImageUrl(event)}
                  alt={event.title}
                  className="relative z-10 w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute(
                      'src',
                      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60'
                    );
                  }}
                />

                <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                {/* Listing Type Badge */}
                <div className="absolute top-4 left-4 z-30 px-3 py-1 bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1.5">
                  <span className="text-amber-400">●</span>
                  <span>{localize(event.category_name || event.listing_type?.toUpperCase() || 'LISTING')}</span>
                </div>

                {/* Views Counter */}
                <div className="absolute top-4 right-4 z-30 px-3 py-1 bg-slate-950/80 backdrop-blur-md border border-white/20 text-slate-300 text-xs font-bold rounded-full flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>{event.views || 0} views</span>
                </div>
              </div>

              {/* Title & Main Price Box */}
              <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    {event.company_name && (
                      <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400 block mb-1">
                        🏢 {event.company_name}
                      </span>
                    )}
                    {event.item_brand_model && (
                      <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-1">
                        🏷️ {event.item_brand_model}
                      </span>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                      {event.title}
                    </h1>
                  </div>

                  <div className="shrink-0 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center font-black text-base shadow-md">
                    {getPriceTag(event)}
                  </div>
                </div>
              </div>
            </div>

            {/* Unlock Notification Alert */}
            {unlockMsg && (
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-between shadow-lg">
                <span>{unlockMsg}</span>
                {unlockMsg.includes('recharge') && (
                  <button
                    onClick={() => navigate('/wallet')}
                    className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    {t('addCredits')}
                  </button>
                )}
              </div>
            )}

            {/* KEY DETAILS GRID (DYNAMIC PER LISTING TYPE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* If JOB */}
              {event.listing_type === 'job' && (
                <>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('salaryRange')}</span>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white pt-0.5">
                        {event.job_salary || 'Disclosed on interview'}
                      </p>
                      {event.job_type && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-bold">
                          {event.job_type}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('eligibility')}</span>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white pt-0.5">
                        {event.job_eligibility || 'Open to all eligible candidates'}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* If PURANA SAMAN / SALE ITEM */}
              {event.listing_type === 'item_sale' && (
                <>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('askingPrice')}</span>
                      <p className="text-base font-black text-amber-600 dark:text-amber-400 pt-0.5">
                        {event.item_price ? `₹${event.item_price}` : 'Negotiable'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('condition')} & {t('brandModel')}</span>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white pt-0.5">
                        {event.item_condition || 'Good'} {event.item_brand_model ? `• ${event.item_brand_model}` : ''}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* If RENTALS */}
              {event.listing_type === 'rental' && (
                <>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('propertyType')} & {t('monthlyRent')}</span>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400 pt-0.5">
                        {event.rental_price ? `₹${event.rental_price} / Month` : 'Contact for Rent'}
                      </p>
                      <span className="text-xs text-slate-500 font-semibold">{event.rental_type || 'Residential'}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('furnishing')} & {t('securityDeposit')}</span>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white pt-0.5">
                        {event.rental_furnishing || 'Unfurnished'}
                        {event.rental_deposit ? ` • Deposit: ₹${event.rental_deposit}` : ''}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* If EVENT */}
              {(!event.listing_type || event.listing_type === 'event') && (
                <>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('eventDate')}</span>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white pt-0.5">
                        {event.event_date || 'Date to be announced'}
                      </p>
                      {(event.start_time || event.end_time) && (
                        <p className="text-[11px] text-slate-500 font-semibold pt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-rose-500" />
                          <span>{event.start_time || ''} {event.end_time ? `- ${event.end_time}` : ''}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Entry / Capacity</span>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white pt-0.5">
                        {event.entry_fee && Number(event.entry_fee) > 0 ? `₹${event.entry_fee}` : t('freeEntry')}
                      </p>
                      {event.max_people && (
                        <span className="text-[11px] text-slate-500 font-semibold">Max {event.max_people} Seats</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Address & Navigation Card */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('businessAddress')}</span>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white pt-0.5 leading-relaxed">
                    {event.address || 'Address provided on direct inquiry'}
                  </p>
                </div>
              </div>

              {(event.latitude || event.address) && (
                <button
                  onClick={openGoogleMaps}
                  className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center gap-1 shadow-sm shrink-0 hover:bg-indigo-100 transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{t('directions')}</span>
                </button>
              )}
            </div>

            {/* Description Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Description & Details</span>
              </h2>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description || "No additional description provided."}
              </div>
            </div>

            {/* ========================================================= */}
            {/* CONTACT & UNLOCK SECTION */}
            {/* ========================================================= */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5">
                Contact Person & Application
              </h2>

              {!isUnlocked ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-center space-y-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Mobile Number: <strong className="font-mono text-slate-900 dark:text-white">{event.masked_phone || '98765XXXXX'}</strong>
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      Unlock full contact number & WhatsApp to apply, inquire or purchase directly.
                    </p>
                  </div>

                  <button
                    onClick={handleUnlockContact}
                    disabled={unlocking}
                    className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-98 transition"
                  >
                    {unlocking ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <LockOpen className="w-4 h-4" />
                    )}
                    <span>
                      {t('unlockContactFor')} ({event.unlock_price || 5} {t('coins')} 🪙)
                    </span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Contact Number: {event.contact_number}</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                      Unlocked ✓
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {event.contact_number && (
                      <a
                        href={`tel:${event.contact_number}`}
                        className="py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 transition"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{t('callNow')}</span>
                      </a>
                    )}

                    {event.whatsapp_number && (
                      <a
                        href={`https://wa.me/${event.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I am inquiring about your listing on NearbyApp: ${event.title}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{t('whatsapp')}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default EventDetailPage;
