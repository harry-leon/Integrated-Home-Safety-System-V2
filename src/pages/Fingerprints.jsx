import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { smartLockApi } from '../services/api';
import ReAuthModal from '../components/ReAuthModal';

const emptyDraft = {
  deviceId: '',
  personName: '',
  accessLevel: 'STANDARD',
  fingerSlotId: '',
  note: '',
};

const Fingerprints = () => {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [draftFingerprint, setDraftFingerprint] = useState(emptyDraft);
  const [reauthState, setReauthState] = useState({
    isOpen: false,
    intent: null,
    title: '',
    description: '',
    error: '',
    isSubmitting: false,
  });

  const fetchData = useCallback(async ({ keepSelection = true } = {}) => {
    setIsLoading(true);
    setError('');

    try {
      const deviceData = await smartLockApi.getDevices();
      const normalizedDevices = Array.isArray(deviceData) ? deviceData : [];
      setDevices(normalizedDevices);

      const nextSelectedDevice = keepSelection
        ? selectedDevice || normalizedDevices[0]?.id || ''
        : normalizedDevices[0]?.id || '';

      if (!keepSelection && nextSelectedDevice !== selectedDevice) {
        setSelectedDevice(nextSelectedDevice);
      }

      const data = await smartLockApi.getFingerprints(nextSelectedDevice || undefined);
      setUsers(Array.isArray(data) ? data : []);

      setDraftFingerprint((current) => ({
        ...current,
        deviceId: current.deviceId || nextSelectedDevice,
      }));
    } catch (err) {
      setUsers([]);
      setDevices([]);
      setError(err.message || t('fingerprints_load_error'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedDevice, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDraftChange = (field, value) => {
    setDraftFingerprint((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const closeAddModal = () => {
    if (isSubmitting) return;
    setIsAddModalOpen(false);
    setDraftFingerprint((current) => ({
      ...emptyDraft,
      deviceId: current.deviceId || devices[0]?.id || '',
    }));
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
    if (Number.isNaN(dateObj.getTime())) return t('not_updated');

    const locale = lang === 'en' ? 'en-US' : 'vi-VN';
    const isToday = dateObj.toDateString() === new Date().toDateString();
    const timeStr = dateObj.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return lang === 'en' ? `Today, ${timeStr}` : `Hôm nay, ${timeStr}`;
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

  const openReAuth = (intent, title, description) => {
    setReauthState({
      isOpen: true,
      intent,
      title,
      description,
      error: '',
      isSubmitting: false,
    });
  };

  const closeReAuth = () => {
    if (reauthState.isSubmitting) return;
    setReauthState((current) => ({
      ...current,
      isOpen: false,
      intent: null,
      error: '',
      isSubmitting: false,
    }));
  };

  const requestEnroll = () => {
    setError('');
    setSuccessMessage('');

    if (!isAdmin) {
      setError('Chỉ quản trị viên mới có thể thêm hoặc xóa vân tay.');
      return;
    }

    if (!draftFingerprint.deviceId) {
      setError('Vui lòng chọn thiết bị cần đăng ký vân tay.');
      return;
    }

    if (!draftFingerprint.personName.trim()) {
      setError('Vui lòng nhập tên người dùng.');
      return;
    }

    const slotValue = Number(draftFingerprint.fingerSlotId);
    if (!Number.isInteger(slotValue) || slotValue <= 0) {
      setError('Vui lòng nhập slot vân tay hợp lệ.');
      return;
    }

    openReAuth(
      {
        type: 'enroll',
        payload: {
          deviceId: draftFingerprint.deviceId,
          personName: draftFingerprint.personName.trim(),
          accessLevel: draftFingerprint.accessLevel,
          fingerSlotId: slotValue,
          note: draftFingerprint.note.trim(),
        },
      },
      'Xác thực để thêm vân tay',
      'Nhập lại mật khẩu hiện tại để xác nhận thao tác thêm vân tay mới.'
    );
  };

  const requestDelete = (fingerprint) => {
    setError('');
    setSuccessMessage('');

    if (!isAdmin) {
      setError('Chỉ quản trị viên mới có thể thêm hoặc xóa vân tay.');
      return;
    }

    openReAuth(
      {
        type: 'delete',
        payload: fingerprint,
      },
      'Xác thực để xóa vân tay',
      `Nhập lại mật khẩu để xóa vân tay của ${fingerprint.personName || 'người dùng này'} khỏi hệ thống.`
    );
  };

  const handleReAuthConfirm = async (password) => {
    if (!reauthState.intent) return;

    setReauthState((current) => ({
      ...current,
      error: '',
      isSubmitting: true,
    }));

    try {
      const verification = await smartLockApi.reAuthenticate(password);
      const verificationToken = verification?.verificationToken;
      if (!verificationToken) {
        throw new Error('Không nhận được mã xác thực cho thao tác bảo mật.');
      }

      if (reauthState.intent.type === 'enroll') {
        setIsSubmitting(true);
        await smartLockApi.enrollFingerprint(reauthState.intent.payload, verificationToken);
        setSuccessMessage('Đã thêm vân tay mới thành công.');
        setIsAddModalOpen(false);
        setDraftFingerprint({
          ...emptyDraft,
          deviceId: reauthState.intent.payload.deviceId,
        });
      }

      if (reauthState.intent.type === 'delete') {
        await smartLockApi.deleteFingerprint(reauthState.intent.payload.id, verificationToken);
        setSuccessMessage('Đã xóa vân tay thành công.');
      }

      closeReAuth();
      await fetchData();
    } catch (err) {
      setReauthState((current) => ({
        ...current,
        error: err.message || 'Xác thực lại không thành công.',
        isSubmitting: false,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container p-6 shadow-sm transition-all duration-300 hover:bg-surface-container-high">
          <div>
            <p className="mb-1 text-sm font-medium text-outline">{t('fingerprints_total')}</p>
            <h3 className="text-4xl font-bold tracking-tight text-on-surface">{stats.total}</h3>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-3xl">fingerprint</span>
          </div>
        </div>

        <div className="group flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container p-6 shadow-sm transition-all duration-300 hover:bg-surface-container-high">
          <div>
            <p className="mb-1 text-sm font-medium text-outline">{t('fingerprints_active_today')}</p>
            <h3 className="text-4xl font-bold tracking-tight text-on-surface">{stats.active}</h3>
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

      <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">{t('fingerprints_registry_title')}</h2>
          <p className="text-sm text-outline">{t('fingerprints_registry_desc')}</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          <select
            value={selectedDevice}
            onChange={(event) => setSelectedDevice(event.target.value)}
            className="rounded-xl border border-outline-variant/10 bg-surface-container-high px-4 py-3 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary min-w-[220px]"
          >
            <option value="">Tất cả thiết bị</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.deviceName}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => fetchData()}
            className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-high px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Làm mới
          </button>

          <button
            type="button"
            onClick={() => {
              setSuccessMessage('');
              setError('');
              setDraftFingerprint((current) => ({
                ...emptyDraft,
                deviceId: current.deviceId || selectedDevice || devices[0]?.id || '',
              }));
              setIsAddModalOpen(true);
            }}
            disabled={!isAdmin}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary-container to-primary px-6 py-3 font-bold text-on-primary-container shadow-sm transition-all duration-200 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-white">add</span>
            <span className="text-white">{t('fingerprints_add_new')}</span>
          </button>
        </div>
      </div>

      {!isAdmin && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-300">
          Chế độ hiện tại chỉ cho phép xem danh sách vân tay. Thao tác thêm hoặc xóa yêu cầu tài khoản quản trị viên.
        </div>
      )}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-700 dark:text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-error/20 bg-error/10 px-5 py-4 text-sm text-error">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-outline-variant/10 bg-surface-container shadow-sm">
        <table className="min-w-[980px] w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant/10 bg-surface-container-high/50 text-[10px] sm:text-[11px] uppercase tracking-widest text-outline">
              <th className="px-8 py-5 font-semibold">{t('fingerprints_table_slot')}</th>
              <th className="px-8 py-5 font-semibold">Thiết bị</th>
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
                  <td className="px-8 py-5"><div className="h-4 w-28 rounded bg-surface-container-highest" /></td>
                  <td className="px-8 py-5"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-surface-container-highest" /><div className="h-4 w-24 rounded bg-surface-container-highest" /></div></td>
                  <td className="px-8 py-5"><div className="h-5 w-20 rounded-full bg-surface-container-highest" /></td>
                  <td className="px-8 py-5"><div className="h-4 w-32 rounded bg-surface-container-highest" /></td>
                  <td className="px-8 py-5"><div className="mb-1 h-4 w-28 rounded bg-surface-container-highest" /><div className="h-3 w-16 rounded bg-surface-container-highest" /></td>
                  <td className="px-8 py-5" />
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-8 py-12 text-center text-outline">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined mb-3 text-4xl text-surface-container-highest">fingerprint</span>
                    <p className="text-sm font-medium">{t('fingerprints_empty')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((fingerprint) => {
                const initials = (fingerprint.personName || '--').slice(0, 2).toUpperCase();
                const statusLabel = fingerprint.isActive ? t('fingerprints_status_normal') : t('fingerprints_status_disabled');
                const statusClass = fingerprint.isActive ? 'text-emerald-500' : 'text-error';

                return (
                  <tr key={fingerprint.id} className="group transition-colors duration-200 hover:bg-surface-container-high">
                    <td className="px-8 py-5 font-mono font-bold text-primary">
                      #{String(fingerprint.fingerSlotId).padStart(3, '0')}
                    </td>
                    <td className="px-8 py-5 text-sm text-on-surface">{fingerprint.deviceName || 'Thiết bị chưa xác định'}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-highest text-xs font-bold text-on-surface">
                          {initials}
                        </div>
                        <span className="font-medium text-on-surface">{fingerprint.personName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getLevelClass(fingerprint.accessLevel)}`}>
                        {mapAccessLevel(fingerprint.accessLevel)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-outline">
                      {t('fingerprints_slot_label')}: {fingerprint.fingerSlotId} | {fingerprint.totalAccessCount || 0} lượt dùng
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm text-on-surface">{formatLastActive(fingerprint)}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        type="button"
                        onClick={() => requestDelete(fingerprint)}
                        disabled={!isAdmin}
                        className="inline-flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 px-3 py-2 text-xs font-bold text-error transition hover:bg-error/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="fixed bottom-12 right-12 z-40 hidden md:block">
        <div className="max-w-sm rounded-2xl border border-outline-variant/10 bg-surface-container-high/90 p-6 shadow-lg backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-2 text-green-500">
              <span className="material-symbols-outlined">security</span>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-bold text-on-surface">{t('fingerprints_system_status')}</h4>
              <p className="text-xs leading-relaxed text-outline">
                {isAdmin
                  ? 'Đăng ký và xóa vân tay hiện đã chạy qua backend thật, có kiểm tra quyền admin và xác thực lại.'
                  : t('fingerprints_system_status_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-4 backdrop-blur-md">
          <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0c0c0e] shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
            <div className="custom-scrollbar flex-1 overflow-y-auto">
              <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
                <div className="p-6 sm:p-10">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="h-px w-8 bg-primary/40" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{t('fingerprints_enrollment_label')}</p>
                      </div>
                      <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">{t('fingerprints_add_modal_title')}</h2>
                      <p className="mt-3 max-w-xl text-xs leading-7 text-outline opacity-80 sm:text-sm">{t('fingerprints_add_modal_desc')}</p>
                    </div>

                    <button
                      type="button"
                      onClick={closeAddModal}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-white transition-all hover:scale-105 hover:bg-white/10 active:scale-95 shadow-sm"
                      aria-label={t('fingerprints_close_modal')}
                    >
                      <span className="material-symbols-outlined text-[22px]">close</span>
                    </button>
                  </div>

                  <div className="mt-10 grid gap-6 md:grid-cols-2">
                    <label className="block group">
                      <span className="ml-1 text-xs font-bold uppercase tracking-wider text-outline transition-colors group-focus-within:text-primary">Thiết bị</span>
                      <div className="relative mt-2">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-outline group-focus-within:text-primary">devices</span>
                        <select
                          value={draftFingerprint.deviceId}
                          onChange={(event) => handleDraftChange('deviceId', event.target.value)}
                          className="w-full appearance-none rounded-2xl border border-white/5 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all focus:border-primary/50 focus:bg-white/[0.08] shadow-sm"
                        >
                          <option value="">Chọn thiết bị</option>
                          {devices.map((device) => (
                            <option key={device.id} value={device.id}>
                              {device.deviceName}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-outline">expand_more</span>
                      </div>
                    </label>

                    <label className="block group">
                      <span className="ml-1 text-xs font-bold uppercase tracking-wider text-outline transition-colors group-focus-within:text-primary">{t('fingerprints_form_name')}</span>
                      <div className="relative mt-2">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-outline group-focus-within:text-primary">person</span>
                        <input
                          type="text"
                          value={draftFingerprint.personName}
                          onChange={(event) => handleDraftChange('personName', event.target.value)}
                          placeholder={t('fingerprints_form_name_placeholder')}
                          className="w-full rounded-2xl border border-white/5 bg-white/5 pl-11 pr-4 py-3.5 text-sm text-white outline-none transition-all focus:border-primary/50 focus:bg-white/[0.08] shadow-sm"
                        />
                      </div>
                    </label>

                    <label className="block group">
                      <span className="ml-1 text-xs font-bold uppercase tracking-wider text-outline transition-colors group-focus-within:text-primary">{t('fingerprints_form_access')}</span>
                      <div className="relative mt-2">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-outline group-focus-within:text-primary">shield</span>
                        <select
                          value={draftFingerprint.accessLevel}
                          onChange={(event) => handleDraftChange('accessLevel', event.target.value)}
                          className="w-full appearance-none rounded-2xl border border-white/5 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all focus:border-primary/50 focus:bg-white/[0.08] shadow-sm"
                        >
                          <option value="STANDARD">{t('fingerprints_level_standard')}</option>
                          <option value="ADMIN">{t('fingerprints_level_admin')}</option>
                          <option value="GUEST">{t('fingerprints_level_guest')}</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                      </div>
                    </label>

                    <label className="block group">
                      <span className="ml-1 text-xs font-bold uppercase tracking-wider text-outline transition-colors group-focus-within:text-primary">{t('fingerprints_form_slot')}</span>
                      <div className="relative mt-2">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-outline group-focus-within:text-primary">tag</span>
                        <input
                          type="number"
                          min="1"
                          max="128"
                          value={draftFingerprint.fingerSlotId}
                          onChange={(event) => handleDraftChange('fingerSlotId', event.target.value)}
                          placeholder={t('fingerprints_form_slot_placeholder')}
                          className="w-full rounded-2xl border border-white/5 bg-white/5 pl-11 pr-4 py-3.5 text-sm text-white outline-none transition-all focus:border-primary/50 focus:bg-white/[0.08] shadow-sm"
                        />
                      </div>
                    </label>

                    <div className="flex items-center justify-between rounded-3xl border border-emerald-500/10 bg-emerald-500/5 px-5 py-4 transition-colors group hover:border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                          <span className="material-symbols-outlined text-[22px]">sensors</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{t('fingerprints_sensor_ready')}</p>
                          <p className="mt-0.5 text-[11px] text-outline">{t('fingerprints_sensor_ready_desc')}</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                        {t('online')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 xl:grid-cols-2">
                    <label className="block group">
                      <span className="ml-1 text-xs font-bold uppercase tracking-wider text-outline transition-colors group-focus-within:text-primary">{t('fingerprints_form_note')}</span>
                      <textarea
                        rows="3"
                        value={draftFingerprint.note}
                        onChange={(event) => handleDraftChange('note', event.target.value)}
                        placeholder={t('fingerprints_form_note_placeholder')}
                        className="mt-2 w-full resize-none rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm text-white outline-none transition-all focus:border-primary/50 focus:bg-white/[0.08] shadow-sm"
                      />
                    </label>

                    <div className="flex flex-col justify-center rounded-3xl border border-primary/10 bg-primary/5 p-5">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-primary p-2.5 text-white shadow-lg shadow-primary/20">
                          <span className="material-symbols-outlined text-[20px]">touch_app</span>
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wider text-white">{t('fingerprints_process_title')}</p>
                          <p className="mt-2 text-[13px] leading-relaxed text-outline opacity-80">
                            Sau khi xác thực lại, hệ thống sẽ tạo bản ghi vân tay mới trên backend và lưu log thao tác cho quản trị.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="flex flex-col border-t border-white/5 bg-white/[0.02] p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <div className="mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-outline">visibility</span>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-outline">{t('fingerprints_preview')}</p>
                  </div>

                  <div className="flex-1 space-y-5">
                    <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-6 shadow-sm">
                      <div className="flex flex-col items-center border-b border-white/5 pb-6 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-primary to-primary-container text-white shadow-xl shadow-primary/20">
                          <span className="material-symbols-outlined text-[36px]">fingerprint</span>
                        </div>
                        <p className="text-xl font-black text-white">
                          {draftFingerprint.personName || t('fingerprints_new_user')}
                        </p>
                        <span className={`mt-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getLevelClass(draftFingerprint.accessLevel)}`}>
                          {mapAccessLevel(draftFingerprint.accessLevel)}
                        </span>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Thiết bị</p>
                          <p className="text-right text-sm font-black text-primary">
                            {devices.find((device) => device.id === draftFingerprint.deviceId)?.deviceName || 'Chưa chọn'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">{t('fingerprints_expected_slot')}</p>
                          <p className="text-sm font-black text-primary">
                            {draftFingerprint.fingerSlotId
                              ? `#${String(draftFingerprint.fingerSlotId).padStart(3, '0')}`
                              : t('fingerprints_not_selected')}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">{t('fingerprints_progress')}</p>
                            <p className="text-[10px] font-bold text-primary">100%</p>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full w-full rounded-full bg-primary shadow-[0_0_12px_rgba(15,98,254,0.4)]" />
                          </div>
                          <p className="px-2 text-center text-[10px] leading-relaxed text-outline">
                            Khi nhấn bắt đầu, hệ thống sẽ yêu cầu xác thực lại để bảo vệ thao tác quản trị.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                      <div className="mb-2 flex items-center gap-2 text-amber-500">
                        <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                        <p className="text-xs font-bold uppercase tracking-tight">{t('fingerprints_note_title')}</p>
                      </div>
                      <p className="text-xs leading-5 text-outline opacity-90">{t('fingerprints_note_desc')}</p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap justify-end gap-3 border-t border-white/5 bg-[#0c0c0e] p-6 sm:px-10">
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
              >
                {t('fingerprints_close')}
              </button>
              <button
                type="button"
                onClick={requestEnroll}
                disabled={isSubmitting}
                className="rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xử lý...' : t('fingerprints_start_enrollment')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ReAuthModal
        isOpen={reauthState.isOpen}
        title={reauthState.title}
        description={reauthState.description}
        confirmLabel="Xác nhận"
        cancelLabel="Hủy"
        isSubmitting={reauthState.isSubmitting}
        error={reauthState.error}
        onConfirm={handleReAuthConfirm}
        onClose={closeReAuth}
      />
    </div>
  );
};

export default Fingerprints;
