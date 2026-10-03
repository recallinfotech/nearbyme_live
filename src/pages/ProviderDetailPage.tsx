import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { getProviderDetail, getWallet, unlockProvider, IMAGE_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  MapPin,
  Phone,
  Lock,
  LockOpen,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  MessageCircle,
  Mail,
  Zap,
  ShieldCheck,
  Wallet
} from 'lucide-react';

export const ProviderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshProfile } = useAuth();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();

  const [data, setData] = useState<any | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(user?.wallet_balance || 0);
  const [loading, setLoading] = useState<boolean>(true);
  const [unlocking, setUnlocking] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);

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

  // Load Provider Detail Data
  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getProviderDetail(parseInt(id), user?.id);
      if (res.data?.data) {
        const pData = res.data.data;
        setData(pData);
        const unlockedStatus = pData.is_unlocked === 1 || pData.is_unlocked === true || pData.unlocked === true;
        setIsUnlocked(unlockedStatus);
      }
    } catch (err) {
      console.error("Error loading provider detail:", err);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    loadData();
    loadWallet();
  }, [loadData, loadWallet]);

  // Handle Unlock Provider Contact
  const handleUnlock = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    const provId = data?.id || data?.provider_id || id;
    if (!provId) return;

    const currentBalance = walletBalance ?? user?.wallet_balance ?? 0;
    if (currentBalance <= 0) {
      navigate('/wallet');
      return;
    }

    setUnlocking(true);
    setMsg(null);
    try {
      const res = await unlockProvider({
        user_id: user.id,
        provider_id: parseInt(provId.toString()),
      });

      if (res.data?.status || res.data?.success) {
        const cost = data?.price || 5;
        setWalletBalance((prev) => Math.max(0, prev - cost));
        setIsUnlocked(true);
        setMsg(res.data?.message || t('unlockSuccess'));

        await refreshProfile();
        await loadWallet();
        await loadData();
      } else {
        alert(res.data?.message || t('insufficientBalance'));
        setMsg(res.data?.message || t('insufficientBalance'));
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || t('insufficientBalance');
      alert(errorMsg);
      setMsg(errorMsg);
    } finally {
      setUnlocking(false);
    }
  };

  // Handle Call Action
  const handleCall = () => {
    if (!isUnlocked) {
      alert(t('unlockContact'));
      return;
    }
    if (data?.phone) {
      window.location.href = `tel:${data.phone}`;
    }
  };

  // Handle WhatsApp Action
  const handleWhatsApp = () => {
    if (!isUnlocked) {
      alert(t('unlockContact'));
      return;
    }
    if (data?.phone) {
      const rawPhone = data.phone.toString();
      const formattedPhone = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;
      window.open(`https://wa.me/${formattedPhone}`, '_blank');
    }
  };

  // Banner & Icon Image Resolution
  const getBannerUrl = () => {
    if (!data) return 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=60';
    const src = data.banner_image || data.banner;
    if (!src) return 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=60';
    if (typeof src === 'string' && src.startsWith('http')) return src;
    return `${IMAGE_BASE_URL}storage/provider/${src.replace(/^\//, '')}`;
  };

  const getIconUrl = () => {
    if (!data) return 'https://cdn-icons-png.flaticon.com/512/869/869636.png';
    const src = data.icon_url || data.logo || data.image;
    if (!src) return 'https://cdn-icons-png.flaticon.com/512/869/869636.png';
    if (typeof src === 'string' && src.startsWith('http')) return src;
    return `${IMAGE_BASE_URL}storage/provider/${src.replace(/^\//, '')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-2">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{t('pleaseWait')}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 text-center text-slate-700 dark:text-slate-300 space-y-4">
        <p className="text-base font-bold">{t('noDataFound')}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-indigo-600 rounded-2xl text-white text-xs font-bold shadow-lg"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-28 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="max-w-md mx-auto px-3 py-3 space-y-3">
        {/* Back Navigation & Wallet Bar */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition flex items-center gap-1.5"
            title={t('back')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold">{t('back')}</span>
            {data.category_name && (
              <span className="text-slate-400 font-normal">({localize(data.category_name)})</span>
            )}
          </button>

          <button
            onClick={() => navigate('/wallet')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1 active:scale-95 transition"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>₹{walletBalance}</span>
          </button>
        </div>

        {/* BANNER WITH REFINED LOCK OVERLAY */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-purple-200 dark:border-slate-800 shadow-md min-h-[180px] max-h-[220px] flex items-center justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute top-3 left-3 z-30 p-2 rounded-xl bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-md border border-white/20 shadow-lg active:scale-95 transition flex items-center gap-1"
            title={t('back')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[11px] font-bold pr-0.5">{t('back')}</span>
          </button>

          <img
            src={getBannerUrl()}
            alt={data.business_name || data.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              !isUnlocked ? 'filter blur-md brightness-75 scale-105' : ''
            }`}
            onError={(e) => {
              (e.target as HTMLElement).setAttribute(
                'src',
                'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=60'
              );
            }}
          />

          {!isUnlocked && (
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-1.5 p-4 z-10">
              <Lock className="w-8 h-8 text-white drop-shadow-md" />
              <span className="text-sm font-extrabold tracking-wide drop-shadow-md">
                {t('unlockContact')}
              </span>
            </div>
          )}
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white dark:bg-slate-900 mx-1 -mt-10 rounded-3xl p-4 border border-purple-200 dark:border-slate-800 text-center shadow-lg relative z-20 space-y-2">
          <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 bg-purple-100 dark:bg-slate-950 shadow-xl mx-auto -mt-12 overflow-hidden flex items-center justify-center p-1">
            <img
              src={getIconUrl()}
              alt="Icon"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).setAttribute(
                  'src',
                  'https://cdn-icons-png.flaticon.com/512/869/869636.png'
                );
              }}
            />
          </div>

          <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
            {data.business_name || data.name}
          </h1>
        </div>

        {/* DETAILS SECTION CARDS */}
        <div className="space-y-3 pt-1">
          {/* ADDRESS CARD */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-200 dark:border-slate-800 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">{t('businessAddress')}</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
              {data.address || t('noDataFound')}
            </p>
          </div>

          {/* PHONE CARD */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-200 dark:border-slate-800 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Phone className="w-4 h-4 shrink-0" />
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">{t('businessPhone')}</span>
            </div>
            <div className="pl-6 space-y-1">
              <p className="text-base font-black tracking-wider text-slate-900 dark:text-white">
                {isUnlocked
                  ? data.phone
                  : data.phone
                  ? data.phone.toString().substring(0, 3) + "XXXXXXX"
                  : "Hidden"}
              </p>
              {!isUnlocked && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                  🔒 {t('unlockContact')}
                </p>
              )}
            </div>
          </div>

          {/* VERIFICATION STATUS CARD */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">{t('verified')}</span>
            </div>
            <div className="pl-6">
              <span
                className={`inline-block px-3 py-1 rounded-lg text-xs font-extrabold ${
                  data.is_verified == 1
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                }`}
              >
                {data.is_verified == 1 ? `${t('verified')} ✓` : t('unverified')}
              </span>
            </div>
          </div>

          {/* WORKING HOURS CARD */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">{t('timings')}</span>
            </div>

            <div className="pl-6">
              {data.is_24x7_available == 1 ? (
                <div className="bg-indigo-600 text-white rounded-xl p-3 flex items-center justify-center gap-2 font-bold text-xs shadow-md">
                  <Zap className="w-4 h-4 fill-white" />
                  <span>24x7 {t('openNow')}</span>
                </div>
              ) : (
                <div className="bg-purple-50 dark:bg-slate-950 rounded-xl p-3 border border-purple-200 dark:border-slate-800 grid grid-cols-2 text-center divide-x divide-purple-200 dark:divide-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">From</span>
                    <span className="text-sm font-black text-purple-900 dark:text-purple-300">{data.working_from || "9:00 AM"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">To</span>
                    <span className="text-sm font-black text-purple-900 dark:text-purple-300">{data.working_to || "9:00 PM"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ALERT NOTIFICATION MSG */}
          {msg && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-between shadow-lg">
              <span>{msg}</span>
              {msg.includes('add money') && (
                <button
                  onClick={() => navigate('/wallet')}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  {t('addCredits')}
                </button>
              )}
            </div>
          )}

          {/* UNLOCK BUTTON BAR */}
          {!isUnlocked && (
            <button
              onClick={handleUnlock}
              disabled={unlocking}
              className="w-full py-4 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
            >
              {unlocking ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <LockOpen className="w-4 h-4" />
              )}
              <span>
                {unlocking
                  ? t('loading')
                  : data.price == 0
                  ? t('unlockContact')
                  : `${t('unlockContact')} ${data.price || 5} 🪙`}
              </span>
            </button>
          )}

          {/* ACTION BUTTONS (CALL NOW & WHATSAPP) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleCall}
              disabled={!isUnlocked}
              className={`py-3.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-95 ${
                isUnlocked
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>{t('callNow')}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              disabled={!isUnlocked}
              className={`py-3.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-95 ${
                isUnlocked
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('whatsapp')}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default ProviderDetailPage;
