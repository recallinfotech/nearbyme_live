import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { deleteUserAccount, restoreUserAccount } from '../services/api';
import {
  ShieldAlert,
  ArrowLeft,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Mail,
  HelpCircle,
  Info,
  ShieldCheck
} from 'lucide-react';

export const DeleteAccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'delete' | 'restore'>('delete');
  const [email, setEmail] = useState(user?.email || '');
  const [reason, setReason] = useState('No longer need this app');
  const [customReason, setCustomReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const reasonsList = [
    'No longer need this app',
    'Found a better alternative',
    'Privacy or data concerns',
    'Too many notifications/emails',
    'Temporary break (will return)',
    'Other'
  ];

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }

    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      setErrorMsg('Please type DELETE in capital letters to confirm.');
      return;
    }

    const finalReason = reason === 'Other' ? customReason : reason;

    setLoading(true);
    setErrorMsg(null);
    setSuccessData(null);

    try {
      const res = await deleteUserAccount({
        email: email.trim(),
        reason: finalReason
      });

      if (res.data?.status) {
        setSuccessData(res.data);
        if (user && user.email === email.trim()) {
          setTimeout(async () => {
            await logout();
          }, 3500);
        }
      } else {
        setErrorMsg(res.data?.message || 'Failed to process account deletion.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to deactivate account. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessData(null);

    try {
      const res = await restoreUserAccount({
        email: email.trim()
      });

      if (res.data?.status) {
        setSuccessData(res.data);
      } else {
        setErrorMsg(res.data?.message || 'Failed to restore account.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Could not find a deactivated account with this email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>Account Management</span>
          </h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-200 dark:bg-slate-800/70 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('delete');
              setErrorMsg(null);
              setSuccessData(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              activeTab === 'delete'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete / Deactivate Account</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('restore');
              setErrorMsg(null);
              setSuccessData(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              activeTab === 'restore'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restore Account</span>
          </button>
        </div>

        {/* 30-Day Policy Alert Box */}
        <div className="p-4.5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Clock className="w-4.5 h-4.5 shrink-0" />
            <span>30-Day Soft-Delete & Safety Grace Period</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            When you request account deletion, your account is <strong>disabled immediately</strong>.
            Your data is preserved safely for <strong>30 days</strong>. If you change your mind, you can restore your account at any time within 30 days. After 30 days, your data is <strong>permanently purged</strong>.
          </p>
        </div>

        {/* Success Alert */}
        {successData && (
          <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-3 animate-scale-up">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successData.message}</span>
            </div>

            {successData.data?.scheduled_permanent_deletion_at && (
              <div className="text-xs space-y-1 bg-white dark:bg-slate-900/80 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
                <p>
                  <strong>Account Status:</strong> Disabled
                </p>
                <p>
                  <strong>Scheduled Permanent Deletion:</strong>{' '}
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    {successData.data.scheduled_permanent_deletion_at}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500">
                  You will be logged out automatically. You can restore this account before the deletion date.
                </p>
              </div>
            )}

            {activeTab === 'restore' && (
              <div className="pt-2">
                <button
                  onClick={() => navigate('/auth/login')}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                >
                  Go to Login Now →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Delete Form */}
        {activeTab === 'delete' && !successData && (
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Request Account Deletion
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Confirm your registered email address to deactivate your account.
              </p>
            </div>

            <form onSubmit={handleDeleteSubmit} className="space-y-4">
              {/* Registered Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Registered Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
                />
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Why are you deleting your account? (Optional)
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
                >
                  {reasonsList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {reason === 'Other' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Please specify your reason:
                  </label>
                  <textarea
                    rows={2}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Tell us why you want to leave..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition resize-none"
                  />
                </div>
              )}

              {/* What will happen box */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-500" />
                  What will happen next:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>You will be logged out of all devices immediately.</li>
                  <li>Your listings, bookmarks, and unlocked leads will be hidden.</li>
                  <li>You have 30 calendar days to restore your account.</li>
                  <li>After 30 days, your data will be permanently purged and unrecoverable.</li>
                </ul>
              </div>

              {/* Confirmation Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Type <span className="underline font-black tracking-wider">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full px-4 py-3 rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition uppercase"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-1/3 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || confirmText.trim().toUpperCase() !== 'DELETE'}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 active:scale-95 transition"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Deactivate & Delete Account</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Restore Form */}
        {activeTab === 'restore' && !successData && (
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Restore Deactivated Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                If your account was deactivated within the last 30 days, enter your email to reactivate it.
              </p>
            </div>

            <form onSubmit={handleRestoreSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Registered Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Restore & Reactivate My Account</span>
              </button>
            </form>
          </div>
        )}

        {/* Compliance Footer Note */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 text-slate-500">
          <p className="text-xs font-medium">
            Need help or have questions regarding your data rights?
          </p>
          <p className="text-xs">
            Contact our Privacy Officer at{' '}
            <a href="mailto:info@recallinfotech.com" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">
              info@recallinfotech.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default DeleteAccountPage;
