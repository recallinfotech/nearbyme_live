import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getWallet, getTransactions, createOrder, verifyPayment, addMoney } from '../services/api';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// 🇮🇳 INDIAN DATE FORMATTER
const formatIndianDateTime = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    const isoString = dateString.replace(" ", "T");
    const date = new Date(isoString);

    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate().toString().padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  } catch {
    return dateString;
  }
};

export const WalletPage: React.FC = () => {
  const { user, refreshProfile, updateWalletBalance } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [balance, setBalance] = useState<number>(user?.wallet_balance || 0);
  const [rawTransactions, setRawTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [payMsg, setPayMsg] = useState<string | null>(null);

  // 🔍 FILTER STATES
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [wRes, txRes] = await Promise.all([
        getWallet(user.id).catch(() => ({ data: { data: null } })),
        getTransactions(user.id).catch(() => ({ data: { data: [] } })),
      ]);

      if (wRes.data?.data) {
        const bal = wRes.data.data.balance ?? wRes.data.data.wallet_balance ?? 0;
        setBalance(Number(bal));
        updateWalletBalance(Number(bal));
      }

      if (txRes.data?.data) {
        const fetchedList = Array.isArray(txRes.data.data) ? txRes.data.data : (txRes.data.data.data || []);
        setRawTransactions(fetchedList);
        applyFilters(fetchedList, filterType);
      }
    } catch (e) {
      console.error("Wallet Load Error:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyFilters = (list: any[], type: "all" | "credit" | "debit") => {
    let result = [...list];
    if (type !== "all") {
      result = result.filter((item) => item.type?.toLowerCase() === type);
    }
    setFilteredTransactions(result);
  };

  useEffect(() => {
    applyFilters(rawTransactions, filterType);
  }, [filterType, rawTransactions]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAddMoney = async (amountParam?: number) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const finalAmount = amountParam || Number(customAmount) || selectedAmount;
    if (!finalAmount || finalAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setProcessingPayment(true);
    setPayMsg(null);

    try {
      // 1. Create Razorpay Order via API
      const orderRes = await createOrder({
        user_id: user.id,
        amount: finalAmount,
      });

      const resData = orderRes.data || {};
      const key = resData.key || resData.razorpay_key || resData.data?.key || "rzp_test_placeholder";
      const orderId = resData.order_id || resData.id || resData.data?.order_id || resData.data?.id;

      // Ensure Razorpay SDK script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        // Fallback to direct addMoney if Razorpay script fails to load
        const directAdd = await addMoney({ user_id: user.id, amount: finalAmount });
        if (directAdd.data?.status || directAdd.data?.success) {
          setPayMsg(`🪙 ${finalAmount} Credits Added Successfully!`);
          await refreshProfile();
          await loadData();
          setCustomAmount('');
          return;
        }
        alert("Unable to load Razorpay Payment Gateway. Please check network connection.");
        return;
      }

      // 2. Configure Razorpay Checkout Options
      const options = {
        key: key,
        amount: resData.amount || resData.data?.amount || (finalAmount * 100),
        currency: 'INR',
        name: 'Nearby App',
        description: 'Wallet Credits Recharge',
        order_id: orderId,
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        theme: {
          color: '#6B38FB',
        },
        handler: async (response: any) => {
          try {
            setProcessingPayment(true);
            const verifyRes = await verifyPayment({
              user_id: user.id,
              amount: finalAmount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.status || verifyRes.data?.success) {
              setPayMsg(`🎉 Payment Successful! 🪙 ${finalAmount} Credits Added.`);
              await refreshProfile();
              await loadData();
              setCustomAmount('');
            } else {
              alert(verifyRes.data?.message || 'Payment verification failed on server.');
            }
          } catch (err: any) {
            alert(err.response?.data?.message || 'Payment verification error.');
          } finally {
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error("Razorpay Add Money Error:", e);
      alert(e.response?.data?.message || 'Something went wrong while initiating payment.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Navigation Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t('creditWallet')}</h1>
        </div>

        {!user ? (
          <div className="bg-white dark:bg-slate-900 p-6 text-center rounded-2xl space-y-3 border border-slate-200 dark:border-slate-800 shadow-sm">
            <WalletIcon className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('loginToManage')}</h3>
            <button
              onClick={() => navigate('/auth/login')}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
            >
              {t('loginRegister')}
            </button>
          </div>
        ) : (
          <>
            {/* Balance Card */}
            <div className="rounded-2xl p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                    <WalletIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-300 block">{t('availableBalance')}</span>
                    <p className="text-xl font-bold text-white">🪙 {Number(balance).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* QUICK CHIPS */}
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition border ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    + 🪙{amt}
                  </button>
                ))}
              </div>

              {/* CUSTOM AMOUNT */}
              <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 space-x-2">
                <span className="text-sm font-bold text-amber-400">🪙</span>
                <input
                  type="number"
                  placeholder={t('enterAmount')}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-white focus:outline-none placeholder-slate-400"
                />
              </div>

              {/* ADD CREDIT BUTTON */}
              <button
                onClick={() => handleAddMoney()}
                disabled={processingPayment}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition"
              >
                {processingPayment ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{processingPayment ? t('loading') : t('addCredits')}</span>
              </button>
            </div>

            {payMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
                <span>{payMsg}</span>
                <button onClick={() => setPayMsg(null)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* TRANSACTIONS LIST */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('transactionHistory')}</h2>

                <div className="flex items-center gap-1">
                  {['all', 'credit', 'debit'].map((tType) => (
                    <button
                      key={tType}
                      onClick={() => setFilterType(tType as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition ${
                        filterType === tType
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {tType === 'all' ? t('all') : tType}
                    </button>
                  ))}
                </div>
              </div>

              {/* COMPACT LIST ROWS */}
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">{t('loading')}</div>
              ) : filteredTransactions.length > 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
                  {filteredTransactions.map((item, idx) => {
                    const isDebit = item.type === 'debit';

                    return (
                      <div key={item.id || idx} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {isDebit ? (
                            <ArrowDownLeft className="w-4 h-4 text-rose-500 shrink-0" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                              {item.remark || item.description || t('walletBalance')}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {formatIndianDateTime(item.created_at)}
                            </span>
                          </div>
                        </div>

                        <span className={`font-bold ${isDebit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {isDebit ? '-' : '+'} 🪙{Number(item.amount).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 p-6 text-center rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  {t('noDataFound')}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
export default WalletPage;
