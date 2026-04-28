import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ReminderAlertModal from '../components/ReminderAlertModal';

const AlertModalContext = createContext();

export const AlertModalProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const recentAlertKeysRef = useRef(new Map());
  const activeAlertRef = useRef(null);
  const isClosingRef = useRef(false);
  const DEDUPE_WINDOW_MS = 1500;

  React.useEffect(() => {
    activeAlertRef.current = activeAlert;
  }, [activeAlert]);

  const showAlert = useCallback((config) => {
    // config: { type, title, message, confirmText, cancelText, onConfirm, showCancelButton, dedupeKey }
    const now = Date.now();
    const fallbackKey = `${config?.type || 'warning'}|${config?.title || ''}|${config?.message || ''}`;
    const dedupeKey = config?.dedupeKey || fallbackKey;
    const lastSeen = recentAlertKeysRef.current.get(dedupeKey) || 0;

    if (now - lastSeen < DEDUPE_WINDOW_MS) {
      return;
    }
    setQueue((prev) => {
      const active = activeAlertRef.current;
      const activeKey = active?.dedupeKey || `${active?.type || 'warning'}|${active?.title || ''}|${active?.message || ''}`;
      if (active && activeKey === dedupeKey) {
        return prev;
      }

      const alreadyQueued = prev.some((item) => {
        const itemKey = item?.dedupeKey || `${item?.type || 'warning'}|${item?.title || ''}|${item?.message || ''}`;
        return itemKey === dedupeKey;
      });
      if (alreadyQueued) {
        return prev;
      }

      recentAlertKeysRef.current.set(dedupeKey, now);
      return [...prev, { id: now, ...config, dedupeKey }];
    });
  }, []);

  const closeAlert = useCallback(() => {
    isClosingRef.current = true;
    setActiveAlert(null);
    setQueue((prev) => prev.slice(1));
    setTimeout(() => {
      isClosingRef.current = false;
    }, 50);
  }, []);

  const playAlertSound = useCallback((type) => {
    if (type === 'error' || type === 'warning') {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch((err) => console.warn('Audio play blocked:', err));
    }
  }, []);

  // Effect to process queue
  React.useEffect(() => {
    if (!activeAlert && !isClosingRef.current && queue.length > 0) {
      const nextAlert = queue[0];
      setActiveAlert(nextAlert);
      playAlertSound(nextAlert.type);
    }
  }, [queue, activeAlert, playAlertSound]);

  const handleConfirm = () => {
    if (activeAlert?.onConfirm) {
      activeAlert.onConfirm();
    }
    closeAlert();
  };

  return (
    <AlertModalContext.Provider value={{ showAlert }}>
      {children}
      {activeAlert && (
        <ReminderAlertModal
          isOpen={!!activeAlert}
          type={activeAlert.type}
          title={activeAlert.title}
          message={activeAlert.message}
          confirmText={activeAlert.confirmText}
          cancelText={activeAlert.cancelText}
          onConfirm={handleConfirm}
          onClose={activeAlert.preventClose ? null : closeAlert}
          showCancelButton={activeAlert.showCancelButton}
          preventClose={activeAlert.preventClose}
        />
      )}
    </AlertModalContext.Provider>
  );
};

export const useAlertModal = () => {
  const context = useContext(AlertModalContext);
  if (!context) {
    throw new Error('useAlertModal must be used within an AlertModalProvider');
  }
  return context;
};
