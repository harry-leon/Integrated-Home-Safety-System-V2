import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import Ribbon3D from '../components/Ribbon3D';

const BADGES = [
  { icon: 'shield', label: 'AES-256' },
  { icon: 'lock_clock', label: 'Auto-lock' },
  { icon: 'fingerprint', label: 'Biometric' },
];

const Login = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen overflow-hidden relative bg-[#060a12] text-white font-body">

      {/* 3-D ribbon canvas */}
      <div className="absolute inset-0 z-0">
        <Ribbon3D />
      </div>

      {/* vignette */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(6,10,18,0.82) 100%)' }}
      />

      {/* cyber grid */}
      <div className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(15,98,254,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,98,254,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* dot matrix */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.12] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(100,160,255,0.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />

      {/* scanlines */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
        }}
      />

      {/* top HUD bar */}
      <div className="absolute top-0 left-0 right-0 z-[5] h-8 border-b border-blue-500/10 flex items-center px-6 gap-4 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[8px] text-green-400/70 font-bold tracking-[0.3em] uppercase">SENTINEL SYS ONLINE</span>
        </div>
        <div className="flex-1 border-t border-blue-500/10" />
        <span className="text-[8px] text-blue-400/40 font-['Inter'] tracking-widest">AUTH v2.4.1</span>
      </div>

      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 min-h-screen grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-12 items-center py-12">

        {/* ── Left branding ───────────────────────────────────────── */}
        <div className="hidden md:flex md:col-span-6 flex-col justify-center space-y-8 pr-8 animate-in slide-in-from-left-8 duration-700">
          <div className="space-y-5">
            <span className="text-blue-400/80 font-bold tracking-[0.3em] text-[9px] uppercase flex items-center gap-2">
              <span className="w-4 h-px bg-blue-400/50" />
              Hệ Thống Bảo Mật Cấp Cao
              <span className="w-4 h-px bg-blue-400/50" />
            </span>
            <h1
              className="text-7xl font-extrabold tracking-tight font-headline leading-none glitch-text"
              data-text="SENTINEL."
              style={{ textShadow: '0 0 40px rgba(59,130,246,0.35)' }}
            >
              SENTINEL<span className="text-blue-400">.</span>
            </h1>
            <p className="text-slate-400/80 text-base max-w-md font-light leading-relaxed">
              Kiểm soát truy cập toàn diện với độ trễ cực thấp. Bảo vệ tài sản số bằng công nghệ Precision Secure tiên tiến.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { icon: 'verified_user', color: 'text-blue-400', title: 'Xác thực 2 lớp', sub: 'Bảo mật đa tầng' },
              { icon: 'history',       color: 'text-cyan-400',  title: 'Truy vết tức thì', sub: 'Giám sát 24/7' },
            ].map(c => (
              <div
                key={c.icon}
                className="
                  relative p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]
                  backdrop-blur-sm hover:bg-white/[0.07] hover:border-blue-500/20
                  transition-all group overflow-hidden
                "
              >
                {/* left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500/40 group-hover:bg-blue-400 transition-colors" />
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined ${c.color} text-xl`}>{c.icon}</span>
                  <div>
                    <div className="text-sm font-semibold">{c.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{c.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* system metrics */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'LATENCY',  val: '< 12ms',  icon: 'speed' },
              { label: 'UPTIME',   val: '99.98%',  icon: 'cloud_done' },
              { label: 'NODES',    val: '4 Active', icon: 'hub' },
            ].map(m => (
              <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                <span className="material-symbols-outlined text-blue-400/60 text-[14px] block mb-1">{m.icon}</span>
                <div className="text-sm font-black text-white/80 tabular-nums">{m.val}</div>
                <div className="text-[8px] text-slate-600 uppercase tracking-widest mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form card ──────────────────────────────────────── */}
        <div className="md:col-span-6 lg:col-span-5 lg:col-start-8 animate-in slide-in-from-right-8 duration-700">
          <div className="relative bg-white/[0.05] backdrop-blur-2xl border border-white/[0.10] p-8 md:p-10 rounded-[2rem] shadow-2xl overflow-hidden">

            {/* top neon line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80" />

            {/* inner scanline sweep */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
              <div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
                style={{ animation: 'scanline-sweep 5s linear infinite' }}
              />
            </div>

            {/* HUD corners */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-blue-400/40" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-blue-400/40" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-blue-400/20" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-blue-400/20" />

            {/* mobile logo */}
            <div className="md:hidden flex justify-center mb-6">
              <h2 className="text-3xl font-extrabold tracking-tight font-headline" style={{ textShadow: '0 0 20px rgba(59,130,246,0.5)' }}>
                SENTINEL
              </h2>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 data-pulse" />
                <span className="text-[9px] text-blue-400/70 font-bold tracking-[0.3em] uppercase">AUTH PORTAL</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Đăng nhập</h3>
              <p className="text-slate-500 text-sm mt-1">Vui lòng nhập thông tin để truy cập hệ thống.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-500/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 tracking-[0.25em] uppercase ml-1" htmlFor="email">
                  Email Hệ Thống
                </label>
                <div className="relative group/f">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-lg transition-colors duration-200 group-focus-within/f:text-blue-400">
                    alternate_email
                  </span>
                  <input
                    id="email" type="email" required disabled={loading}
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="name@sentinel.security"
                    className="
                      w-full bg-white/[0.05] border border-white/[0.10] rounded-xl
                      py-3.5 pl-12 pr-4 text-white placeholder:text-slate-700
                      focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/40
                      transition-all outline-none text-sm
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-bold text-slate-500 tracking-[0.25em] uppercase" htmlFor="password">
                    Mật Khẩu
                  </label>
                  <a href="#" className="text-[10px] text-blue-400/70 hover:text-blue-300 transition-colors">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative group/f">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-lg transition-colors duration-200 group-focus-within/f:text-blue-400">
                    lock
                  </span>
                  <input
                    id="password" type={showPass ? 'text' : 'password'} required disabled={loading}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="
                      w-full bg-white/[0.05] border border-white/[0.10] rounded-xl
                      py-3.5 pl-12 pr-12 text-white placeholder:text-slate-700
                      focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/40
                      transition-all outline-none text-sm
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center gap-3 px-1">
                <input
                  id="remember" type="checkbox" disabled={loading}
                  className="w-3.5 h-3.5 rounded bg-white/5 border-white/20 accent-blue-500 outline-none"
                />
                <label htmlFor="remember" className="text-xs text-slate-500 cursor-pointer select-none">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="
                  relative w-full mt-2 py-3.5 rounded-xl font-bold text-base text-white overflow-hidden
                  bg-gradient-to-r from-blue-700 to-blue-500
                  hover:from-blue-600 hover:to-blue-400
                  hover:shadow-[0_0_32px_rgba(59,130,246,0.55)]
                  hover:scale-[1.02] active:scale-[0.98]
                  transition-all flex items-center justify-center gap-2.5
                  disabled:opacity-50 disabled:pointer-events-none
                  group
                "
              >
                {/* holo shimmer on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 holo-shimmer transition-opacity" />
                <span className="relative flex items-center gap-2.5">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      Đăng nhập
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
              <p className="text-slate-500 text-xs">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline transition-all">
                  Đăng ký ngay →
                </Link>
              </p>
            </div>
          </div>

          {/* trust badges */}
          <div className="mt-5 flex justify-center gap-5">
            {BADGES.map(b => (
              <div key={b.label} className="flex items-center gap-1.5 text-slate-700 hover:text-slate-500 transition-colors">
                <span className="material-symbols-outlined text-[12px]">{b.icon}</span>
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* data stream ticker */}
      <div className="absolute bottom-8 left-0 right-0 z-10 overflow-hidden pointer-events-none">
        <div className="flex whitespace-nowrap ticker-inner gap-8 text-[8px] text-blue-400/20 font-['Inter'] tracking-widest uppercase">
          {Array(4).fill(null).map((_, i) => (
            <span key={i}>
              ◆ SENTINEL PRECISION SECURE ◆ AES-256 ENCRYPTION ◆ BIOMETRIC AUTH ◆ ZERO-TRUST ARCHITECTURE ◆ REAL-TIME MONITORING ◆ &nbsp;
            </span>
          ))}
        </div>
      </div>

      <footer className="absolute bottom-3 left-0 w-full flex justify-center z-10 pointer-events-none">
        <p className="text-[8px] text-slate-800 tracking-[0.35em] uppercase hidden sm:block">
          © 2024 SENTINEL PRECISION SECURE · ALL RIGHTS RESERVED
        </p>
      </footer>
    </div>
  );
};

export default Login;
