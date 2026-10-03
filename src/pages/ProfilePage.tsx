import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  getWallet,
  searchBusinessByPhone,
  updateProfile,
  sendEmailOtp,
  verifyEmailOtp,
  claimBusinessListing,
  getUserClaimRequests,
  deleteUserAccount,
  IMAGE_BASE_URL,
} from '../services/api';
import {
  User,
  Wallet,
  LogOut,
  Plus,
  Phone,
  Palette,
  Sun,
  Moon,
  Globe,
  BookOpen,
  ChevronRight,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  AlertCircle,
  Mail,
  Edit3,
  X,
  Loader2,
  ShieldCheck,
  RotateCw,
  Search,
  Clock,
  ShieldAlert,
  Trash2,
  Tag,
  FileText,
  Scale,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, logout, refreshProfile, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const navigate = useNavigate();

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Email OTP Verification State
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSentEmail, setOtpSentEmail] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpMessage, setOtpMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Claim Business Modal State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimPhone, setClaimPhone] = useState('');
  const [claimResults, setClaimResults] = useState<any[]>([]);
  const [claimSearchLoading, setClaimSearchLoading] = useState(false);
  const [claimSubmittingId, setClaimSubmittingId] = useState<number | null>(null);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);
  const [claimErrorMsg, setClaimErrorMsg] = useState<string | null>(null);
  const [claimNotes, setClaimNotes] = useState('');
  const [selectedClaimProvider, setSelectedClaimProvider] = useState<any | null>(null);

  // My Claim Requests State
  const [showMyClaimsModal, setShowMyClaimsModal] = useState(false);
  const [userClaimsList, setUserClaimsList] = useState<any[]>([]);
  const [loadingClaimsList, setLoadingClaimsList] = useState(false);

  // 🗑️ Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('No longer need this app');
  const [deleteCustomReason, setDeleteCustomReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<any | null>(null);

  useEffect(() => {
    if (user?.id) {
      refreshProfile();
    }
  }, [user?.id]);

  // Handle OTP countdown timer
  useEffect(() => {
    let interval: any = null;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const openEditModal = () => {
    if (!user) return;
    const nameParts = (user.name || '').trim().split(' ');
    setFirstName(user.first_name || nameParts[0] || '');
    setLastName(user.last_name || nameParts.slice(1).join(' ') || '');
    setPhone(user.phone || '');
    setEmail(user.email || '');
    setSelectedImage(null);
    setImagePreview(user.profile_image_url || user.avatar || null);
    setEditError(null);
    setEditSuccess(null);
    setShowOtpSection(false);
    setOtpMessage(null);
    setShowEditModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setEditError('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!email || !email.includes('@')) {
      setOtpMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }
    if (!user?.id) return;

    setIsSendingOtp(true);
    setOtpMessage(null);
    try {
      const res = await sendEmailOtp({ user_id: user.id, email });
      if (res.data?.status) {
        setShowOtpSection(true);
        setOtpSentEmail(email);
        setOtpTimer(60);
        setOtpMessage({ type: 'success', text: `OTP sent to ${email}. Please check your inbox / spam.` });
      } else {
        setOtpMessage({ type: 'error', text: res.data?.message || 'Failed to send OTP.' });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not send verification OTP. Please try again.';
      setOtpMessage({ type: 'error', text: msg });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      setOtpMessage({ type: 'error', text: 'Please enter a valid OTP code' });
      return;
    }
    if (!user?.id) return;

    setIsVerifyingOtp(true);
    setOtpMessage(null);
    try {
      const res = await verifyEmailOtp({
        user_id: user.id,
        email: otpSentEmail || email,
        otp: otpCode.trim(),
      });
      if (res.data?.status) {
        setOtpMessage({ type: 'success', text: 'Email verified successfully! ✓' });
        setShowOtpSection(false);
        setOtpCode('');
        if (res.data?.data) {
          updateUser(res.data.data);
        }
        refreshProfile();
      } else {
        setOtpMessage({ type: 'error', text: res.data?.message || 'Invalid OTP code' });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to verify OTP code.';
      setOtpMessage({ type: 'error', text: msg });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!firstName.trim()) {
      setEditError('First name is required');
      return;
    }

    setIsSaving(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const formData = new FormData();
      formData.append('id', String(user.id));
      formData.append('user_id', String(user.id));
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      if (phone) formData.append('phone', phone.trim());
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const res = await updateProfile(formData);
      if (res.data?.status) {
        setEditSuccess('Profile updated successfully! 🎉');
        if (res.data?.data) {
          updateUser(res.data.data);
        }
        refreshProfile();
        setTimeout(() => {
          setShowEditModal(false);
        }, 1000);
      } else {
        setEditError(res.data?.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      const msg = err.response?.data?.message || 'Failed to update profile details.';
      setEditError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const openDeleteModal = () => {
    setDeleteConfirmText('');
    setDeleteError(null);
    setDeleteSuccess(null);
    setShowDeleteModal(true);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) {
      setDeleteError('No email associated with your account. Please add your email first.');
      return;
    }
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE in capital letters to confirm.');
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const finalReason = deleteReason === 'Other' ? deleteCustomReason : deleteReason;
      const res = await deleteUserAccount({
        email: user.email,
        reason: finalReason,
      });

      if (res.data?.status) {
        setDeleteSuccess(res.data);
        setTimeout(async () => {
          await logout();
          navigate('/auth/login');
        }, 3500);
      } else {
        setDeleteError(res.data?.message || 'Failed to process account deletion.');
      }
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to deactivate account.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Search existing business by phone for claiming (strictly using user's registered phone)
  const handleSearchClaimBusiness = async (e?: React.FormEvent, phoneOverride?: string) => {
    if (e) e.preventDefault();
    const phoneToSearch = (phoneOverride || user?.phone || claimPhone || '').trim();
    if (!phoneToSearch || phoneToSearch.length < 4) {
      setClaimErrorMsg('Please ensure your mobile number is saved in your profile.');
      return;
    }
    setClaimSearchLoading(true);
    setClaimErrorMsg(null);
    setClaimSuccessMsg(null);
    try {
      const res = await searchBusinessByPhone(phoneToSearch, user?.id);
      if (res.data?.status) {
        const list = res.data.data || [];
        setClaimResults(list);
        if (list.length === 0) {
          setClaimErrorMsg(`No business listings found registered with your number (${phoneToSearch}).`);
        }
      } else {
        setClaimErrorMsg(res.data?.message || 'No business found.');
      }
    } catch (err: any) {
      setClaimErrorMsg(err.response?.data?.message || 'Error searching businesses.');
    } finally {
      setClaimSearchLoading(false);
    }
  };

  // Submit claim request for a specific provider
  const handleSubmitClaim = async (provider: any) => {
    if (!user?.id || !user?.phone) return;
    setClaimSubmittingId(provider.id);
    setClaimErrorMsg(null);
    setClaimSuccessMsg(null);
    try {
      const res = await claimBusinessListing({
        user_id: user.id,
        provider_id: provider.id,
        phone: user.phone.trim(),
        notes: claimNotes.trim() || undefined,
      });

      if (res.data?.status) {
        setClaimSuccessMsg(res.data.message || 'Claim request submitted! Pending Admin approval.');
        setClaimNotes('');
        setSelectedClaimProvider(null);
        handleSearchClaimBusiness(undefined, user.phone.trim());
        fetchMyClaimRequests();
      } else {
        setClaimErrorMsg(res.data?.message || 'Failed to submit claim request.');
      }
    } catch (err: any) {
      setClaimErrorMsg(err.response?.data?.message || 'Error submitting claim request.');
    } finally {
      setClaimSubmittingId(null);
    }
  };

  // Fetch user's claim history
  const fetchMyClaimRequests = async () => {
    if (!user?.id) return;
    setLoadingClaimsList(true);
    try {
      const res = await getUserClaimRequests(user.id);
      if (res.data?.status) {
        setUserClaimsList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching claim requests:', err);
    } finally {
      setLoadingClaimsList(false);
    }
  };

  const openClaimModal = () => {
    if (!user?.phone || !user.phone.trim()) {
      openEditModal();
      setEditError('⚠️ Please fill and save your Mobile Number first to claim your business listing.');
      return;
    }
    const userPhone = user.phone.trim();
    setClaimPhone(userPhone);
    setClaimResults([]);
    setClaimErrorMsg(null);
    setClaimSuccessMsg(null);
    setClaimNotes('');
    setSelectedClaimProvider(null);
    setShowClaimModal(true);
    handleSearchClaimBusiness(undefined, userPhone);
  };

  const openMyClaimsModal = () => {
    fetchMyClaimRequests();
    setShowMyClaimsModal(true);
  };

  const isEmailVerified =
    user?.email_verified === 'yes' ||
    user?.email_verified === true ||
    String(user?.email_verified) === '1';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-5">
        {!user ? (
          <div className="text-center space-y-6 py-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('accountMenu')}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('loginToManage')}</p>
            </div>

            <button
              onClick={() => navigate('/auth/login')}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 font-bold text-xs text-white shadow-lg shadow-indigo-600/30"
            >
              {t('loginRegister')}
            </button>
          </div>
        ) : (
          <>
            {/* User Profile Card */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* User Avatar */}
                  <div className="relative group">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 border-2 border-indigo-500/30 flex items-center justify-center text-white text-2xl font-black shadow-lg overflow-hidden shrink-0">
                      {(() => {
                        const userAvatarUrl =
                          user.profile_image_url ||
                          user.avatar ||
                          (user.profile_image
                            ? user.profile_image.startsWith('http')
                              ? user.profile_image
                              : `${IMAGE_BASE_URL}storage/${user.profile_image.replace(/^\//, '')}`
                            : null);

                        if (userAvatarUrl) {
                          return (
                            <img
                              src={userAvatarUrl}
                              alt={user.name || 'User'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          );
                        }

                        return <span>{(user.first_name || user.name || 'U').trim().charAt(0).toUpperCase()}</span>;
                      })()}
                    </div>
                    <button
                      onClick={openEditModal}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 hover:bg-indigo-700 transition"
                      title="Edit Profile"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* User Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                        {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'My Account'}
                      </h2>
                      {isEmailVerified ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 shrink-0">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <button
                          onClick={openEditModal}
                          className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-200 transition shrink-0"
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>Verify Now</span>
                        </button>
                      )}
                    </div>

                    {/* Email */}
                    {user.email ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    ) : null}

                    {/* Phone Number */}
                    {user.phone ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.phone}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={openEditModal}
                    className="py-2 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-semibold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 hover:bg-rose-200 transition shadow-2xs"
                    title={t('logout')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Wallet Balance Card (Single Row Layout with Side Button) */}
            <div
              onClick={() => navigate('/wallet')}
              className="p-4 sm:p-4.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/70 via-purple-50/30 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700/60 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block leading-tight">{t('availableBalance')}</span>
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                    🪙 ₹{Number(user.wallet_balance || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/wallet');
                }}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addCredits')}</span>
              </button>
            </div>

            {/* 🏬 List & Claim Business Promotional Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">List or Claim Your Business</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">
                      2 Free Listings
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-normal mt-0.5">
                    Search your mobile number to claim an already listed shop or register a new one for free!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={openClaimModal}
                  className="py-2 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition"
                >
                  <Search className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Claim Business</span>
                </button>

                <button
                  onClick={() => navigate('/partner/add-business')}
                  className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 transition whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ List New</span>
                </button>
              </div>
            </div>

            {/* Quick Menu Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => navigate('/my-listings')}
                className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs flex flex-col justify-between group transition text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5">
                  <Briefcase className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">My Ads & Jobs</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Manage & Track Leads</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/partner/my-businesses')}
                className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs flex flex-col justify-between group transition text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">My Businesses</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Listings & Status (Max 2)</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/phonebook')}
                className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 shadow-xs flex flex-col justify-between group transition text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2.5">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t('myPhonebook')}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{t('unlocked')}</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/wallet')}
                className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-xs flex flex-col justify-between group transition text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5">
                  <Wallet className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t('creditWallet')}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{t('transactionHistory')}</p>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Multi-Language Selection Card */}
        <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 shadow-md">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('selectLanguage')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred Indian language</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`p-3 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition active:scale-95 ${
                  language === lang.code
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* App Theme Settings Menu Section */}
        <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('theme')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Select Light or Dark visual theme</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-3.5 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition active:scale-95 ${
                theme === 'light'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span>☀️ {t('lightMode')}</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-3.5 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition active:scale-95 ${
                theme === 'dark'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-300" />
              <span>🌙 {t('darkMode')}</span>
            </button>
          </div>
        </div>

        {/* 📜 Legal, Compliance & Information Section */}
        <div className="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3.5 bg-white dark:bg-slate-900 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Legal & Compliance</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Policy documents, terms & company information</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              v2.0
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => navigate('/privacy')}
              className="p-3.5 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    Privacy Policy
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Data usage & rights</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={() => navigate('/terms')}
              className="p-3.5 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                    Terms & Conditions
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">User agreement & rules</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/50 text-center space-y-1">
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
              Nearby Me is operated by <span className="text-slate-900 dark:text-slate-200 font-bold">Recall IT Solutions LLP</span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500">
              info@recallinfotech.com
            </p>
          </div>
        </div>

        {/* 🔘 Small & Subtle Bottom Action Links */}
        <div className="pt-2 pb-6 flex items-center justify-center gap-6 text-xs text-slate-400 dark:text-slate-500">
          <button
            onClick={handleLogout}
            className="hover:text-slate-700 dark:hover:text-slate-300 transition flex items-center gap-1.5 font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('logout')}</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          <button
            onClick={openDeleteModal}
            className="hover:text-slate-600 dark:hover:text-slate-400 transition flex items-center gap-1.5 font-normal text-slate-400/80 dark:text-slate-500 text-[11px]"
          >
            <Trash2 className="w-3.5 h-3.5 opacity-60" />
            <span>Delete Account</span>
          </button>
        </div>
      </main>

      {/* ✏️ EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 space-y-5 animate-scale-up relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Edit Profile Details</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Update your name, picture & verified email</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error & Success Messages */}
            {editError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}
            {editSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Photo Picker */}
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 border-4 border-indigo-500/30 flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span>{firstName ? firstName.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-3xl bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition backdrop-blur-xs">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Change Photo</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tap to upload profile image (Auto-converted to WebP)
                </p>
              </div>

              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Rahul"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Email Address & Verification Section */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address & Verification
                  </label>
                  {isEmailVerified && email.toLowerCase() === (user?.email || '').toLowerCase() ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Email Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Requires OTP Verification
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setShowOtpSection(false);
                      }}
                      placeholder="your.email@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>

                  {/* Send OTP Button if unverified or changed */}
                  {(!isEmailVerified || email.toLowerCase() !== (user?.email || '').toLowerCase()) && (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={isSendingOtp || otpTimer > 0 || !email}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-md shadow-indigo-600/20 active:scale-95 transition"
                    >
                      {isSendingOtp ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                      <span>{otpTimer > 0 ? `Resend (${otpTimer}s)` : 'Send OTP'}</span>
                    </button>
                  )}
                </div>

                {/* OTP Message */}
                {otpMessage && (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-2 ${
                      otpMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                    }`}
                  >
                    {otpMessage.type === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{otpMessage.text}</span>
                  </div>
                )}

                {/* OTP Verification Input Box */}
                {showOtpSection && (
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 space-y-3 mt-2 animate-fade-in">
                    <div>
                      <h4 className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
                        Enter 6-Digit Email OTP
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        We sent a code to <strong className="text-indigo-600">{otpSentEmail}</strong>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="••••••"
                        className="flex-1 px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base font-black tracking-widest text-center focus:outline-none focus:border-indigo-600 transition"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        disabled={isVerifyingOtp || otpCode.length < 4}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition"
                      >
                        {isVerifyingOtp ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Verify & Bind</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 active:scale-95 transition"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔍 Claim Business Search & Request Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Claim Existing Business</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Search by mobile number & request ownership</p>
                </div>
              </div>
              <button
                onClick={() => setShowClaimModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alert Messages */}
            {claimSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{claimSuccessMsg}</span>
              </div>
            )}

            {claimErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{claimErrorMsg}</span>
              </div>
            )}

            {/* Search Input Form */}
            {!user?.phone ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center space-y-2.5">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <div>
                  <h4 className="font-black text-xs text-amber-900 dark:text-amber-200">
                    Mobile Number Required
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    Claiming is strictly tied to your account mobile number. Please add your phone number in your profile first.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowClaimModal(false);
                    openEditModal();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-600/30 transition"
                >
                  + Add Mobile Number in Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSearchClaimBusiness} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Your Verified Profile Number</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                      Locked 🔒
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowClaimModal(false);
                      openEditModal();
                    }}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Edit in Profile ✏️
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      value={user.phone}
                      readOnly
                      disabled
                      placeholder="Registered mobile number"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-bold cursor-not-allowed select-none opacity-90"
                    />
                    <Phone className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
                  </div>
                  <button
                    type="submit"
                    disabled={claimSearchLoading}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition"
                  >
                    {claimSearchLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Search Listings</span>
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-400 dark:text-slate-500">
                  🔒 For safety & owner verification, you can only claim listings matching your profile number (<span className="font-bold text-slate-700 dark:text-slate-300">{user.phone}</span>).
                </p>
              </form>
            )}

            {/* Search Results List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Found Businesses ({claimResults.length})
                </span>
                <button
                  onClick={openMyClaimsModal}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View My Claim History →
                </button>
              </div>

              {claimResults.length === 0 && !claimSearchLoading && (
                <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400 space-y-1">
                  <Building2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">Search for your listing</p>
                  <p className="text-[11px]">Enter the phone number associated with the business to locate and claim it.</p>
                </div>
              )}

              <div className="space-y-2.5">
                {claimResults.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-500/40 transition space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0 overflow-hidden">
                        {b.icon_url ? (
                          <img src={b.icon_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 text-indigo-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                            {b.business_name}
                          </h4>
                          {b.category_name && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                              {b.category_name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {b.address ? `${b.address}, ${b.city || ''}` : `Phone: ${b.phone}`}
                        </p>
                      </div>
                    </div>

                    {/* Claim Action Row */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {b.phone}
                      </span>

                      {b.is_my_business ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Already in your listings
                        </span>
                      ) : b.has_pending_claim ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3.5 h-3.5" />
                          Claim Under Review
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (selectedClaimProvider?.id === b.id) {
                              handleSubmitClaim(b);
                            } else {
                              setSelectedClaimProvider(b);
                            }
                          }}
                          disabled={claimSubmittingId === b.id}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                        >
                          {claimSubmittingId === b.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Tag className="w-3.5 h-3.5" />
                          )}
                          <span>{selectedClaimProvider?.id === b.id ? 'Confirm Claim Request' : 'Claim This Business'}</span>
                        </button>
                      )}
                    </div>

                    {/* Optional Note input when selected */}
                    {selectedClaimProvider?.id === b.id && !b.is_my_business && !b.has_pending_claim && (
                      <div className="pt-2 border-t border-dashed border-indigo-200 dark:border-indigo-800 space-y-2 animate-in fade-in duration-200">
                        <label className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                          Optional Note / Proof info for Admin:
                        </label>
                        <input
                          type="text"
                          value={claimNotes}
                          onChange={(e) => setClaimNotes(e.target.value)}
                          placeholder="e.g. I am the proprietor of this shop."
                          className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📋 My Claim Requests History Modal */}
      {showMyClaimsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">My Claim Requests</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Track your business ownership approval status</p>
                </div>
              </div>
              <button
                onClick={() => setShowMyClaimsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingClaimsList ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Loading claim requests...</p>
              </div>
            ) : userClaimsList.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 space-y-1 text-xs">
                <Tag className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">No claim requests yet</p>
                <p className="text-[11px]">Use the "Claim Business" tool to search your phone number and claim your listing.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userClaimsList.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        {c.business_name}
                      </h4>
                      {c.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      ) : c.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <AlertCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          Pending Admin Review
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {c.address ? `${c.address}, ${c.city || ''}` : `Phone: ${c.business_phone}`}
                    </p>

                    {c.admin_notes && (
                      <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300 font-medium">
                        <strong>Admin Remark:</strong> {c.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🗑️ DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900/60 my-8 space-y-5 animate-scale-up relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Delete Account
                  </h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    30-Day Safe Deactivation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error & Success Feedback */}
            {deleteError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {deleteSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2 text-center animate-fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Account Deactivated Successfully</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Your account data is kept safe for 30 days. You will be logged out now.
                </p>
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mt-2"></div>
              </div>
            ) : (
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                {/* 30-Day Policy Box */}
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    How deletion works:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                    <li>Your account will be <strong>disabled immediately</strong>.</li>
                    <li>Your data will be retained for <strong>30 days</strong>.</li>
                    <li>You can restore your account within 30 days.</li>
                    <li>After 30 days, all data will be <strong>permanently deleted</strong>.</li>
                  </ul>
                </div>

                {/* Registered Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your Account Email
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold">
                    {user?.email || 'No email provided'}
                  </div>
                </div>

                {/* Reason Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Reason for leaving (Optional)
                  </label>
                  <select
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
                  >
                    <option value="No longer need this app">No longer need this app</option>
                    <option value="Found a better alternative">Found a better alternative</option>
                    <option value="Privacy or security concern">Privacy or security concern</option>
                    <option value="Temporary break">Temporary break (will return)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {deleteReason === 'Other' && (
                  <textarea
                    rows={2}
                    value={deleteCustomReason}
                    onChange={(e) => setDeleteCustomReason(e.target.value)}
                    placeholder="Tell us what we could improve..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition resize-none"
                  />
                )}

                {/* Type DELETE to Confirm */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Type <span className="font-black underline">DELETE</span> to confirm:
                  </label>
                  <input
                    type="text"
                    required
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition uppercase"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isDeleting || deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 active:scale-95 transition"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>Deactivate & Delete</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

