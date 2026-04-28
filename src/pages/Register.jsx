import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import House3D from '../components/House3D';

const BOTTOM_BADGES = [
  { icon: 'shield_lock', label: 'AES-256 Encrypted' },
  { icon: 'memory',      label: 'AI Threat Detection' },
  { icon: 'verified',    label: 'ISO 27001 Certified' },
];

const ACCESS_TIERS = ['MEMBER', 'VIEW_ONLY', 'CONTROL', 'OWNER'];

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: '',         color: 'transparent' },
    { label: 'Rất yếu', color: '#ef4444' },
    { label: 'Yếu',     color: '#f97316' },
    { label: 'Trung bình', color: '#eab308' },
    { label: 'Mạnh',    color: '#22c55e' },
    { label: 'Rất mạnh', color: '#2dd4bf' },
  ];
  return { score, ...map[score] };
};

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { lang, toggleLang, t } = useLang();

  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const cardRef = useRef(null);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

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

  const strength = getPasswordStrength(password);

  return (
    <div
      className="min-h-screen overflow-hidden relative text-white font-body"
      style={{ background: '#020617' }}
    >
      {/* 3-D house canvas */}
      <div className="absolute inset-0 z-[4]">
        <House3D onInteract={() => {}} />
      </div>

      {/* Interaction layer — passes clicks to House3D */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 z-[8] w-full md:w-[58vw] cursor-grab active:cursor-grabbing"
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
      <div className="absolute top-0 left-0 right-0 z-[5] h-8 border-b border-orange-500/10 flex items-center px-6 gap-4 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-[8px] text-orange-400/70 font-bold tracking-[0.3em] uppercase">NODE REGISTRATION PORTAL</span>
        </div>
        <div className="flex-1 border-t border-orange-500/10" />
        <span className="text-[8px] text-orange-400/40 font-['Inter'] tracking-widest">REG v5.0.GRID</span>
      </div>

      <button
        type="button"
        onClick={toggleLang}
        className="pointer-events-auto absolute right-6 top-12 z-[20] rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white backdrop-blur hover:border-orange-300/40"
        title={t('switch_language')}
      >
        {lang === 'vn' ? 'VI' : 'EN'}
      </button>

      {/* Main layout */}
      <main className="relative z-10 pointer-events-none w-full max-w-[1440px] mx-auto px-6 md:px-14 min-h-screen grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-12 items-center py-12">

        {/* Left branding */}
        <div className="hidden md:flex md:col-span-6 flex-col justify-center gap-9 pr-8 animate-in slide-in-from-left-8 duration-700 select-none">

          <div className="text-[11px] font-semibold tracking-[0.25em] uppercase text-orange-400 flex items-center gap-3">
            <span className="w-8 h-px bg-orange-400" />
            Tạo Hồ Sơ Quản Trị Mới
          </div>

          <div className="space-y-4">
            <h1
              className="text-[clamp(52px,5.5vw,72px)] font-black leading-[1.05] tracking-tight font-headline glitch-text"
              data-text="SENTINEL."
              style={{ textShadow: '0 0 40px rgba(249,115,22,0.35)' }}
            >
              SENTINEL<span className="text-orange-500">.</span>
            </h1>
            <p className="text-[rgba(200,210,230,0.5)] text-base leading-[1.8] max-w-[460px] font-light">
              Thiết lập quyền kiểm soát tối cao. Đăng ký chứng chỉ điện tử để trở thành Node Quản Trị Hệ Thống.
            </p>
          </div>

          {/* Feature cards */}
          <div className="flex flex-col gap-2.5">
            {[
              { icon: 'passkey', color: 'text-orange-400', dot: '#fb923c', title: 'Mã hóa End-to-End PGP', sub: 'Bảo mật tuyệt đối' },
              { icon: 'hub',     color: 'text-orange-500', dot: '#f97316', title: 'Multi-Node Access Control', sub: 'Phân quyền tinh tế' },
            ].map((item) => (
              <div
                key={item.icon}
                className="feat-item-hover flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-[rgba(15,23,42,0.3)] border border-white/[0.03] cursor-default"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: item.dot, boxShadow: `0 0 12px ${item.dot}` }}
                />
                <span className={`material-symbols-outlined ${item.color} text-xl`}>{item.icon}</span>
                <div className="text-sm text-[rgba(200,210,230,0.6)]">
                  <strong className="text-[rgba(248,250,252,0.9)] font-semibold">{item.title}</strong>
                  {' '}— {item.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Access tier grid */}
          <div className="bg-[rgba(15,23,42,0.3)] border border-[rgba(56,189,248,0.1)] rounded-2xl p-4">
            <p className="text-[9px] text-orange-400/60 uppercase tracking-[0.25em] font-bold mb-3">DEFAULT ACCOUNT ACCESS</p>
            <div className="flex gap-3">
              {ACCESS_TIERS.map((tier) => (
                <div
                  key={tier}
                  className="flex-1 text-center py-2 rounded-lg border border-orange-500/20 text-[8px] font-black tracking-wider uppercase text-orange-400/60 bg-orange-500/5"
                >
                  {tier}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form card */}
        <div
          data-auth-card="true"
          className="pointer-events-auto md:col-span-6 lg:col-span-5 lg:col-start-8 animate-in slide-in-from-right-8 duration-700"
        >
          {/* Double border wrapper */}
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
                style={{ background: 'linear-gradient(90deg, transparent, #fb923c, #f97316, transparent)' }} />

              {/* Scanline sweep */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[24px]">
                <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent"
                  style={{ animation: 'scanline-sweep 5s linear infinite', background: 'linear-gradient(to right, transparent, rgba(251,146,60,0.3), transparent)' }} />
              </div>

              {/* HUD corners */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-orange-400/40" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-orange-400/40" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-orange-400/20" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-orange-400/20" />

              {/* Mobile logo */}
              <div className="md:hidden flex justify-center mb-6">
                <h2 className="text-3xl font-extrabold tracking-tight font-headline"
                  style={{ textShadow: '0 0 20px rgba(249,115,22,0.5)' }}>SENTINEL</h2>
              </div>

              {/* Form badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-400">NODE INIT</span>
              </div>

              {/* Heading */}
              <h3 className="text-[32px] font-extrabold tracking-tight leading-tight mb-2">{t('register_title')}</h3>
              <p className="text-sm text-slate-400/70 mb-9">{t('register_desc')}</p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-500/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {error}
                  </div>
                )}

                {/* Full name */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400/80" htmlFor="fullname">
                    Họ và tên
                  </label>
                  <div className="relative group/f">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl transition-all duration-300 group-focus-within/f:text-orange-400">
                      badge
                    </span>
                    <input
                      id="fullname" type="text" required disabled={loading}
                      value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-[rgba(15,23,42,0.5)] border border-orange-500/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400/80" htmlFor="reg-email">
                    Email
                  </label>
                  <div className="relative group/f">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl transition-all duration-300 group-focus-within/f:text-orange-400">
                      alternate_email
                    </span>
                    <input
                      id="reg-email" type="email" required disabled={loading}
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="email@sentinel.io"
                      className="w-full bg-[rgba(15,23,42,0.5)] border border-orange-500/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-slate-400/80" htmlFor="reg-password">
                    Mật khẩu
                  </label>
                  <div className="relative group/f">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl transition-all duration-300 group-focus-within/f:text-orange-400">
                      lock
                    </span>
                    <input
                      id="reg-password" type={showPass ? 'text' : 'password'} required disabled={loading}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[rgba(15,23,42,0.5)] border border-orange-500/20 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all outline-none text-sm"
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

                  {/* Password strength meter */}
                  {password.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] font-semibold" style={{ color: strength.color }}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-center gap-3 px-1">
                  <input
                    id="terms" type="checkbox" required disabled={loading}
                    checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/5 border-white/20 accent-orange-500 outline-none"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-500 cursor-pointer select-none">
                    Tôi đồng ý với chính sách bảo mật nội bộ
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={loading || !agreedTerms}
                  className="relative w-full py-[18px] rounded-2xl font-bold text-base text-white overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(249,115,22,0.4)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none group"
                  style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 10px 30px rgba(249,115,22,0.3)' }}
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
                        <span className="material-symbols-outlined text-lg">how_to_reg</span>
                        {t('register_submit')}
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* OR divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-slate-600">hoặc thiết lập qua</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm font-semibold text-slate-300 hover:bg-white/[0.07] hover:border-orange-500/30 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px] text-orange-400">admin_panel_settings</span>
                  Root Node
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm font-semibold text-slate-300 hover:bg-white/[0.07] hover:border-orange-500/30 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px] text-orange-400">qr_code_scanner</span>
                  Mã QR
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
                <p className="text-sm text-slate-500">
                  {t('have_account')}{' '}
                  <Link to="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                    {t('login_title')} →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ticker */}
      <div className="absolute bottom-8 left-0 right-0 z-10 overflow-hidden pointer-events-none">
        <div className="flex whitespace-nowrap ticker-inner gap-8 text-[8px] text-orange-400/15 font-['Inter'] tracking-widest uppercase">
          {Array(4).fill(null).map((_, i) => (
            <span key={i}>
              ◆ SENTINEL ADMIN PORTAL ◆ PGP ENCRYPTED ◆ ZERO-TRUST ◆ MULTI-NODE ACCESS ◆ BIOMETRIC AUTH ◆ &nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Bottom badges */}
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

export default Register;
