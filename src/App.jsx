import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LangProvider, useLang } from './contexts/LangContext';
import { TimeWeatherProvider } from './contexts/TimeWeatherContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RemoteControl from './pages/RemoteControl';
import Fingerprints from './pages/Fingerprints';
import Logs from './pages/Logs';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

const Placeholder = ({ title }) => (
  <div className="flex bg-surface-container items-center justify-center h-full min-h-[400px] border border-outline-variant/10 rounded-3xl animate-in zoom-in duration-300">
    <h2 className="text-3xl font-bold font-headline text-on-surface">{title}</h2>
  </div>
);

const AppRoutes = () => {
  const { t } = useLang();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="remote" element={<RemoteControl />} />
            <Route path="fingerprints" element={<Fingerprints />} />
            <Route path="logs" element={<Logs />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="support" element={<Placeholder title={t('support_page')} />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <LangProvider>
        <TimeWeatherProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </TimeWeatherProvider>
      </LangProvider>
    </ThemeProvider>
  );
};

export default App;
