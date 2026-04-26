import React, { useEffect, useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { smartLockApi } from '../services/api';

const UserManagement = () => {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'sessions'

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [userData, sessionData] = await Promise.all([
        smartLockApi.getAdminUsers(),
        smartLockApi.getAdminSessions()
      ]);
      setUsers(userData);
      setSessions(sessionData);
    } catch (err) {
      setError(err.message || 'Unable to load administrative data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (userId) => {
    try {
      await smartLockApi.toggleUserActive(userId);
      setUsers(current => 
        current.map(u => u.id === userId ? { ...u, active: !u.active } : u)
      );
    } catch (err) {
      alert('Error toggling user status: ' + err.message);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await smartLockApi.changeUserRole(userId, newRole);
      setUsers(current => 
        current.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
    } catch (err) {
      alert('Error changing user role: ' + err.message);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-outline-variant/10 pb-6">
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-headline tracking-tighter text-on-surface mb-2 uppercase">User Management</h2>
          <p className="text-outline text-xs sm:text-base lg:text-lg">Administrative control over all system users and their active sessions.</p>
        </div>
        <div className="flex gap-2 bg-surface-container p-1 rounded-xl border border-outline-variant/10">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-outline hover:text-on-surface'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('sessions')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sessions' ? 'bg-primary text-white shadow-md' : 'text-outline hover:text-on-surface'}`}
          >
            Global Sessions
          </button>
        </div>
      </section>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm">
          {error}
        </div>
      )}

      <section className="bg-surface-container rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        {activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-outline-variant/10">
                  <th className="px-6 py-5 text-[9px] sm:text-[10px] font-bold text-outline uppercase tracking-widest">Full Name</th>
                  <th className="px-6 py-5 text-[9px] sm:text-[10px] font-bold text-outline uppercase tracking-widest">Email</th>
                  <th className="px-6 py-5 text-[9px] sm:text-[10px] font-bold text-outline uppercase tracking-widest">Role</th>
                  <th className="px-6 py-5 text-[9px] sm:text-[10px] font-bold text-outline uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[9px] sm:text-[10px] font-bold text-outline uppercase tracking-widest">Last Login</th>
                  <th className="px-6 py-5 text-[9px] sm:text-[10px] font-bold text-outline uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {isLoading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-6 h-16 bg-surface-container-high/20"></td>
                    </tr>
                   ))
                ) : users.map(user => (
                  <tr key={user.id} className="hover:bg-surface-container-highest/20 transition-colors">
                    <td className="px-6 py-5 font-bold text-on-surface">{user.fullName || 'N/A'}</td>
                    <td className="px-6 py-5 text-sm text-outline">{user.email}</td>
                    <td className="px-6 py-5">
                      <select 
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className={`bg-surface-container-high border-none outline-none rounded-md text-[10px] font-black uppercase tracking-wider px-2 py-1 focus:ring-1 focus:ring-primary ${user.role === 'ADMIN' ? 'text-primary' : 'text-outline'}`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MEMBER">MEMBER</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-error/10 text-error'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-error'}`}></span>
                        {user.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-outline">{formatDateTime(user.lastLogin)}</td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => handleToggleActive(user.id)}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${user.active ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                      >
                        {user.active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-outline-variant/10">
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">Device / Browser</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">IP Address</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">Signed In</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">Last Active</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {isLoading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-6 h-16 bg-surface-container-high/20"></td>
                    </tr>
                   ))
                ) : sessions.map(session => (
                  <tr key={session.id} className="hover:bg-surface-container-highest/20 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface text-sm">{session.deviceName || 'Unknown'}</span>
                        <span className="text-[10px] text-outline truncate max-w-xs">{session.userAgent}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-outline font-mono">{session.ipAddress}</td>
                    <td className="px-6 py-5 text-sm text-outline">{formatDateTime(session.createdAt)}</td>
                    <td className="px-6 py-5 text-sm text-outline">{formatDateTime(session.lastActiveAt)}</td>
                    <td className="px-6 py-5">
                      {session.loggedOutAt ? (
                        <span className="text-[10px] font-bold text-outline uppercase">Logged Out</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserManagement;
