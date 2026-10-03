import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { partnerEarnings, partnerSettlementSummary, partnerDashboard } from '../services/api';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Wallet,
  RefreshCw,
  Award,
  ChevronRight
} from 'lucide-react';

export const PartnerEarningsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [earnings, setEarnings] = useState<any | null>(null);
  const [settlementSummary, setSettlementSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEarningsData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [dashRes, earnRes, setRes] = await Promise.all([
        partnerDashboard(user.id).catch(() => ({ data: { data: null } })),
        partnerEarnings(user.id).catch(() => ({ data: { data: null } })),
        partnerSettlementSummary(user.id).catch(() => ({ data: { data: null } })),
      ]);

      if (dashRes.data?.data) setDashboardData(dashRes.data.data);
      if (earnRes.data?.data) setEarnings(earnRes.data.data);
      if (setRes.data?.data) setSettlementSummary(setRes.data.data);
    } catch (err) {
      console.error("Error fetching partner earnings history:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEarningsData();
  }, [fetchEarningsData]);

  const providerStatus = dashboardData?.provider_status || user?.provider_status || 'none';
  const isApproved = providerStatus === 'approved' || user?.is_partner === 1 || user?.is_provider === 1;

  useEffect(() => {
    if (!loading && dashboardData && providerStatus === 'pending' && !isApproved) {
      navigate('/partner');
    }
  }, [loading, dashboardData, providerStatus, isApproved, navigate]);

  const totalEarnings = dashboardData?.balance ?? 0;
  const settledAmount = settlementSummary?.total_settled ?? settlementSummary?.settled_amount ?? dashboardData?.total_settled ?? dashboardData?.settled_amount ?? 0;

  const historyList: any[] = Array.isArray(earnings)
    ? earnings
    : Array.isArray(earnings?.history)
    ? earnings.history
    : Array.isArray(earnings?.data)
    ? earnings.data
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/partner')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('partnerDashboard')}</span>
          </button>

          <button
            onClick={() => navigate('/partner/withdraw')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 active:scale-95 transition"
          >
            <Wallet className="w-4 h-4" />
            <span>{t('partnerWithdraw')}</span>
          </button>
        </div>

        {/* Title Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <span>{t('partnerEarnings')}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              {t('earningsHistory')}
            </p>
          </div>

          <button
            onClick={fetchEarningsData}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs active:scale-95 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Total Earnings Gradient Card */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-rose-600 via-indigo-600 to-purple-800 text-white shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="space-y-0.5 z-10">
            <span className="text-[10px] font-semibold text-amber-100 uppercase tracking-widest block">
              {t('totalEarnings')}
            </span>
            <p className="text-xl sm:text-2xl font-bold text-white">₹{Number(totalEarnings).toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-amber-100 font-normal pt-0.5">
              Settled Amount: ₹{Number(settledAmount).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-sm z-10">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Earnings History List */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
            {t('transactionHistory')}
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
              <span>{t('loading')}</span>
            </div>
          ) : historyList.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-2xs">
              {historyList.map((item, idx) => (
                <div key={item.id || idx} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white block">
                      {item.title || item.business_name || t('partnerEarnings')}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {item.created_at || item.date || ''}
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                    +₹{item.amount || item.earnings || 0}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400 space-y-2">
              <Award className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">{t('noDataFound')}</p>
              <p className="text-[11px]">{t('earningsHistory')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default PartnerEarningsPage;
