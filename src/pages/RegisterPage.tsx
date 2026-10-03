import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { registerUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await registerUser({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
      });
      if (res.data?.status || res.data?.token || res.data?.data) {
        const token = res.data.token || res.data.data?.token || 'user_jwt_token';
        const rawUser = res.data.user || res.data.data?.user || res.data.data;
        const userObj = {
          id: rawUser?.id || Date.now(),
          name: rawUser?.name || `${rawUser?.first_name || firstName} ${rawUser?.last_name || lastName}`.trim() || 'User',
          email: rawUser?.email || email,
          phone: rawUser?.phone || phone,
          is_partner: rawUser?.is_partner ?? 0,
          is_provider: rawUser?.is_provider ?? 0,
          provider_status: rawUser?.provider_status ?? 'none',
        };
        await login(userObj, token, {
          awarded: res.data?.bonus_awarded,
          amount: res.data?.bonus_amount,
          message: res.data?.bonus_message,
        });
        navigate('/');
      } else {
        setErrorMsg(res.data?.message || 'Registration failed.');
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat()[0] : null);
      setErrorMsg(typeof serverMsg === 'string' ? serverMsg : 'Error completing registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-black mx-auto shadow-lg shadow-indigo-600/30">
            N
          </div>
          <h1 className="text-2xl font-bold text-white">{t('register')}</h1>
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

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">{t('enterName')} *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">{t('name')}</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">{t('mobileNumber')} *</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">{t('emailAddress')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">{t('enterPassword')} *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
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
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('register')}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/auth/login" className="text-indigo-400 font-semibold hover:underline">
            {t('login')}
          </Link>
        </div>

        {/* Legal Links Footer */}
        <div className="pt-2 border-t border-slate-900 text-center text-[11px] text-slate-500">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-slate-400 hover:text-indigo-400 underline underline-offset-2 transition">
            Terms
          </Link>{' '}
          &amp;{' '}
          <Link to="/privacy" className="text-slate-400 hover:text-indigo-400 underline underline-offset-2 transition">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
