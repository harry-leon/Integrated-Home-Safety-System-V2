import React, { useState } from 'react';
import { useLang } from '../contexts/LangContext';

const GuestAccessModal = ({ isOpen, onClose }) => {
  const { t } = useLang();
  const [duration, setDuration] = useState('24h');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(`${code.slice(0, 3)}-${code.slice(3)}`);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.replace('-', ''));
      // Could add a mini toast here in a real app
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Content */}
      <div 
        className="relative bg-surface p-8 max-w-md w-full rounded-3xl shadow-2xl border border-outline-variant/20 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-outline hover:text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1"
          aria-label="Đóng"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 border border-primary/20">
            <span className="material-symbols-outlined text-2xl">key</span>
          </div>
          <h2 id="modal-title" className="text-2xl font-bold font-headline text-on-surface mb-1">Cấp quyền Khách</h2>
          <p className="text-sm text-outline">Tạo mã PIN tạm thời để mở cửa mà không cần tải ứng dụng.</p>
        </div>

        <div className="space-y-6">
          {!generatedCode ? (
            <>
              <div>
                <label className="block text-xs font-bold font-label text-outline uppercase tracking-widest mb-3">Thời hạn hiệu lực</label>
                <div className="grid grid-cols-3 gap-3">
                  {['1h', '24h', '1-use'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setDuration(val)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                        duration === val 
                          ? 'border-primary bg-primary-container text-on-primary-container shadow-sm' 
                          : 'border-outline-variant/20 bg-surface-container hover:border-primary/50 text-on-surface'
                      }`}
                    >
                      {val === '1h' ? '1 Giờ' : val === '24h' ? '24 Giờ' : 'Dùng 1 lần'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary text-sm mt-0.5">info</span>
                  <div>
                    <p className="text-xs font-medium text-on-surface">Mã sẽ tự hủy sau khi hết hạn.</p>
                    <p className="text-[10px] text-outline mt-1">Lịch sử dùng mã sẽ được ghi lại trong tab Nhật ký.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-gradient-to-br from-primary-container to-primary text-on-primary-container shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    Đang tạo mã...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">vpn_key</span>
                    Tạo mã Khách
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-surface-container p-6 rounded-2xl border border-outline-variant/20 text-center mb-6">
                <p className="text-xs font-bold font-label text-outline uppercase tracking-widest mb-4">Mã PIN dành cho khách</p>
                <div className="text-5xl font-black font-mono tracking-widest text-primary mb-2 select-all">
                  {generatedCode}
                </div>
                <p className="text-sm text-on-surface font-medium mt-4 border-t border-outline-variant/10 pt-4">
                  Hết hạn {duration === '1-use' ? 'sau 1 lần dùng' : `sau ${duration}`}
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleCopy}
                  className="flex-1 flex justify-center items-center gap-2 py-3 bg-surface-container-high rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/10"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  Sao chép mã
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 flex justify-center items-center gap-2 py-3 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  Hoàn tất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestAccessModal;
