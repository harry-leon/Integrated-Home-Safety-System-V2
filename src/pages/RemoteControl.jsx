import React, { useEffect, useRef, useState } from 'react';
import { useLang } from '../contexts/LangContext';
import GuestAccessModal from '../components/GuestAccessModal';
import { smartLockApi } from '../services/api';

const QUICK_SETTINGS = [
  { label: 'Tự động khóa', icon: 'lock_clock', key: 'autoLockEnabled', color: 'text-primary' },
  { label: 'Cảnh báo Gas', icon: 'gas_meter', key: 'gasAlertEnabled', color: 'text-tertiary' },
  { label: 'Cảnh báo PIR', icon: 'motion_sensor_active', key: 'pirAlertEnabled', color: 'text-secondary' },
];

const RANGE_SETTINGS = [
  { label: 'Ngưỡng Gas (PPM)', key: 'gasThreshold', max: 1000 },
  { label: 'Ngưỡng Ánh sáng (Lux)', key: 'ldrThreshold', max: 1000 },
  { label: 'Trễ tự động khóa (Giây)', key: 'autoLockDelay', max: 120 },
];

const RemoteControl = () => {
  const { t } = useLang();
  const [locked, setLocked] = useState(true);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [deviceSettings, setDeviceSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingCommand, setIsSendingCommand] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');
  const [hasPendingSettingsChange, setHasPendingSettingsChange] = useState(false);
  const [verificationState, setVerificationState] = useState({ token: '', expiresAt: 0 });
  const isBootstrappingSettings = useRef(false);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setIsLoading(true);
      setStatusError('');
      try {
        const deviceList = await smartLockApi.getDevices();
        if (!active) return;

        const normalized = Array.isArray(deviceList) ? deviceList : [];
        setDevices(normalized);
        if (normalized.length > 0) {
          setSelectedDeviceId(normalized[0].id);
        } else {
          setStatusMessage('Chưa có thiết bị nào được cấu hình.');
        }
      } catch (error) {
        if (active) {
          setStatusError(error.message || 'Không thể tải danh sách thiết bị.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) {
      setDeviceSettings(null);
      return;
    }

    let active = true;

    const loadDeviceContext = async () => {
      try {
        const [settings, logs] = await Promise.all([
          smartLockApi.getDeviceSettings(selectedDeviceId),
          smartLockApi.getAccessLogs({ deviceId: selectedDeviceId }),
        ]);

        if (!active) return;

        isBootstrappingSettings.current = true;
        setDeviceSettings(settings);
        setHasPendingSettingsChange(false);

        const latestAction = Array.isArray(logs) && logs.length > 0 ? logs[0].action : null;
        if (latestAction === 'UNLOCKED') {
          setLocked(false);
        } else if (latestAction === 'LOCKED') {
          setLocked(true);
        }
      } catch (error) {
        if (active) {
          setStatusError(error.message || 'Không thể tải trạng thái thiết bị.');
        }
      } finally {
        window.setTimeout(() => {
          isBootstrappingSettings.current = false;
        }, 0);
      }
    };

    loadDeviceContext();
    return () => {
      active = false;
    };
  }, [selectedDeviceId]);

  useEffect(() => {
    if (!selectedDeviceId || !deviceSettings || !hasPendingSettingsChange || isBootstrappingSettings.current) {
      return undefined;
    }

    const timer = window.setTimeout(async () => {
      try {
        const verificationToken = await requestVerificationToken();
        await smartLockApi.updateDeviceSettings(selectedDeviceId, deviceSettings, verificationToken);
        setStatusMessage('Đã lưu cấu hình thiết bị.');
        setStatusError('');
        setHasPendingSettingsChange(false);
      } catch (error) {
        setStatusError(error.message || 'Không thể lưu cấu hình thiết bị.');
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [deviceSettings, hasPendingSettingsChange, selectedDeviceId, verificationState]);

  const requestVerificationToken = async () => {
    if (verificationState.token && verificationState.expiresAt > Date.now()) {
      return verificationState.token;
    }

    const password = window.prompt('Nhập mật khẩu hiện tại để xác nhận thao tác');
    if (!password) {
      throw new Error('Bạn cần nhập mật khẩu để xác nhận.');
    }

    const verification = await smartLockApi.reAuthenticate(password);
    const nextState = {
      token: verification.verificationToken,
      expiresAt: Date.now() + 4 * 60 * 1000,
    };
    setVerificationState(nextState);
    return nextState.token;
  };

  const currentDevice = devices.find((device) => device.id === selectedDeviceId) || null;

  const handleToggleLock = async () => {
    if (!selectedDeviceId) return;

    setIsSendingCommand(true);
    setStatusError('');
    try {
      const verificationToken = await requestVerificationToken();
      const commandId = await smartLockApi.sendLockToggle(selectedDeviceId, verificationToken);
      setLocked((current) => !current);
      setStatusMessage(`Đã gửi lệnh điều khiển. Mã lệnh: ${commandId}`);
    } catch (error) {
      setStatusError(error.message || 'Không thể gửi lệnh khóa/mở.');
    } finally {
      setIsSendingCommand(false);
    }
  };

  const updateSetting = (key, value) => {
    setDeviceSettings((current) => ({ ...current, [key]: value }));
    setHasPendingSettingsChange(true);
    setStatusMessage('Đang chờ lưu cấu hình...');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface transition-colors duration-300">
            {t('remote_control')}
          </h2>
          <p className="text-outline font-medium mt-1">Quản lý an ninh thời gian thực</p>
        </div>
        <div className="flex items-center gap-4">
          {devices.length > 0 && (
            <select
              value={selectedDeviceId}
              onChange={(event) => setSelectedDeviceId(event.target.value)}
              className="rounded-xl border border-outline-variant/10 bg-surface-container px-4 py-2 text-sm text-on-surface outline-none"
            >
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.deviceName}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setIsGuestModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-xl font-bold shadow-sm hover:opacity-90 transition-all border border-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">key</span>
            Cấp quyền Khách
          </button>
          <div className="bg-surface-container px-4 py-2 rounded-full flex items-center gap-2 border border-outline-variant/10 shadow-sm transition-colors duration-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-on-surface">
              {currentDevice?.online ? 'HỆ THỐNG TRỰC TUYẾN' : 'THIẾT BỊ NGOẠI TUYẾN'}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-surface-container rounded-[2rem] p-10 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm border border-outline-variant/10 transition-colors duration-300">
          <h3 className="text-outline font-bold tracking-widest text-xs uppercase mb-12 relative z-10">
            TRẠNG THÁI KHÓA HIỆN TẠI
          </h3>

          <button
            onClick={handleToggleLock}
            disabled={isSendingCommand || !selectedDeviceId}
            className={`relative w-64 h-64 rounded-full p-1 transition-all duration-300 group z-10 outline-none disabled:opacity-60
              ${locked ? 'bg-gradient-to-br from-primary-container to-inverse-primary hover:scale-105 active:scale-95 shadow-[0_0_80px_rgba(15,98,254,0.3)]'
                : 'bg-gradient-to-br from-green-500/20 to-green-500/50 hover:scale-105 active:scale-95 shadow-[0_0_80px_rgba(34,197,94,0.3)]'}
            `}
          >
            <div className="w-full h-full rounded-full bg-surface-container-low flex flex-col items-center justify-center">
              <span
                className={`material-symbols-outlined text-7xl mb-2 ${locked ? 'text-primary' : 'text-green-500'}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {locked ? 'lock' : 'lock_open'}
              </span>
              <span className="text-2xl font-black text-on-surface tracking-tighter font-headline uppercase">
                {locked ? t('locked') : t('unlocked')}
              </span>
            </div>
          </button>
          <p className="mt-12 text-outline font-medium text-center max-w-xs relative z-10">
            Nhấn vào trung tâm để {locked ? 'mở' : 'đóng'} khóa cửa chính. Hành động này sẽ được ghi nhật ký.
          </p>
          {currentDevice && (
            <p className="mt-4 text-xs text-outline text-center relative z-10">
              Thiết bị: <span className="font-semibold text-on-surface">{currentDevice.deviceName}</span>
              {' · '}
              {currentDevice.online ? 'Đang online' : 'Đang offline'}
              {currentDevice.lastCommandStatus ? ` · Lệnh gần nhất: ${currentDevice.lastCommandStatus}` : ''}
            </p>
          )}
          {statusMessage && <p className="mt-3 text-sm text-primary text-center relative z-10">{statusMessage}</p>}
          {statusError && <p className="mt-3 text-sm text-error text-center relative z-10">{statusError}</p>}
        </div>

        <div className="md:col-span-5 grid grid-cols-1 gap-6">
          <div className="bg-surface-container focus-within:ring p-8 rounded-[2rem] flex flex-col justify-between shadow-sm border border-outline-variant/10 transition-colors duration-300">
            <h4 className="text-sm font-bold text-outline mb-6 uppercase tracking-wider">Thiết lập nhanh</h4>
            <div className="space-y-6">
              {QUICK_SETTINGS.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center ${item.color}`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <span className="font-semibold text-on-surface">{item.label}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={!!deviceSettings?.[item.key]}
                      disabled={!deviceSettings}
                      onChange={(event) => updateSetting(item.key, event.target.checked)}
                    />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container p-8 rounded-[2rem] shadow-sm border border-outline-variant/10 transition-colors duration-300">
            <h4 className="text-sm font-bold text-outline mb-8 uppercase tracking-wider">Cấu hình ngưỡng</h4>
            <div className="space-y-8">
              {RANGE_SETTINGS.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-4">
                    <span className="text-sm font-medium text-outline">{item.label}</span>
                    <span className="text-sm font-bold text-primary">{deviceSettings?.[item.key] ?? '--'}</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-primary"
                    min="0"
                    max={item.max}
                    value={deviceSettings?.[item.key] ?? 0}
                    disabled={!deviceSettings}
                    onChange={(event) => updateSetting(item.key, Number(event.target.value))}
                  />
                </div>
              ))}
            </div>
            {isLoading && <p className="mt-4 text-xs text-outline">Đang đồng bộ cấu hình thiết bị...</p>}
          </div>
        </div>
      </div>

      <GuestAccessModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
      />
    </div>
  );
};

export default RemoteControl;
