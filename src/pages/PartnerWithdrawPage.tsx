import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { partnerWithdraw, checkPendingWithdraw, partnerDashboard } from '../services/api';
import {
  ArrowLeft,
  Wallet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export const PartnerWithdrawPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [pendingWithdraw, setPendingWithdraw] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUpi, setWithdrawUpi] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchWithdrawStatus = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [dashRes, pendRes] = await Promise.all([
        partnerDashboard(user.id).catch(() => ({ data: { data: null } })),
        checkPendingWithdraw(user.id).catch(() => ({ data: { data: null } })),
      ]);

      if (dashRes.data?.data) setDashboardData(dashRes.data.data);
      if (pendRes.data?.data) setPendingWithdraw(pendRes.data.data);
    } catch (err) {
      console.error("Error checking pending payout:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWithdrawStatus();
  }, [fetchWithdrawStatus]);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      alert("Enter a valid withdrawal amount");
      return;
    }

    setSubmitting(true);
    setMsg(null);
    try {
      const res = await partnerWithdraw({
        user_id: user.id,
        amount: amt,
        upi_id: withdrawUpi,
      });

      if (res.data?.status || res.data?.success) {
        setMsg(res.data?.message || t('withdrawSuccess'));
        setWithdrawAmount('');
        await fetchWithdrawStatus();
      } else {
        setMsg(res.data?.message || 'Withdrawal request failed.');
      }
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Error processing payout request.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalEarnings = dashboardData?.balance ?? 0;
  const settledAmount = dashboardData?.total_settled ?? dashboardData?.settled_amount ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/partner')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('partnerDashboard')}</span>
          </button>

          <button
            onClick={() => navigate('/partner/earnings')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 shadow-sm transition"
          >
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>{t('partnerEarnings')}</span>
          </button>
        </div>

        {/* Title Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>{t('partnerWithdraw')}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {t('withdrawMinNote')}
            </p>
          </div>

          <button
            onClick={fetchWithdrawStatus}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-2xs active:scale-95 transition"
            title="Refresh Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Available Balance Stat Card */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-purple-200 uppercase tracking-widest block">{t('availableBalance')}</span>
            <p className="text-xl sm:text-2xl font-bold text-white">₹{Number(totalEarnings).toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-purple-100 font-normal pt-0.5">
              Settled Amount: ₹{Number(settledAmount).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Main Content Box */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          {pendingWithdraw ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t('pendingAmount')}</span>
              </div>
              <p className="font-normal leading-relaxed">
                You have an active pending payout request of <strong className="font-semibold text-amber-700 dark:text-amber-200">₹{pendingWithdraw.amount}</strong> via <span className="underline">{pendingWithdraw.upi_id || 'UPI'}</span>.
              </p>
            </div>
          ) : (
            <>
              {msg && (
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{msg}</span>
                </div>
              )}

              <form onSubmit={handleWithdrawSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">{t('enterAmount')} (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-semibold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">{t('upiId')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9760790777@upi"
                    value={withdrawUpi}
                    onChange={(e) => setWithdrawUpi(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('submitting')}</span>
                    </>
                  ) : (
                    <span>{t('withdrawNow')}</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
export default PartnerWithdrawPage;
