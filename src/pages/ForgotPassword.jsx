import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import House3D from '../components/House3D';

const BOTTOM_BADGES = [
  { icon: 'shield_lock', label: 'AES-256 Encrypted' },
  { icon: 'memory',      label: 'AI Threat Detection' },
  { icon: 'verified',    label: 'ISO 27001 Certified' },
];

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step,            setStep]            = useState(1);
  const [email,           setEmail]           = useState('');
  const [otp,             setOtp]             = useState(['', '', '', '', '', '']);
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');

  const otpRefs = useRef([]);
  const cardRef = useRef(null);

  const handleCardMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
    card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(56,189,248,0.08) 0%, transparent 50%), rgba(10,15,28,0.65)`;
  };
  const handleCardMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.background = 'rgba(10,15,28,0.65)';
  };

  /* ── OTP handlers ─────────────────────────────────────────────── */
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  /* ── Step submit handlers ─────────────────────────────────────── */
  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setStep(2);
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    setError('');
    if (otp.some(d => d === '')) {
      setError('Vui lòng nhập đủ 6 chữ số.');
      return;
    }
    setStep(3);
  };

  const handleStep3 = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setStep('success');
  };

  /* ── Step indicator ───────────────────────────────────────────── */
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map(s => (
        <div
          key={s}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: '2rem',
            background: s === step
              ? '#38bdf8'
              : s < step
                ? 'rgba(56,189,248,0.4)'
                : 'rgba(255,255,255,0.08)',
            boxShadow: s === step ? '0 0 12px rgba(56,189,248,0.4)' : 'none',
          }}
        />
      ))}
    </div>
  );

  /* ── Shared card wrapper ──────────────────────────────────────── */
  const CardWrapper = ({ children }) => (
    <div className="p-[1px] rounded-[26px]"
      style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(45,212,191,0.1), rgba(56,189,248,0.05))' }}>
      <div
        ref={cardRef}
        className="relative rounded-[24px] p-10 overflow-hidden"
        style={{
          background: 'rgba(10,15,28,0.65)',
          backdropFilter: 'blur(40px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.2)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02) inset',
        }}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
      >
        {/* Top neon line */}
        <div className="absolute top-0 left-[10%] right-[10%] h-[2px] opacity-80"
          style={{ background: 'linear-gradient(90deg, transparent, #38bdf8, #2dd4bf, transparent)' }} />

        {/* Scanline sweep */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[24px]">
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
            style={{ animation: 'scanline-sweep 5s linear infinite' }} />
        </div>

        {/* HUD corners */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-blue-400/40" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-blue-400/40" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-blue-400/20" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-blue-400/20" />

        {children}
      </div>
    </div>
  );

  /* ── Shared submit button ─────────────────────────────────────── */
  const SubmitButton = ({ icon, label, disabled }) => (
    <button
      type="submit"
      disabled={disabled || loading}
      className="relative w-full py-[18px] rounded-2xl font-bold text-base text-white overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,132,199,0.4)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none group"
      style={{ background: 'linear-gradient(135deg, #0284c7, #0d9488)', boxShadow: '0 10px 30px rgba(2,132,199,0.3)' }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 holo-shimmer transition-opacity" />
      <span className="relative flex items-center justify-center gap-2.5">
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg">{icon}</span>
            {label}
          </>
        )}
      </span>
    </button>
  );

  return (
    <div
      className="min-h-screen overflow-hidden relative text-white font-body"
      style={{ background: '#020617' }}
    >
      {/* 3-D house canvas */}
      <div className="absolute inset-0 z-[4]">
        <House3D onInteract={() => {}} />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(2,6,23,0.92) 100%)' }} />

      {/* Cyber grid */}
      <div className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(15,98,254,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,98,254,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

      {/* Dot matrix */}
      <div className="absolute inset-0 z-[2] opacity-[0.12] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(100,160,255,0.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Scanlines */}
      <div className="absolute inset-0 z-[3] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />

      {/* Top HUD bar */}
      <div className="absolute top-0 left-0 right-0 z-[5] h-8 border-b border-blue-500/10 flex items-center px-6 gap-4 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[8px] text-green-400/70 font-bold tracking-[0.3em] uppercase">RECOVERY PORTAL</span>
        </div>
        <div className="flex-1 border-t border-blue-500/10" />
        <span className="text-[8px] text-blue-400/40 font-['Inter'] tracking-widest">REC v5.0</span>
      </div>

      {/* Centered layout */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-6 py-16">
        <div
          data-auth-card="true"
          className="w-full max-w-[440px] animate-in slide-in-from-bottom-8 duration-700"
        >
          {/* ── Step 1: Email ─────────────────────────────────────── */}
          {step === 1 && (
            <CardWrapper>
              <StepIndicator />

              {/* Floating icon */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center border"
                  style={{
                    background: 'rgba(56,189,248,0.1)',
                    borderColor: 'rgba(56,189,248,0.2)',
                    animation: 'float-icon 3s ease-in-out infinite',
                  }}
                >
                  <span className="material-symbols-outlined text-[32px] text-[#38bdf8]">lock_open</span>
                </div>
              </div>

              {/* Badge */}
              <div className="flex justify-center mb-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7dd3fc]">Khôi Phục Quyền Truy Cập</span>
                </div>
              </div>

              <h3 className="text-[28px] font-extrabold tracking-tight leading-tight mb-2 text-center">Quên mật khẩu?</h3>
              <p className="text-sm text-slate-400/70 mb-8 text-center">Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác thực.</p>

              <form className="space-y-5" onSubmit={handleStep1}>
                {error && (
                  <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-500/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400/80" htmlFor="fp-email">
                    Email
                  </label>
                  <div className="relative group/f">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl transition-all duration-300 group-focus-within/f:text-[#38bdf8]">
                      mail
                    </span>
                    <input
                      id="fp-email" type="email" required disabled={loading}
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="email@sentinel.io"
                      className="w-full bg-[rgba(15,23,42,0.5)] border border-[rgba(56,189,248,0.15)] rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#38bdf8]/20 focus:border-[#38bdf8]/50 transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                <SubmitButton icon="send" label="Gửi mã xác thực" />
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-slate-500 hover:text-[#38bdf8] transition-colors">
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </CardWrapper>
          )}

          {/* ── Step 2: OTP ───────────────────────────────────────── */}
          {step === 2 && (
            <CardWrapper>
              <StepIndicator />

              {/* Badge */}
              <div className="flex justify-center mb-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7dd3fc]">Xác Thực OTP</span>
                </div>
              </div>

              <h3 className="text-[28px] font-extrabold tracking-tight leading-tight mb-2 text-center">Nhập mã xác thực</h3>
              <p className="text-sm text-slate-400/70 mb-8 text-center">
                Mã gồm 6 chữ số đã được gửi tới <span className="text-[#38bdf8]">{email}</span>
              </p>

              <form className="space-y-6" onSubmit={handleStep2}>
                {error && (
                  <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-500/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {error}
                  </div>
                )}

                {/* OTP inputs */}
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-[rgba(15,23,42,0.5)] border border-[rgba(56,189,248,0.2)] text-white outline-none transition-all duration-200 focus:border-[#38bdf8] focus:shadow-[0_0_0_4px_rgba(56,189,248,0.1)]"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-[#38bdf8] transition-colors"
                    onClick={() => {
                      setOtp(['', '', '', '', '', '']);
                      otpRefs.current[0]?.focus();
                    }}
                  >
                    Chưa nhận được mã? Gửi lại
                  </button>
                </div>

                <SubmitButton icon="verified" label="Xác thực" />
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="text-sm text-slate-500 hover:text-[#38bdf8] transition-colors"
                >
                  ← Quay lại
                </button>
              </div>
            </CardWrapper>
          )}

          {/* ── Step 3: New password ──────────────────────────────── */}
          {step === 3 && (
            <CardWrapper>
              <StepIndicator />

              {/* Badge */}
              <div className="flex justify-center mb-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-pulse" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#5eead4]">Đặt Lại Mật Khẩu</span>
                </div>
              </div>

              <h3 className="text-[28px] font-extrabold tracking-tight leading-tight mb-2 text-center">Mật khẩu mới</h3>
              <p className="text-sm text-slate-400/70 mb-8 text-center">Nhập mật khẩu mới cho tài khoản của bạn.</p>

              <form className="space-y-5" onSubmit={handleStep3}>
                {error && (
                  <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-500/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {error}
                  </div>
                )}

                {/* New password */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400/80" htmlFor="new-pass">
                    Mật khẩu mới
                  </label>
                  <div className="relative group/f">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl transition-all duration-300 group-focus-within/f:text-[#38bdf8]">
                      lock
                    </span>
                    <input
                      id="new-pass" type={showNew ? 'text' : 'password'} required
                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[rgba(15,23,42,0.5)] border border-[rgba(56,189,248,0.15)] rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#38bdf8]/20 focus:border-[#38bdf8]/50 transition-all outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      aria-label={showNew ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <span className="material-symbols-outlined text-xl">{showNew ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400/80" htmlFor="confirm-pass">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative group/f">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl transition-all duration-300 group-focus-within/f:text-[#38bdf8]">
                      lock_reset
                    </span>
                    <input
                      id="confirm-pass" type={showConfirm ? 'text' : 'password'} required
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[rgba(15,23,42,0.5)] border border-[rgba(56,189,248,0.15)] rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#38bdf8]/20 focus:border-[#38bdf8]/50 transition-all outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <span className="material-symbols-outlined text-xl">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <SubmitButton icon="lock_reset" label="Đặt lại mật khẩu" />
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => { setStep(2); setError(''); }}
                  className="text-sm text-slate-500 hover:text-[#38bdf8] transition-colors"
                >
                  ← Quay lại
                </button>
              </div>
            </CardWrapper>
          )}

          {/* ── Step success ──────────────────────────────────────── */}
          {step === 'success' && (
            <CardWrapper>
              {/* Success icon */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center border"
                  style={{
                    background: 'rgba(45,212,191,0.1)',
                    borderColor: 'rgba(45,212,191,0.3)',
                    boxShadow: '0 0 32px rgba(45,212,191,0.2)',
                  }}
                >
                  <span className="material-symbols-outlined text-[40px] text-[#2dd4bf]">check_circle</span>
                </div>
              </div>

              <h3 className="text-[28px] font-extrabold tracking-tight leading-tight mb-3 text-center">Thành công!</h3>
              <p className="text-sm text-slate-400/70 mb-8 text-center">
                Mật khẩu đã được đặt lại. Bạn có thể đăng nhập bằng mật khẩu mới.
              </p>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="relative w-full py-[18px] rounded-2xl font-bold text-base text-white overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,132,199,0.4)] active:translate-y-0 group"
                style={{ background: 'linear-gradient(135deg, #0284c7, #0d9488)', boxShadow: '0 10px 30px rgba(2,132,199,0.3)' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 holo-shimmer transition-opacity" />
                <span className="relative flex items-center justify-center gap-2.5">
                  <span className="material-symbols-outlined text-lg">login</span>
                  Đăng nhập ngay
                </span>
              </button>
            </CardWrapper>
          )}
        </div>
      </main>

      {/* Bottom badges */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-8 py-5 pointer-events-none">
        {BOTTOM_BADGES.map(b => (
          <div key={b.label} className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-700">
            <span className="material-symbols-outlined text-[12px] text-slate-600">{b.icon}</span>
            {b.label}
          </div>
        ))}
      </div>

      {/* Footer copyright */}
      <footer className="absolute bottom-3 left-0 w-full flex justify-center z-10 pointer-events-none">
        <p className="text-[8px] text-slate-800 tracking-[0.35em] uppercase hidden sm:block">
          © 2024 SENTINEL PRECISION SECURE · ALL RIGHTS RESERVED
        </p>
      </footer>
    </div>
  );
};

export default ForgotPassword;
