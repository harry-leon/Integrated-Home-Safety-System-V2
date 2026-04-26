import React, { createContext, useContext, useState, useCallback } from 'react';
import ReminderAlertModal from '../components/ReminderAlertModal';

const AlertModalContext = createContext();

export const AlertModalProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);

  const showAlert = useCallback((config) => {
    // config: { type, title, message, confirmText, cancelText, onConfirm, showCancelButton }
    setQueue((prev) => [...prev, { id: Date.now(), ...config }]);
  }, []);

  const closeAlert = useCallback(() => {
    setActiveAlert(null);
    // Give a small delay for animation before processing next in queue
    setTimeout(() => {
      setQueue((prev) => prev.slice(1));
    }, 300);
  }, []);

  const playAlertSound = useCallback((type) => {
    if (type === 'error' || type === 'warning') {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch((err) => console.warn('Audio play blocked:', err));
    }
  }, []);

  // Effect to process queue
  React.useEffect(() => {
    if (!activeAlert && queue.length > 0) {
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
