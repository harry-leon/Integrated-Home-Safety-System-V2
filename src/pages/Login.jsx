import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import House3D from '../components/House3D';

const BOTTOM_BADGES = [
  { icon: 'shield_lock', label: 'Military-Grade AES-256' },
  { icon: 'memory',      label: 'AI Threat Detection' },
  { icon: 'verified',    label: 'ISO 27001 Certified' },
];

const TRUST_BADGES = [
  { icon: 'shield',      label: 'AES-256' },
  { icon: 'lock_clock',  label: 'Auto-lock' },
  { icon: 'fingerprint', label: 'Biometric' },
];

const FEATURES = [
  { dot: '#2dd4bf', title: 'Smart Hub Core',      sub: 'Quản lý tập trung mọi cảm biến IoT' },
  { dot: '#38bdf8', title: 'Grid Architecture',   sub: 'Phân tách dữ liệu đa tầng bảo mật' },
  { dot: '#a855f7', title: 'Smart Lock Control',  sub: 'Điều khiển từ xa' },
];

const STATS = [
  { num: '3D',    label: 'Bản đồ số' },
  { num: 'E2EE',  label: 'Mã hóa chuẩn' },
  { num: '99.9%', label: 'Độ ổn định' },
];

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { lang, toggleLang, t } = useLang();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const cardRef = useRef(null);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const hideGuideFromScene = (_e) => {};

  /* ── Card mouse glow ─────────────────────────────────────────── */
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

  return (
    <div
      className="min-h-screen overflow-hidden relative text-white font-body"
      style={{ background: '#020617' }}
      onClickCapture={hideGuideFromScene}
      onPointerDownCapture={hideGuideFromScene}
      onWheelCapture={hideGuideFromScene}
    >
      {/* 3-D house canvas */}
      <div className="absolute inset-0 z-[4]">
        <House3D onInteract={() => {}} />
      </div>

      {/* Interaction layer — passes clicks to House3D */}
      <div
        aria-hidden="true"
        data-testid="house-interaction-layer"
        className="absolute inset-y-0 left-0 z-[8] w-full cursor-grab active:cursor-grabbing md:w-[58vw]"
        style={{ background: 'rgba(255,255,255,0.001)' }}
      />

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
          <span className="text-[8px] text-green-400/70 font-bold tracking-[0.3em] uppercase">SENTINEL SYS ONLINE</span>
        </div>
        <div className="flex-1 border-t border-blue-500/10" />
        <span className="text-[8px] text-blue-400/40 font-['Inter'] tracking-widest">AUTH v5.0.GRID</span>
      </div>

      <button
        type="button"
        onClick={toggleLang}
        className="pointer-events-auto absolute right-6 top-12 z-[20] rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white backdrop-blur hover:border-blue-300/40"
        title={t('switch_language')}
      >
        {lang === 'vn' ? 'VI' : 'EN'}
      </button>

      {/* Main layout */}
      <main className="relative z-10 pointer-events-none w-full max-w-[1440px] mx-auto px-6 md:px-14 min-h-screen grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-12 items-center py-12">

        {/* ── Left branding ─────────────────────────────────────── */}
        <div className="hidden md:flex md:col-span-6 flex-col justify-center gap-9 pr-8 animate-in slide-in-from-left-8 duration-700 select-none">

          {/* Tagline */}
          <div className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#38bdf8] flex items-center gap-3">
            <span className="w-8 h-px bg-[#38bdf8]" />
            Hệ sinh thái Smart Home bảo mật cao
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1
              className="text-[clamp(52px,5.5vw,72px)] font-black leading-[1.05] tracking-tight font-headline glitch-text"
              data-text="SENTINEL."
              style={{ textShadow: '0 0 40px rgba(15,98,254,0.35)' }}
            >
              SENTINEL<span className="text-[#38bdf8]">.</span>
            </h1>
            <p className="text-[rgba(200,210,230,0.5)] text-base leading-[1.8] max-w-[460px] font-light">
              Hệ thống Nhà thông minh thế hệ mới tích hợp bảo mật đa lớp, hiển thị trực quan cấu trúc mạng nội bộ và giám sát thiết bị IoT theo thời gian thực.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-9">
            {STATS.map((s, i) => (
              <React.Fragment key={s.num}>
                {i > 0 && <div className="w-px self-stretch bg-white/[0.08]" />}
                <div className="flex flex-col gap-1.5">
                  <span
                    className="font-black text-3xl text-white tabular-nums"
                    style={{ textShadow: '0 0 20px rgba(56,189,248,0.4)' }}
                  >{s.num}</span>
                  <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-500">{s.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Feature cards */}
          <div className="flex flex-col gap-2.5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="feat-item-hover flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-[rgba(15,23,42,0.3)] border border-white/[0.03] cursor-default"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: f.dot, boxShadow: `0 0 12px ${f.dot}` }}
                />
                <div className="text-sm text-[rgba(200,210,230,0.6)]">
                  <strong className="text-[rgba(248,250,252,0.9)] font-semibold">{f.title}</strong>
                  {' '}— {f.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form card ────────────────────────────────────── */}
        <div
          data-auth-card="true"
          className="pointer-events-auto md:col-span-6 lg:col-span-5 lg:col-start-8 animate-in slide-in-from-right-8 duration-700"
        >
          {/* Outer wrapper — double border effect */}
          <div className="p-[1px] rounded-[26px]"
            style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(45,212,191,0.1), rgba(56,189,248,0.05))' }}>
            <div
              ref={cardRef}
              className="form-card-glow relative rounded-[24px] p-10 overflow-hidden"
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

              {/* Inner scanline sweep */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[24px]">
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
                  style={{ animation: 'scanline-sweep 5s linear infinite' }} />
              </div>

              {/* HUD corners */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-blue-400/40" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-blue-400/40" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-blue-400/20" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-blue-400/20" />

              {/* Mobile logo */}
              <div className="md:hidden flex justify-center mb-6">
                <h2 className="text-3xl font-extrabold tracking-tight font-headline"
                  style={{ textShadow: '0 0 20px rgba(15,98,254,0.5)' }}>SENTINEL</h2>
              </div>

              {/* Form badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-400">AUTH PORTAL</span>
              </div>

              {/* Heading */}
              <h3 className="text-[32px] font-extrabold tracking-tight leading-tight mb-2">{t('login_title')}</h3>
              <p className="text-sm text-slate-400/70 mb-9">{t('login_desc')}</p>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-500/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {error}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400/80" htmlFor="email">
                    Tài khoản
                  </label>
                  <div className="relative group/f">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl transition-all duration-300 group-focus-within/f:text-[#38bdf8]">
                      account_circle
                    </span>
                    <input
                      id="email" type="email" required disabled={loading}
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="admin@sentinel.io"
                      className="w-full bg-[rgba(15,23,42,0.5)] border border-[rgba(56,189,248,0.15)] rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#38bdf8]/20 focus:border-[#38bdf8]/50 transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400/80" htmlFor="password">
                      Mã khóa
                    </label>
                    <Link to="/forgot-password" className="text-[11px] text-[#38bdf8]/70 hover:text-[#38bdf8] transition-colors">
                      {t('forgot_password')}
                    </Link>
                  </div>
                  <div className="relative group/f">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl transition-all duration-300 group-focus-within/f:text-[#38bdf8]">
                      lock
                    </span>
                    <input
                      id="password" type={showPass ? 'text' : 'password'} required disabled={loading}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[rgba(15,23,42,0.5)] border border-[rgba(56,189,248,0.15)] rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-[#38bdf8]/20 focus:border-[#38bdf8]/50 transition-all outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <span className="material-symbols-outlined text-xl">{showPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {/* Remember */}
                <div className="flex items-center gap-3 px-1">
                  <input id="remember" type="checkbox" disabled={loading}
                    className="w-4 h-4 rounded bg-white/5 border-white/20 accent-[#0f62fe] outline-none" />
                  <label htmlFor="remember" className="text-xs text-slate-500 cursor-pointer select-none">
                    {t('remember_session')}
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={loading}
                  className="relative w-full py-[18px] rounded-2xl font-bold text-base text-white overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,98,254,0.4)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none group"
                  style={{ background: 'linear-gradient(135deg, #0f62fe, #0284c7)', boxShadow: '0 10px 30px rgba(15,98,254,0.3)' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 holo-shimmer transition-opacity" />
                  <span className="relative flex items-center justify-center gap-2.5">
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang giải mã...
                      </>
                    ) : (
                      <>
                        {t('login_submit')}
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* OR divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-slate-600">hoặc xác thực bằng</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm font-semibold text-slate-300 hover:bg-white/[0.07] hover:border-[#38bdf8]/30 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#38bdf8]">fingerprint</span>
                  Sinh trắc học
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm font-semibold text-slate-300 hover:bg-white/[0.07] hover:border-[#38bdf8]/30 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#38bdf8]">nfc</span>
                  Thẻ bảo mật NFC
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
                <p className="text-sm text-slate-500">
                  {t('no_account')}{' '}
                  <Link to="/register" className="text-[#38bdf8] hover:text-[#7dd3fc] font-semibold transition-colors">
                    {t('register_title')} →
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-5 flex justify-center gap-5">
            {TRUST_BADGES.map(b => (
              <div key={b.label} className="flex items-center gap-1.5 text-slate-700 hover:text-slate-500 transition-colors">
                <span className="material-symbols-outlined text-[12px]">{b.icon}</span>
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-8 py-5 pointer-events-none">
        {BOTTOM_BADGES.map(b => (
          <div key={b.label} className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-700">
            <span className="material-symbols-outlined text-[12px] text-slate-600">{b.icon}</span>
            {b.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Login;
