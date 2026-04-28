import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LangProvider, useLang } from './contexts/LangContext';
import { TimeWeatherProvider } from './contexts/TimeWeatherContext';
import { AuthProvider } from './contexts/AuthContext';
import { VoiceCommandProvider } from './contexts/VoiceCommandContext';
import { AlertModalProvider, useAlertModal } from './contexts/AlertModalContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RemoteControl from './pages/RemoteControl';
import Fingerprints from './pages/Fingerprints';
import Logs from './pages/Logs';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

const Placeholder = ({ title }) => (
  <div className="flex bg-surface-container items-center justify-center h-full min-h-[400px] border border-outline-variant/10 rounded-3xl animate-in zoom-in duration-300">
    <h2 className="text-3xl font-bold font-headline text-on-surface">{title}</h2>
  </div>
);

const AppRoutes = () => {
  const { t } = useLang();
  const { showAlert } = useAlertModal();

  React.useEffect(() => {
    const handleSessionExpired = () => {
      if (window.sessionExpiredModalShown) return;
      window.sessionExpiredModalShown = true;
      showAlert({
        type: 'error',
        title: t('reminder_error'),
        message: t('reminder_session_expired'),
        confirmText: t('reminder_relogin'),
        onConfirm: () => {
          window.location.href = '/login';
        },
        onClose: () => {
          window.location.href = '/login';
        }
      });
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
      window.sessionExpiredModalShown = false;
    };
  }, [showAlert, t]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="remote" element={<RemoteControl />} />
          <Route path="fingerprints" element={<Fingerprints />} />
          <Route path="logs" element={<Logs />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<Settings />} />
          <Route path="support" element={<Placeholder title={t('support_page')} />} />
        </Route>
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <LangProvider>
        <TimeWeatherProvider>
          <AuthProvider>
            <AlertModalProvider>
              <BrowserRouter>
                <VoiceCommandProvider>
                  <AppRoutes />
                </VoiceCommandProvider>
              </BrowserRouter>
            </AlertModalProvider>
          </AuthProvider>
        </TimeWeatherProvider>
      </LangProvider>
    </ThemeProvider>
  );
};

export default App;
