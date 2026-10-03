import React, { useEffect, useState } from 'react';
import { googleLoginUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = "18877084295-371asi0j4habfre4r992hti1ivlhvnj3.apps.googleusercontent.com";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onError }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const processGoogleAuth = async (googlePayload: {
    google_id: string;
    email: string;
    first_name: string;
    last_name: string;
  }) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      console.log("Sending googlePayload to /google-login:", googlePayload);
      const res = await googleLoginUser(googlePayload);
      console.log("Response from /google-login:", res.data);

      const data = res.data;
      if (data?.status || data?.token || data?.data || res.status === 200) {
        const rawUser = data?.data || data?.user || data;
        const userObj = {
          id: rawUser?.id || Date.now(),
          name: rawUser?.name || `${rawUser?.first_name || ''} ${rawUser?.last_name || ''}`.trim() || `${googlePayload.first_name} ${googlePayload.last_name}`.trim() || 'Google User',
          email: rawUser?.email || googlePayload.email,
          phone: rawUser?.phone || '',
          avatar: rawUser?.avatar || rawUser?.image || '',
          is_partner: rawUser?.is_partner ?? 0,
          is_provider: rawUser?.is_provider ?? 0,
          provider_status: rawUser?.provider_status ?? 'none',
        };
        const token = data?.token || data?.data?.token || data?.access_token || 'google_user_token_' + Date.now();

        await login(userObj, token, {
          awarded: data?.bonus_awarded ?? res.data?.bonus_awarded,
          amount: data?.bonus_amount ?? res.data?.bonus_amount,
          message: data?.bonus_message ?? res.data?.bonus_message,
        });
        if (onSuccess) onSuccess();

        navigate('/', { replace: true });
        return true;
      } else {
        const msg = data?.message || 'Google Login failed on server.';
        setErrorMsg(msg);
        if (onError) onError(msg);
        return false;
      }
    } catch (err: any) {
      console.error("processGoogleAuth error:", err);
      const msg = err.response?.data?.message || err.message || 'Google Login error.';
      setErrorMsg(msg);
      if (onError) onError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNativeSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      try {
        await GoogleAuth.initialize({
          clientId: GOOGLE_CLIENT_ID,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
        // Safely sign out any previous cached session so Google displays all accounts
        await GoogleAuth.signOut().catch(() => {});
      } catch (initErr) {
        console.warn("GoogleAuth initialize warning:", initErr);
      }

      const googleUser = await GoogleAuth.signIn();
      console.log("Native Google Sign In success:", googleUser);

      await processGoogleAuth({
        google_id: googleUser.id || googleUser.authentication?.idToken || '',
        email: googleUser.email,
        first_name: googleUser.givenName || googleUser.name?.split(' ')[0] || 'GoogleUser',
        last_name: googleUser.familyName || googleUser.name?.split(' ').slice(1).join(' ') || '',
      });
    } catch (err: any) {
      console.error("Native Google Sign-In error:", err);
      const errDetail = typeof err === 'string' ? err : err?.message || JSON.stringify(err);
      if (errDetail.indexOf('cancelled') === -1 && errDetail.indexOf('12501') === -1) {
        let msg = `Google Sign-In Error: ${errDetail}`;
        if (errDetail.includes('Something went wrong') || errDetail.includes('10')) {
          msg = "Google Auth Error (Code 10): Android SHA-1 fingerprint needs to be added in Google Cloud Console.";
        }
        setErrorMsg(msg);
        if (onError) onError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isNative) {
      try {
        GoogleAuth.initialize({
          clientId: GOOGLE_CLIENT_ID,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      } catch (e) {
        console.warn("GoogleAuth initial setup warning:", e);
      }
      return;
    }

    // Web Fallback
    const parseJwt = (token: string) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch {
        return null;
      }
    };

    const handleCredentialResponse = async (response: any) => {
      if (!response?.credential) return;
      const decodedToken = parseJwt(response.credential);
      if (!decodedToken) {
        if (onError) onError('Could not parse Google user details');
        return;
      }

      await processGoogleAuth({
        google_id: decodedToken.sub,
        email: decodedToken.email,
        first_name: decodedToken.given_name || decodedToken.name || 'GoogleUser',
        last_name: decodedToken.family_name || '',
      });
    };

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
          });

          const btnDiv = document.getElementById('googleSignInBtn');
          if (btnDiv) {
            btnDiv.innerHTML = '';
            window.google.accounts.id.renderButton(btnDiv, {
              theme: 'filled_dark',
              size: 'large',
              width: '100%',
              shape: 'pill',
              text: 'continue_with',
            });
          }

          window.google.accounts.id.prompt();
        } catch (e) {
          console.error("GSI init error:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isNative, login, navigate, onSuccess, onError]);

  return (
    <div className="w-full my-3 space-y-2">
      {errorMsg && !onError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center leading-relaxed">
          {errorMsg}
        </div>
      )}

      {isNative ? (
        <button
          type="button"
          onClick={handleNativeSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-medium text-sm transition-all shadow-md active:scale-95 border border-slate-700/80 disabled:opacity-50"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.6-.7-1-1.6-1-2.5z" />
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2l-3.7 2.9C3.7 20.4 7.5 23 12 23z" />
          </svg>
          <span>{loading ? 'Signing in with Google...' : 'Continue with Google'}</span>
        </button>
      ) : (
        <div id="googleSignInBtn" className="w-full flex justify-center min-h-[44px]"></div>
      )}

      {loading && !isNative && (
        <p className="text-center text-xs text-indigo-400 font-semibold animate-pulse">
          Authenticating with Google...
        </p>
      )}
    </div>
  );
};
