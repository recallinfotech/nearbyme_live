import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem } from '../services/storage';
import { getProfile, getWallet, logoutUser, IMAGE_BASE_URL } from '../services/api';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

export interface UserProfile {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  email_verified?: string | boolean;
  phone?: string;
  role?: string;
  avatar?: string;
  profile_image?: string;
  profile_image_url?: string;
  wallet_balance?: number;
  is_partner?: boolean | number;
  is_provider?: boolean | number;
  provider_status?: string;
}

export interface WelcomeBonusState {
  show: boolean;
  amount: number;
  message?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  welcomeBonus: WelcomeBonusState;
  showWelcomeBonusModal: (amount?: number, message?: string) => void;
  closeWelcomeBonusModal: () => void;
  login: (
    userData: UserProfile,
    tokenString: string,
    bonusInfo?: { awarded?: boolean; amount?: number; message?: string }
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateWalletBalance: (newBalance: number) => Promise<void>;
  updateUser: (updatedData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  welcomeBonus: { show: false, amount: 10 },
  showWelcomeBonusModal: () => {},
  closeWelcomeBonusModal: () => {},
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  updateWalletBalance: async () => {},
  updateUser: async () => {},
});

const normalizeAvatar = (data: any): string | undefined => {
  if (!data) return undefined;
  const raw = data.profile_image_url || data.avatar || data.profile_image;
  if (!raw || typeof raw !== 'string') return undefined;
  if (raw.startsWith('http') || raw.startsWith('data:')) return raw;
  return `${IMAGE_BASE_URL}storage/${raw.replace(/^\//, '')}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [welcomeBonus, setWelcomeBonus] = useState<WelcomeBonusState>({
    show: false,
    amount: 10,
    message: '',
  });

  const showWelcomeBonusModal = (amount: number = 10, message: string = '') => {
    setWelcomeBonus({
      show: true,
      amount: Number(amount) || 10,
      message,
    });
  };

  const closeWelcomeBonusModal = () => {
    setWelcomeBonus((prev) => ({ ...prev, show: false }));
  };

  const refreshProfile = useCallback(async () => {
    try {
      const storedUser = await getStorageItem<UserProfile>('user_info');
      if (!storedUser?.id) return;

      const [pRes, wRes] = await Promise.all([
        getProfile(storedUser.id).catch(() => null),
        getWallet(storedUser.id).catch(() => null),
      ]);

      setUser((prev) => {
        let updated: UserProfile = { ...(storedUser || {}), ...(prev || {}) } as UserProfile;
        if (pRes?.data?.data) {
          updated = { ...updated, ...pRes.data.data };
        }
        if (wRes?.data?.data) {
          const bal = wRes.data.data.balance ?? wRes.data.data.wallet_balance;
          if (bal !== undefined && bal !== null) {
            updated.wallet_balance = Number(bal);
          }
        }
        const av = normalizeAvatar(updated);
        if (av) {
          updated.avatar = av;
          updated.profile_image_url = av;
        }
        setStorageItem('user_info', updated);
        return updated;
      });
    } catch (err) {
      console.error('Failed to sync wallet/profile:', err);
    }
  }, []);

  const updateWalletBalance = async (newBalance: number) => {
    if (!user) return;
    const updated = { ...user, wallet_balance: Number(newBalance) };
    setUser(updated);
    await setStorageItem('user_info', updated);
  };

  const updateUser = async (updatedData: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...updatedData } as UserProfile;
      const av = normalizeAvatar(updated);
      if (av) {
        updated.avatar = av;
        updated.profile_image_url = av;
      }
      setStorageItem('user_info', updated);
      return updated;
    });
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await getStorageItem<string>('user_token');
        const storedUser = await getStorageItem<UserProfile>('user_info');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          
          if (storedUser.id) {
            Promise.all([
              getProfile(storedUser.id).catch(() => null),
              getWallet(storedUser.id).catch(() => null),
            ]).then(([pRes, wRes]) => {
              let updated = { ...storedUser };
              if (pRes?.data?.data) {
                updated = { ...updated, ...pRes.data.data };
              }
              if (wRes?.data?.data) {
                const bal = wRes.data.data.balance ?? wRes.data.data.wallet_balance;
                if (bal !== undefined && bal !== null) {
                  updated.wallet_balance = Number(bal);
                }
              }
              setUser(updated);
              setStorageItem('user_info', updated);
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (
    userData: UserProfile,
    tokenString: string,
    bonusInfo?: { awarded?: boolean; amount?: number; message?: string }
  ) => {
    setUser(userData);
    setToken(tokenString);
    await setStorageItem('user_token', tokenString);
    await setStorageItem('user_info', userData);

    // If a welcome bonus was awarded during this login/registration, display celebration modal
    if (bonusInfo?.awarded) {
      showWelcomeBonusModal(bonusInfo.amount || 10, bonusInfo.message);
    }

    // Immediately fetch latest server wallet balance upon login
    if (userData.id) {
      try {
        const wRes = await getWallet(userData.id);
        if (wRes.data?.data) {
          const bal = wRes.data.data.balance ?? wRes.data.data.wallet_balance;
          if (bal !== undefined && bal !== null) {
            const updated = { ...userData, wallet_balance: Number(bal) };
            setUser(updated);
            await setStorageItem('user_info', updated);
          }
        }
      } catch (e) {}
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error("Logout API error:", e);
    } finally {
      if (Capacitor.isNativePlatform()) {
        try {
          await GoogleAuth.initialize({
            clientId: "18877084295-371asi0j4habfre4r992hti1ivlhvnj3.apps.googleusercontent.com",
            scopes: ['profile', 'email'],
          });
          await GoogleAuth.signOut().catch(() => {});
        } catch (gErr) {
          console.warn("GoogleAuth logout reset info:", gErr);
        }
      }
      setUser(null);
      setToken(null);
      await removeStorageItem('user_token');
      await removeStorageItem('user_info');
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (cErr) {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        welcomeBonus,
        showWelcomeBonusModal,
        closeWelcomeBonusModal,
        login,
        logout,
        refreshProfile,
        updateWalletBalance,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
