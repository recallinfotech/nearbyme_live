import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  partnerDashboard,
  partnerBusinesses,
  partnerEarnings,
  partnerWithdraw,
  partnerAddBusiness,
  checkPendingWithdraw,
  partnerSettlementSummary,
  applyPartner,
  getCategories,
  getStates,
  getCities,
} from '../services/api';
import {
  Briefcase,
  Plus,
  Building2,
  TrendingUp,
  Wallet,
  RefreshCw,
  X,
  ChevronRight,
  CheckCircle2,
  Clock,
  Search,
  DollarSign,
  Award,
  Layers,
  Phone,
  MapPin
} from 'lucide-react';
import { CameraCaptureButton } from '../components/common/CameraCaptureButton';
import { CameraPhotoResult } from '../services/camera';
import { useNavigate } from 'react-router-dom';

export const PartnerPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { t, localize } = useLanguage();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any | null>(null);
  const [settlementSummary, setSettlementSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Active View / Modal Modals
  const [activeModal, setActiveModal] = useState<'add' | 'businesses' | 'earnings' | 'withdraw' | 'apply' | null>(null);

  // Add Business Form State
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [bName, setBName] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [bAddress, setBAddress] = useState('');
  const [bCatId, setBCatId] = useState('');
  const [bStateId, setBStateId] = useState('');
  const [bCityId, setBCityId] = useState('');
  const [logoPhoto, setLogoPhoto] = useState<CameraPhotoResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);

  // Businesses Filter & Search State
  const [bizSearch, setBizSearch] = useState('');
  const [bizFilter, setBizFilter] = useState<'all' | 'approved' | 'pending'>('all');

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUpi, setWithdrawUpi] = useState('');
  const [pendingWithdraw, setPendingWithdraw] = useState<any | null>(null);
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  // Apply Partner Form State
  const [applyUpiId, setApplyUpiId] = useState('');
  const [applyCity, setApplyCity] = useState('');
  const [applyAadhaarPhoto, setApplyAadhaarPhoto] = useState<CameraPhotoResult | null>(null);
  const [applySelfiePhoto, setApplySelfiePhoto] = useState<CameraPhotoResult | null>(null);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyMsg, setApplyMsg] = useState<string | null>(null);

  const fetchPartnerData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [dashRes, bizRes, earnRes, setRes, pendRes] = await Promise.all([
        partnerDashboard(user.id).catch(() => ({ data: { data: null } })),
        partnerBusinesses(user.id).catch(() => ({ data: { data: [] } })),
        partnerEarnings(user.id).catch(() => ({ data: { data: null } })),
        partnerSettlementSummary(user.id).catch(() => ({ data: { data: null } })),
        checkPendingWithdraw(user.id).catch(() => ({ data: { data: null } })),
      ]);

      if (dashRes.data?.data) setDashboardData(dashRes.data.data);
      if (bizRes.data?.data) {
        const list = Array.isArray(bizRes.data.data) ? bizRes.data.data : (bizRes.data.data.data || []);
        setBusinesses(list);
      }
      if (earnRes.data?.data) setEarnings(earnRes.data.data);
      if (setRes.data?.data) setSettlementSummary(setRes.data.data);
      if (pendRes.data?.data) setPendingWithdraw(pendRes.data.data);
    } catch (err) {
      console.error("Error loading partner data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);

  // Load Categories & States for Add Business modal
  const handleOpenAddModal = async () => {
    if (isPending) {
      alert("Your partner account is pending admin approval.");
      return;
    }
    setActiveModal('add');
    try {
      const [catRes, stateRes] = await Promise.all([
        getCategories().catch(() => ({ data: { data: [] } })),
        getStates().catch(() => ({ data: { data: [] } })),
      ]);
      if (catRes.data?.data) setCategories(Array.isArray(catRes.data.data) ? catRes.data.data : []);
      if (stateRes.data?.data) setStates(Array.isArray(stateRes.data.data) ? stateRes.data.data : []);
    } catch (e) {
      console.error("Error loading form data:", e);
    }
  };

  const handleProtectedNavigate = (path: string) => {
    if (isPending) {
      alert("Your partner account is pending admin approval.");
      return;
    }
    navigate(path);
  };

  const handleStateChange = async (stateId: string) => {
    setBStateId(stateId);
    setBCityId('');
    if (!stateId) {
      setCities([]);
      return;
    }
    try {
      const res = await getCities(parseInt(stateId));
      if (res.data?.data) setCities(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (e) {
      console.error("Error loading cities:", e);
    }
  };

  // Submit New Business Form
  const handleAddBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setFormMsg(null);
    try {
      const formData = new FormData();
      formData.append('user_id', user.id.toString());
      formData.append('business_name', bName);
      formData.append('phone', bPhone);
      formData.append('address', bAddress);
      formData.append('category_id', bCatId);
      formData.append('state_id', bStateId);
      formData.append('city_id', bCityId);

      if (logoPhoto?.blob) {
        formData.append('logo', logoPhoto.blob, 'business_logo.jpg');
      }

      const res = await partnerAddBusiness(formData);
      if (res.data?.status || res.data?.success) {
        setFormMsg('Business listing submitted successfully!');
        setBName('');
        setBPhone('');
        setBAddress('');
        setLogoPhoto(null);
        setTimeout(() => {
          setActiveModal(null);
          fetchPartnerData();
        }, 1500);
      } else {
        setFormMsg(res.data?.message || 'Failed to add business listing.');
      }
    } catch (err: any) {
      setFormMsg(err.response?.data?.message || 'Error submitting business application.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Partner Withdraw Request
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      alert("Enter a valid withdrawal amount");
      return;
    }

    setWithdrawSubmitting(true);
    setWithdrawMsg(null);
    try {
      const res = await partnerWithdraw({
        user_id: user.id,
        amount: amt,
        upi_id: withdrawUpi,
      });

      if (res.data?.status || res.data?.success) {
        setWithdrawMsg(res.data?.message || t('withdrawSuccess'));
        setWithdrawAmount('');
        await fetchPartnerData();
      } else {
        setWithdrawMsg(res.data?.message || 'Withdrawal request failed.');
      }
    } catch (err: any) {
      setWithdrawMsg(err.response?.data?.message || 'Error processing payout request.');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  // Submit Partner Application
  const handleApplyPartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!applyUpiId.trim()) {
      setApplyMsg('Please enter your UPI ID');
      return;
    }
    if (!applyCity.trim()) {
      setApplyMsg('Please enter your City');
      return;
    }
    if (!applyAadhaarPhoto?.blob) {
      setApplyMsg('Please upload your Aadhaar Card photo');
      return;
    }
    if (!applySelfiePhoto?.blob) {
      setApplyMsg('Please capture a Live Selfie photo using the camera');
      return;
    }

    setApplySubmitting(true);
    setApplyMsg(null);
    try {
      const formData = new FormData();
      formData.append('user_id', user.id.toString());
      formData.append('upi_id', applyUpiId.trim());
      formData.append('city', applyCity.trim());
      formData.append('aadhaar_image', applyAadhaarPhoto.blob, 'aadhaar.jpg');
      formData.append('selfie_image', applySelfiePhoto.blob, 'selfie.jpg');

      const res = await applyPartner(formData);
      if (res.data?.status || res.data?.success) {
        setApplyMsg('Application submitted successfully! Verification in progress.');
        await refreshProfile();
        setTimeout(() => {
          setActiveModal(null);
          fetchPartnerData();
        }, 1500);
      } else {
        setApplyMsg(res.data?.message || 'Application submission failed.');
      }
    } catch (err: any) {
      setApplyMsg(err.response?.data?.message || 'Error submitting application.');
    } finally {
      setApplySubmitting(false);
    }
  };

  const filteredBusinesses = businesses.filter((b) => {
    const q = bizSearch.toLowerCase().trim();
    const matchesQuery = (b.business_name || b.name || '').toLowerCase().includes(q) || (b.phone || '').includes(q);
    if (bizFilter === 'approved') return matchesQuery && (b.is_verified === 1 || b.status === 'approved' || b.is_approved === 1);
    if (bizFilter === 'pending') return matchesQuery && (b.status === 'pending' || b.is_verified !== 1);
    return matchesQuery;
  });

  const totalEarnings = dashboardData?.total_earnings ?? earnings?.total_earnings ?? dashboardData?.balance ?? 0;
  const settledAmount = dashboardData?.settled_amount ?? settlementSummary?.settled_amount ?? 0;
  const totalListCount = dashboardData?.total ?? dashboardData?.total_businesses ?? businesses.length;
  const approvedCount = dashboardData?.approved ?? dashboardData?.approved_count ?? businesses.filter(b => b.is_verified === 1 || b.status === 'approved').length;

  const providerStatus = dashboardData?.provider_status || user?.provider_status || 'none';
  const isApproved = providerStatus === 'approved';
  const isPending = providerStatus === 'pending' || ((user?.is_partner === 1 || user?.is_provider === 1) && providerStatus !== 'approved');
  const isNotApplied = !isApproved && !isPending;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Header />
        <main className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('partnerDashboard')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('loginToManage')}</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="py-2.5 px-5 rounded-xl bg-indigo-600 font-semibold text-xs text-white shadow-md shadow-indigo-600/30"
          >
            {t('loginRegister')}
          </button>
        </main>
      </div>
    );
  }

  if (isNotApplied) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Business Listing & Partner Hub</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Choose how you want to list businesses on NearbyMe
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Option 1: Normal User Free Listing */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Normal User • Free
                </span>
                <span className="text-xs font-medium text-slate-500">Max 2 Listings</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🏬 List Your Own Business</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Add your shop, doctor clinic, plumbing service, or local business on NearbyMe directly for free!
                </p>
              </div>
              <button
                onClick={() => navigate('/partner/add-business')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold text-xs text-white shadow-md shadow-emerald-600/25 active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ List My Business (Free)</span>
              </button>
            </div>

            {/* Option 2: Become a Partner */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/40 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Earn Money • Partner
                </span>
                <span className="text-xs font-medium text-slate-500">Unlimited Listings</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🤝 Become a Listing Partner</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Register businesses & shops in your town for other owners and earn ₹20 - ₹100 direct commission per verified listing!
                </p>
              </div>
              <button
                onClick={() => setActiveModal('apply')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-semibold text-xs text-white shadow-md shadow-indigo-600/25 active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <span>Apply as Partner & Earn 🚀</span>
              </button>
            </div>
          </div>
        </main>

        {/* Apply Partner Modal */}
        {activeModal === 'apply' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Become a Listing Partner</h3>
                <button onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {applyMsg && (
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold text-center">
                  {applyMsg}
                </div>
              )}

              <form onSubmit={handleApplyPartnerSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('filterByCity')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Agra, Delhi, Jaipur"
                    value={applyCity}
                    onChange={(e) => setApplyCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('upiId')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210@paytm"
                    value={applyUpiId}
                    onChange={(e) => setApplyUpiId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Aadhaar Card Photo
                  </label>
                  <CameraCaptureButton
                    onPhotoCaptured={(res) => setApplyAadhaarPhoto(res)}
                    label={applyAadhaarPhoto ? "✓ Aadhaar Attached" : "Upload Aadhaar"}
                    allowGallery={true}
                  />
                  {applyAadhaarPhoto?.webPath && (
                    <img src={applyAadhaarPhoto.webPath} alt="Aadhaar Preview" className="mt-2 w-full h-24 object-cover rounded-xl border border-emerald-500/50" />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Live Selfie Photo
                  </label>
                  <CameraCaptureButton
                    onPhotoCaptured={(res) => setApplySelfiePhoto(res)}
                    label={applySelfiePhoto ? "✓ Live Selfie Captured" : "Take Live Selfie"}
                    allowGallery={false}
                  />
                  {applySelfiePhoto?.webPath && (
                    <img src={applySelfiePhoto.webPath} alt="Selfie Preview" className="mt-2 w-full h-24 object-cover rounded-xl border border-emerald-500/50" />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={applySubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-xs text-white shadow-md shadow-indigo-600/30 disabled:opacity-50 mt-2"
                >
                  {applySubmitting ? t('loading') : t('submit')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Pending Application Alert Banner */}
        {isPending && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium leading-relaxed flex items-center gap-3 shadow-2xs">
            <Clock className="w-5 h-5 shrink-0 animate-spin text-amber-500" />
            <div>
              <p className="font-semibold text-xs sm:text-sm text-amber-700 dark:text-amber-300">⏳ Application Status: PENDING</p>
              <p className="text-[11px] text-amber-600/90 dark:text-amber-400/90">Verification is underway by Admin.</p>
            </div>
          </div>
        )}

        {/* 1. Header Row */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
              WELCOME BACK 👋
            </span>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Listing Partner
            </h1>
          </div>

          <button
            onClick={fetchPartnerData}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs active:scale-95 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 2. Total Earnings Banner Card */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-rose-600 via-indigo-600 to-purple-800 text-white shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="space-y-0.5 z-10">
            <span className="text-[10px] font-semibold text-purple-200 uppercase tracking-widest block">
              {t('totalEarnings')}
            </span>
            <p className="text-xl sm:text-2xl font-bold text-white">₹{Number(totalEarnings).toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-purple-100 font-normal pt-0.5">
              Keep going! Your growth starts here.
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-sm z-10">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* 3. Top 3 Stat Cards Row */}
        <div className={`grid grid-cols-3 gap-2.5 ${isPending ? 'opacity-60 grayscale-[30%]' : ''}`}>
          {/* Settled Amt */}
          <div
            onClick={() => handleProtectedNavigate('/partner/earnings')}
            className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 cursor-pointer hover:scale-102 transition shadow-2xs space-y-1 relative overflow-hidden"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2.5 right-2.5" />
            <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white pt-1">₹{Number(settledAmount).toLocaleString('en-IN')}</p>
            <div className="flex items-center justify-between text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
              <span>Settled Amt</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Total List */}
          <div
            onClick={() => handleProtectedNavigate('/partner/my-businesses')}
            className="bg-indigo-50/80 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-200 dark:border-indigo-800/40 cursor-pointer hover:scale-102 transition shadow-2xs space-y-1 relative overflow-hidden"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2.5 right-2.5" />
            <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white pt-1">{totalListCount}</p>
            <div className="flex items-center justify-between text-[10px] font-medium text-indigo-700 dark:text-indigo-400">
              <span>Total List</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Approved */}
          <div
            onClick={() => handleProtectedNavigate('/partner/my-businesses')}
            className="bg-purple-50/80 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-200 dark:border-purple-800/40 cursor-pointer hover:scale-102 transition shadow-2xs space-y-1 relative overflow-hidden"
          >
            <div className="w-2 h-2 rounded-full bg-purple-500 absolute top-2.5 right-2.5" />
            <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white pt-1">{approvedCount}</p>
            <div className="flex items-center justify-between text-[10px] font-medium text-purple-700 dark:text-purple-400">
              <span>Approved</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* 4. Quick Actions */}
        <div className={`grid grid-cols-2 gap-2.5 sm:gap-3 ${isPending ? 'opacity-60 grayscale-[30%]' : ''}`}>
          {/* Add Business */}
          <div
            onClick={() => handleProtectedNavigate('/partner/add-business')}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-indigo-500/50 cursor-pointer transition text-center space-y-1.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{t('addNewBusiness')}</h3>
              <p className="text-[10.5px] text-slate-400 font-normal">{t('businessName')}</p>
            </div>
          </div>

          {/* My Businesses */}
          <div
            onClick={() => handleProtectedNavigate('/partner/my-businesses')}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-emerald-500/50 cursor-pointer transition text-center space-y-1.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{t('myBusinesses')}</h3>
              <p className="text-[10.5px] text-slate-400 font-normal">{t('viewAll')}</p>
            </div>
          </div>

          {/* Earnings History */}
          <div
            onClick={() => handleProtectedNavigate('/partner/earnings')}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-amber-500/50 cursor-pointer transition text-center space-y-1.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/40 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{t('partnerEarnings')}</h3>
              <p className="text-[10.5px] text-slate-400 font-normal">{t('earningsHistory')}</p>
            </div>
          </div>

          {/* Withdraw */}
          <div
            onClick={() => handleProtectedNavigate('/partner/withdraw')}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-purple-500/50 cursor-pointer transition text-center space-y-1.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/40 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{t('partnerWithdraw')}</h3>
              <p className="text-[10.5px] text-slate-400 font-normal">{t('withdrawableBalance')}</p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: ADD BUSINESS LISTING MODAL */}
      {activeModal === 'add' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('addNewBusiness')}</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formMsg && (
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                {formMsg}
              </div>
            )}

            <form onSubmit={handleAddBusinessSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">{t('businessName')} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Physics Coaching Center"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">{t('businessPhone')} *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={bPhone}
                  onChange={(e) => setBPhone(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">{t('selectCategory')} *</label>
                <select
                  required
                  value={bCatId}
                  onChange={(e) => setBCatId(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- {t('selectCategory')} --</option>
                  {categories.map((c) => (
                    <option key={c.category_id || c.id} value={c.category_id || c.id}>{localize(c.name)}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">{t('filterByState')}</label>
                  <select
                    value={bStateId}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">{t('selectState')}</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">{t('filterByCity')}</label>
                  <select
                    value={bCityId}
                    onChange={(e) => setBCityId(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">{t('selectCity')}</option>
                    {cities.map((ct) => (
                      <option key={ct.id} value={ct.id}>{ct.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">{t('businessAddressLabel')} *</label>
                <input
                  type="text"
                  required
                  placeholder="Shop No, Street, Landmark..."
                  value={bAddress}
                  onChange={(e) => setBAddress(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-slate-700 dark:text-slate-300 font-bold">{t('uploadImages')}</label>
                {logoPhoto?.webPath ? (
                  <div className="relative h-28 rounded-2xl overflow-hidden border border-indigo-500/40">
                    <img src={logoPhoto.webPath} alt="Captured Logo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <CameraCaptureButton
                    onPhotoCaptured={(res) => setLogoPhoto(res)}
                    label="Take Business Logo Photo"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-lg shadow-indigo-600/30"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('submit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PartnerPage;
