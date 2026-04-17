import React, { useEffect, useMemo, useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { smartLockApi } from '../services/api';

const Fingerprints = () => {
  const { t, lang } = useLang();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [draftFingerprint, setDraftFingerprint] = useState({
    personName: '',
    accessLevel: 'STANDARD',
    fingerSlotId: '',
    note: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await smartLockApi.getFingerprints();
        const normalized = Array.isArray(data) ? data : [];
        setUsers(normalized);
      } catch (err) {
        setUsers([]);
        if (err.message && !err.message.includes('404')) {
          setError(t('fingerprints_load_error'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [t]);

  const handleDraftChange = (field, value) => {
    setDraftFingerprint((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((item) => item.isActive).length;
    const adminCount = users.filter((item) => item.accessLevel === 'ADMIN').length;

    return {
      total,
      active,
      adminCount,
    };
  }, [users]);

  const formatLastActive = (item) => {
    const rawValue = item.lastAccess || item.registeredAt;
    if (!rawValue) return t('not_updated');

    const dateObj = new Date(rawValue);
    const locale = lang === 'en' ? 'en-US' : 'vi-VN';
    const isToday = dateObj.toDateString() === new Date().toDateString();
    const timeStr = dateObj.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return lang === 'en' ? `Today, ${timeStr}` : `Hom nay, ${timeStr}`;
    }

    return `${dateObj.toLocaleDateString(locale)}, ${timeStr}`;
  };

  const mapAccessLevel = (level) => {
    if (level === 'ADMIN') return t('fingerprints_level_admin');
    if (level === 'GUEST') return t('fingerprints_level_guest');
    return t('fingerprints_level_standard');
  };

  const getLevelClass = (level) => {
    if (level === 'ADMIN') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    if (level === 'GUEST') return 'text-error bg-error/10 border-error/20';
    return 'text-tertiary bg-tertiary/10 border-tertiary/20';
  };

  return (
    <div className="relative space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container p-6 shadow-sm transition-all duration-300 hover:bg-surface-container-high">
          <div>
            <p className="mb-1 text-sm font-medium text-outline">{t('fingerprints_total')}</p>
            <h3 className="text-4xl font-bold tracking-tight text-on-surface">{stats.total || 128}</h3>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">fingerprint</span>
          </div>
        </div>

        <div className="group flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container p-6 shadow-sm transition-all duration-300 hover:bg-surface-container-high">
          <div>
            <p className="mb-1 text-sm font-medium text-outline">{t('fingerprints_active_today')}</p>
            <h3 className="text-4xl font-bold tracking-tight text-on-surface">{stats.active || 42}</h3>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-tertiary/20 bg-tertiary/10 text-tertiary">
            <span className="material-symbols-outlined text-3xl">bolt</span>
          </div>
        </div>

        <div className="group flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container p-6 shadow-sm transition-all duration-300 hover:bg-surface-container-high">
          <div>
            <p className="mb-1 text-sm font-medium text-outline">{t('fingerprints_security_level')}</p>
            <h3 className="text-4xl font-bold tracking-tight text-on-surface">
              {stats.adminCount > 0 ? t('fingerprints_security_high') : t('fingerprints_security_standard')}
            </h3>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 text-green-500">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-on-surface">{t('fingerprints_registry_title')}</h2>
          <p className="text-sm text-outline">{t('fingerprints_registry_desc')}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary-container to-primary px-6 py-3 font-bold text-on-primary-container shadow-sm transition-all duration-200 hover:opacity-90 active:scale-95"
        >
          <span className="material-symbols-outlined text-white">add</span>
          <span className="text-white">{t('fingerprints_add_new')}</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-outline-variant/10 bg-surface-container shadow-sm">
        <table className="min-w-[800px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant/10 bg-surface-container-high/50 text-[11px] uppercase tracking-widest text-outline">
              <th className="px-8 py-5 font-semibold">{t('fingerprints_table_slot')}</th>
              <th className="px-8 py-5 font-semibold">{t('fingerprints_table_user')}</th>
              <th className="px-8 py-5 font-semibold">{t('fingerprints_table_access')}</th>
              <th className="px-8 py-5 font-semibold">{t('fingerprints_table_metadata')}</th>
              <th className="px-8 py-5 font-semibold">{t('fingerprints_table_last_active')}</th>
              <th className="px-8 py-5 text-right font-semibold">{t('fingerprints_table_actions')}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-outline-variant/10">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="px-8 py-5"><div className="h-4 w-12 rounded bg-surface-container-highest" /></td>
                  <td className="px-8 py-5"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-surface-container-highest" /><div className="h-4 w-24 rounded bg-surface-container-highest" /></div></td>
                  <td className="px-8 py-5"><div className="h-5 w-20 rounded-full bg-surface-container-highest" /></td>
                  <td className="px-8 py-5"><div className="h-4 w-32 rounded bg-surface-container-highest" /></td>
                  <td className="px-8 py-5"><div className="mb-1 h-4 w-28 rounded bg-surface-container-highest" /><div className="h-3 w-16 rounded bg-surface-container-highest" /></td>
                  <td className="px-8 py-5" />
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan="6" className="px-8 py-12 text-center text-error">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined mb-3 text-4xl">error</span>
                    <p className="font-bold">{error}</p>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-8 py-12 text-center text-outline">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined mb-3 text-4xl text-surface-container-highest">fingerprint</span>
                    <p className="text-sm font-medium">{t('fingerprints_empty')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const initials = (user.personName || '--').slice(0, 2).toUpperCase();
                const statusLabel = user.isActive ? t('fingerprints_status_normal') : t('fingerprints_status_disabled');
                const statusClass = user.isActive ? 'text-emerald-500' : 'text-error';

                return (
                  <tr key={`${user.fingerSlotId}-${user.personName}`} className="group transition-colors duration-200 hover:bg-surface-container-high">
                    <td className="px-8 py-5 font-mono font-bold text-primary">
                      #{String(user.fingerSlotId).padStart(3, '0')}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-highest text-xs font-bold text-on-surface">
                          {initials}
                        </div>
                        <span className="font-medium text-on-surface">{user.personName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getLevelClass(user.accessLevel)}`}>
                        {mapAccessLevel(user.accessLevel)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-outline">
                      {t('fingerprints_slot_label')}: {user.fingerSlotId} | {user.isActive ? t('fingerprints_active') : t('fingerprints_inactive')}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm text-on-surface">{formatLastActive(user)}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="rounded-lg p-2 text-outline transition-colors hover:bg-surface-container-highest hover:text-on-surface">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-outline-variant/10 bg-surface-container p-6">
          <p className="text-xs text-outline">{t('fingerprints_pagination_summary')}</p>
          <div className="flex gap-2">
            <button className="rounded-lg bg-surface-container-highest p-2 text-outline transition-colors hover:text-on-surface">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="rounded-lg bg-primary p-2 text-on-primary">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-12 right-12 z-40 hidden md:block">
        <div className="max-w-sm rounded-2xl border border-outline-variant/10 bg-surface-container-high/90 p-6 shadow-lg backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-2 text-green-500">
              <span className="material-symbols-outlined">security</span>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-bold text-on-surface">{t('fingerprints_system_status')}</h4>
              <p className="text-xs leading-relaxed text-outline">{t('fingerprints_system_status_desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-sm">
          <div className="relative w-full max-w-[1220px] overflow-hidden rounded-[1.75rem] border border-outline-variant/12 bg-surface-container shadow-[0_32px_90px_rgba(0,0,0,0.28)]">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_280px]">
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{t('fingerprints_enrollment_label')}</p>
                    <h3 className="mt-3 text-2xl font-black tracking-tight text-on-surface sm:text-3xl">{t('fingerprints_add_modal_title')}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-outline">{t('fingerprints_add_modal_desc')}</p>
                  </div>

                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant/16 bg-background text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                    aria-label={t('fingerprints_close_modal')}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-on-surface">{t('fingerprints_form_name')}</span>
                    <input
                      type="text"
                      value={draftFingerprint.personName}
                      onChange={(event) => handleDraftChange('personName', event.target.value)}
                      placeholder={t('fingerprints_form_name_placeholder')}
                      className="mt-2 w-full rounded-2xl border border-outline-variant/14 bg-background px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary/40"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-on-surface">{t('fingerprints_form_access')}</span>
                    <select
                      value={draftFingerprint.accessLevel}
                      onChange={(event) => handleDraftChange('accessLevel', event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-outline-variant/14 bg-background px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary/40"
                    >
                      <option value="STANDARD">{t('fingerprints_level_standard')}</option>
                      <option value="ADMIN">{t('fingerprints_level_admin')}</option>
                      <option value="GUEST">{t('fingerprints_level_guest')}</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-on-surface">{t('fingerprints_form_slot')}</span>
                    <input
                      type="number"
                      min="1"
                      max="128"
                      value={draftFingerprint.fingerSlotId}
                      onChange={(event) => handleDraftChange('fingerSlotId', event.target.value)}
                      placeholder={t('fingerprints_form_slot_placeholder')}
                      className="mt-2 w-full rounded-2xl border border-outline-variant/14 bg-background px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary/40"
                    />
                  </label>

                  <div className="rounded-[1.5rem] border border-outline-variant/12 bg-background px-4 py-4">
                    <p className="text-sm font-semibold text-on-surface">{t('fingerprints_sensor_status')}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-on-surface">{t('fingerprints_sensor_ready')}</p>
                        <p className="mt-1 text-xs text-outline">{t('fingerprints_sensor_ready_desc')}</p>
                      </div>
                      <span className="rounded-full bg-green-500/12 px-3 py-1 text-xs font-bold text-green-700">
                        {t('online')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
                  <label className="block">
                    <span className="text-sm font-semibold text-on-surface">{t('fingerprints_form_note')}</span>
                    <textarea
                      rows="3"
                      value={draftFingerprint.note}
                      onChange={(event) => handleDraftChange('note', event.target.value)}
                      placeholder={t('fingerprints_form_note_placeholder')}
                      className="mt-2 w-full rounded-[1.5rem] border border-outline-variant/14 bg-background px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary/40"
                    />
                  </label>

                  <div className="rounded-[1.5rem] border border-primary/14 bg-primary/6 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <span className="material-symbols-outlined text-[22px]">touch_app</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{t('fingerprints_process_title')}</p>
                        <p className="mt-2 text-sm leading-6 text-outline">{t('fingerprints_process_desc')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="rounded-2xl border border-outline-variant/16 bg-background px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    {t('fingerprints_close')}
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[0.98]"
                  >
                    {t('fingerprints_start_enrollment')}
                  </button>
                </div>
              </div>

              <aside className="border-t border-outline-variant/12 bg-surface-container-high p-5 lg:border-l lg:border-t-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-outline">{t('fingerprints_preview')}</p>

                <div className="mt-4 rounded-[1.5rem] border border-outline-variant/12 bg-background p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-[26px]">fingerprint</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-on-surface">
                        {draftFingerprint.personName || t('fingerprints_new_user')}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-outline">
                        {mapAccessLevel(draftFingerprint.accessLevel)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <div className="rounded-2xl bg-surface-container px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-outline">{t('fingerprints_expected_slot')}</p>
                      <p className="mt-2 text-lg font-black text-on-surface">
                        {draftFingerprint.fingerSlotId
                          ? `#${String(draftFingerprint.fingerSlotId).padStart(3, '0')}`
                          : t('fingerprints_not_selected')}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-surface-container px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-outline">{t('fingerprints_progress')}</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-high">
                        <div className="h-full w-1/3 rounded-full bg-primary" />
                      </div>
                      <p className="mt-2 text-xs leading-5 text-outline">{t('fingerprints_progress_desc')}</p>
                    </div>

                    <div className="rounded-2xl border border-amber-500/18 bg-amber-500/8 px-4 py-3">
                      <p className="text-sm font-semibold text-amber-700">{t('fingerprints_note_title')}</p>
                      <p className="mt-1 text-xs leading-5 text-outline">{t('fingerprints_note_desc')}</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fingerprints;
