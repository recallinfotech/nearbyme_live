import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { HomePage } from './pages/HomePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProvidersPage } from './pages/ProvidersPage';
import { ProviderDetailPage } from './pages/ProviderDetailPage';
import { EventsPage } from './pages/EventsPage';
import { AddEventPage } from './pages/AddEventPage';
import { EditEventPage } from './pages/EditEventPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { PartnerPage } from './pages/PartnerPage';
import { AddBusinessPage } from './pages/AddBusinessPage';
import { EditBusinessPage } from './pages/EditBusinessPage';
import { MyBusinessesPage } from './pages/MyBusinessesPage';
import { PartnerEarningsPage } from './pages/PartnerEarningsPage';
import { PartnerWithdrawPage } from './pages/PartnerWithdrawPage';
import { ProfilePage } from './pages/ProfilePage';
import { PhonebookPage } from './pages/PhonebookPage';
import { WalletPage } from './pages/WalletPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { OfficersPage } from './pages/OfficersPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { DeleteAccountPage } from './pages/DeleteAccountPage';
import { SplashScreen } from './components/common/SplashScreen';
import { WelcomeBonusModal } from './components/common/WelcomeBonusModal';

// 🔒 Protected Route Component: Strict Login Guard
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

const AppContent: React.FC = () => {
  const { user, isLoading, welcomeBonus, closeWelcomeBonusModal } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const isAuthPage = pathname.startsWith('/auth');
  const isLegalPage =
    pathname === '/privacy' ||
    pathname === '/privacy-policy' ||
    pathname === '/terms' ||
    pathname === '/terms-and-conditions' ||
    pathname === '/delete-account' ||
    pathname.startsWith('/legal');

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backButtonHandler = CapApp.addListener('backButton', () => {
      if (pathname === '/' || pathname === '/auth/login') {
        CapApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      backButtonHandler.then((h) => h.remove());
    };
  }, [pathname, navigate]);

  // Strict Redirection if not logged in (allowing public legal pages)
  useEffect(() => {
    if (!isLoading && !user && !isAuthPage && !isLegalPage) {
      navigate('/auth/login', { replace: true });
    }
  }, [user, isLoading, isAuthPage, isLegalPage, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-indigo-500 selection:text-white">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Routes>
        {/* 🔓 Public Auth Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* 📜 Public Legal, Compliance & Account Deletion Routes */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/terms-and-conditions" element={<TermsPage />} />
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/delete-account" element={<DeleteAccountPage />} />

        {/* 🔒 Strict Protected Routes (Requires Login) */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
        <Route path="/providers" element={<ProtectedRoute><ProvidersPage /></ProtectedRoute>} />
        <Route path="/providers/:id" element={<ProtectedRoute><ProviderDetailPage /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/events/add" element={<ProtectedRoute><AddEventPage /></ProtectedRoute>} />
        <Route path="/events/edit/:id" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
        <Route path="/events/:id/edit" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
        <Route path="/edit-event/:id" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
        <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
        <Route path="/partner" element={<ProtectedRoute><PartnerPage /></ProtectedRoute>} />
        <Route path="/partner/add-business" element={<ProtectedRoute><AddBusinessPage /></ProtectedRoute>} />
        <Route path="/partner/edit-business/:id" element={<ProtectedRoute><EditBusinessPage /></ProtectedRoute>} />
        <Route path="/partner/my-businesses" element={<ProtectedRoute><MyBusinessesPage /></ProtectedRoute>} />
        <Route path="/partner/earnings" element={<ProtectedRoute><PartnerEarningsPage /></ProtectedRoute>} />
        <Route path="/partner/withdraw" element={<ProtectedRoute><PartnerWithdrawPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/phonebook" element={<ProtectedRoute><PhonebookPage /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute><EmergencyPage /></ProtectedRoute>} />
        <Route path="/officers" element={<ProtectedRoute><OfficersPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={user ? "/" : "/auth/login"} replace />} />
      </Routes>

      {!isAuthPage && !isLegalPage && user && <BottomNavigation />}

      {/* 🎁 First-Time Welcome Bonus Celebration Modal */}
      <WelcomeBonusModal
        isOpen={welcomeBonus.show}
        amount={welcomeBonus.amount}
        message={welcomeBonus.message}
        onClose={closeWelcomeBonusModal}
      />
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <Router>
              <AppContent />
            </Router>
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
