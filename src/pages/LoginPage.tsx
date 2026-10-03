import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { loginUser, forgotPassword, resetPassword, restoreUserAccount } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, RefreshCw, AlertCircle, KeyRound, CheckCircle2, ArrowLeft, X, ShieldAlert, Clock } from 'lucide-react';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { motion, AnimatePresence } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<string | null>(null);
  const [disabledAccountInfo, setDisabledAccountInfo] = useState<{ email: string; message: string } | null>(null);
  const [restoringAccount, setRestoringAccount] = useState(false);

  // 🔑 Forgot Password States
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'success'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setDisabledAccountInfo(null);
    try {
      const res = await loginUser({
        email: emailOrPhone,
        password: password,
      });

      if (res.data?.status || res.data?.token || res.data?.data) {
        const token = res.data.token || res.data.data?.token || 'user_jwt_token';
        const userObj = res.data.user || res.data.data?.user || res.data.data;
        await login(userObj, token, {
          awarded: res.data?.bonus_awarded,
          amount: res.data?.bonus_amount,
          message: res.data?.bonus_message,
        });
        navigate('/');
      } else {
        setErrorMsg(res.data?.message || 'Invalid credentials.');
      }
    } catch (err: any) {
      if (err.response?.data?.is_disabled) {
        setDisabledAccountInfo({
          email: emailOrPhone.trim(),
          message: err.response.data.message || 'Your account is deactivated and scheduled for deletion.'
        });
      } else {
        setErrorMsg(err.response?.data?.message || 'Login failed. Check your input.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromLogin = async () => {
    if (!disabledAccountInfo?.email) return;
    setRestoringAccount(true);
    setErrorMsg(null);
    try {
      const res = await restoreUserAccount({ email: disabledAccountInfo.email });
      if (res.data?.status) {
        setLoginSuccessMsg('Account restored successfully! Please click Login to continue.');
        setDisabledAccountInfo(null);
      } else {
        setErrorMsg(res.data?.message || 'Failed to restore account.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to restore account.');
    } finally {
      setRestoringAccount(false);
    }
  };

  // 1. Send OTP to email for password reset
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your registered email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);
    try {
      const res = await forgotPassword({ email: forgotEmail.trim() });
      if (res.data?.status || res.data?.success) {
        setForgotStep('otp');
        setForgotSuccess(res.data?.message || 'OTP sent to your email address.');
      } else {
        setForgotError(res.data?.message || 'Email not found in our records.');
      }
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  // 2. Verify OTP & set new password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp) {
      setForgotError('Please enter the 6-digit OTP code.');
      return;
    }
    if (newPassword.length < 4) {
      setForgotError('New password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await resetPassword({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        password: newPassword,
      });

      if (res.data?.status || res.data?.success) {
        setForgotStep('success');
        setForgotSuccess('Your password has been reset successfully!');
      } else {
        setForgotError(res.data?.message || 'Invalid OTP code. Please try again.');
      }
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Password reset failed. Check OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setIsForgotOpen(false);
    setForgotStep('email');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError(null);
    setForgotSuccess(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-black mx-auto shadow-lg shadow-indigo-600/30">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">{t('login')}</h1>
          <p className="text-xs text-slate-400">{t('loginToManage')}</p>
        </div>

        {/* Google Login Component */}
        <div className="space-y-2">
          <GoogleSignInButton onError={(err) => setErrorMsg(err)} />
          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">OR</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>
        </div>

        {disabledAccountInfo && (
          <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-600/50 text-amber-200 text-xs space-y-3 animate-scale-up">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-300">Account Deactivated</p>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  {disabledAccountInfo.message}
                </p>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestoreFromLogin}
                disabled={restoringAccount}
                className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95"
              >
                {restoringAccount ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Restore My Account</span>
              </button>

              <button
                type="button"
                onClick={() => setDisabledAccountInfo(null)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {errorMsg && !disabledAccountInfo && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loginSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{loginSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">{t('enterEmailOrPhone')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                placeholder="name@domain.com / Mobile"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-semibold">{t('enterPassword')}</label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(emailOrPhone.includes('@') ? emailOrPhone : '');
                  setForgotStep('email');
                  setForgotError(null);
                  setForgotSuccess(null);
                  setIsForgotOpen(true);
                }}
                className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition hover:underline"
              >
                {t('forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-lg shadow-indigo-600/30"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('login')}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          {t('dontHaveAccount')}{' '}
          <Link to="/auth/register" className="text-indigo-400 font-semibold hover:underline">
            {t('register')}
          </Link>
        </div>

        {/* Legal Links Footer */}
        <div className="pt-2 border-t border-slate-900 text-center text-[11px] text-slate-500">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-slate-400 hover:text-indigo-400 underline underline-offset-2 transition">
            Terms
          </Link>{' '}
          &amp;{' '}
          <Link to="/privacy" className="text-slate-400 hover:text-indigo-400 underline underline-offset-2 transition">
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* 🔐 FORGOT PASSWORD MODAL */}
      <AnimatePresence>
        {isForgotOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 text-slate-100 relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeForgotModal}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {forgotStep === 'success' ? 'Password Reset Complete' : 'Reset Password'}
                </h3>
                <p className="text-xs text-slate-400">
                  {forgotStep === 'email' && 'Enter your registered email to receive an OTP'}
                  {forgotStep === 'otp' && `Enter the OTP sent to ${forgotEmail} & set new password`}
                  {forgotStep === 'success' && 'Your password has been changed successfully.'}
                </p>
              </div>

              {/* Alert Messages */}
              {forgotError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && forgotStep !== 'success' && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {/* STEP 1: Enter Email */}
              {forgotStep === 'email' && (
                <form onSubmit={handleSendForgotOtp} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Registered Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="youremail@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-lg shadow-indigo-600/30"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sending Reset Code...
                      </>
                    ) : (
                      'Send OTP to Email'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
                  >
                    Cancel & Back to Login
                  </button>
                </form>
              )}

              {/* STEP 2: Enter OTP & New Password */}
              {forgotStep === 'otp' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">6-Digit OTP Code</label>
                    <input
                      type="text"
                      required
                      placeholder="123456"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      maxLength={6}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-center text-lg tracking-widest focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        required
                        placeholder="At least 4 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep('email')}
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                      <ArrowLeft className="w-3 h-3" /> Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleSendForgotOtp}
                      disabled={forgotLoading}
                      className="text-indigo-400 hover:underline font-semibold"
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-lg shadow-emerald-600/30"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Set New Password'
                    )}
                  </button>
                </form>
              )}

              {/* STEP 3: Success Confirmation */}
              {forgotStep === 'success' && (
                <div className="text-center space-y-4 py-2">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="text-xs text-slate-300">
                    Your password has been successfully updated. You can now login with your new credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeForgotModal();
                      setEmailOrPhone(forgotEmail);
                      setLoginSuccessMsg('Password reset successfully! Please login.');
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
