import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import Ribbon3D from '../components/Ribbon3D';

const Register = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
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
      await register(fullName, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-[#060a12] text-white font-body">

      {/* 3-D ribbon */}
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
          backgroundImage: 'linear-gradient(rgba(251,146,60,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(251,146,60,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* dot matrix */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.12] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(rgba(255,150,80,0.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />

      {/* scanlines */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
        }}
      />

      {/* top HUD bar */}
      <div className="absolute top-0 left-0 right-0 z-[5] h-8 border-b border-orange-500/10 flex items-center px-6 gap-4 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-[8px] text-orange-400/70 font-bold tracking-[0.3em] uppercase">NODE REGISTRATION PORTAL</span>
        </div>
        <div className="flex-1 border-t border-orange-500/10" />
        <span className="text-[8px] text-orange-400/30 font-['Inter'] tracking-widest">REG v2.4.1</span>
      </div>

      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 min-h-screen grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-12 items-center py-12">

        {/* ── Left branding ───────────────────────────────────────── */}
        <div className="hidden md:flex md:col-span-6 flex-col justify-center space-y-8 pr-8 animate-in slide-in-from-left-8 duration-700">
          <div className="space-y-5">
            <span className="text-orange-400/80 font-bold tracking-[0.3em] text-[9px] uppercase flex items-center gap-2">
              <span className="w-4 h-px bg-orange-400/50" />
              Tạo Hồ Sơ Quản Trị Mới
              <span className="w-4 h-px bg-orange-400/50" />
            </span>
            <h1
              className="text-7xl font-extrabold tracking-tight font-headline leading-none glitch-text"
              data-text="SENTINEL."
              style={{ textShadow: '0 0 40px rgba(251,146,60,0.35)' }}
            >
              SENTINEL<span className="text-orange-400">.</span>
            </h1>
            <p className="text-slate-400/80 text-base max-w-md font-light leading-relaxed">
              Thiết lập quyền kiểm soát tối cao. Đăng ký chứng chỉ điện tử để trở thành Node Quản Trị Hệ Thống.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { icon: 'passkey', color: 'text-orange-400', title: 'Mã hóa End-to-End PGP', sub: 'Bảo mật tuyệt đối' },
              { icon: 'hub',     color: 'text-cyan-400',   title: 'Multi-Node Access Control', sub: 'Phân quyền tinh tế' },
            ].map(c => (
              <div
                key={c.icon}
                className="
                  relative p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]
                  backdrop-blur-sm hover:bg-white/[0.07] hover:border-orange-500/20
                  transition-all group overflow-hidden
                "
              >
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-500/40 group-hover:bg-orange-400 transition-colors" />
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

          {/* privilege tier */}
          <div className="bg-white/[0.03] border border-orange-500/10 rounded-2xl p-4">
            <p className="text-[9px] text-orange-400/60 uppercase tracking-[0.25em] font-bold mb-3">PRIVILEGE TIER GRANTED</p>
            <div className="flex gap-3">
              {['READ', 'WRITE', 'EXECUTE', 'ADMIN'].map((tier, i) => (
                <div key={tier} className={`
                  flex-1 text-center py-2 rounded-lg border text-[8px] font-black tracking-wider uppercase
                  ${i < 3
                    ? 'border-orange-500/20 text-orange-400/60 bg-orange-500/5'
                    : 'border-orange-400/40 text-orange-300 bg-orange-500/10'
                  }
                `}>
                  {tier}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form card ──────────────────────────────────────── */}
        <div className="md:col-span-6 lg:col-span-5 lg:col-start-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="relative bg-white/[0.05] backdrop-blur-2xl border border-white/[0.10] p-8 md:p-10 rounded-[2rem] shadow-2xl overflow-hidden">

            {/* top neon line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-70" />

            {/* inner scanline sweep */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
              <div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400/25 to-transparent"
                style={{ animation: 'scanline-sweep 5s linear 1.5s infinite' }}
              />
            </div>

            {/* HUD corners */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-orange-400/40" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-orange-400/40" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-orange-400/20" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-orange-400/20" />

            {/* mobile logo */}
            <div className="md:hidden flex justify-center mb-6">
              <h2 className="text-3xl font-extrabold tracking-tight font-headline" style={{ textShadow: '0 0 20px rgba(251,146,60,0.5)' }}>
                SENTINEL
              </h2>
            </div>

            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 data-pulse" />
                <span className="text-[9px] text-orange-400/70 font-bold tracking-[0.3em] uppercase">NODE INIT</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Đăng ký</h3>
              <p className="text-slate-500 text-sm mt-1">Điền dữ liệu hệ thống để cấp phát Token.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-500/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {error}
                </div>
              )}

              {/* Full name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 tracking-[0.25em] uppercase ml-1" htmlFor="fullname">
                  Tên Định Danh
                </label>
                <div className="relative group/f">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-lg transition-colors duration-200 group-focus-within/f:text-orange-400">
                    badge
                  </span>
                  <input
                    id="fullname" type="text" required disabled={loading}
                    value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="
                      w-full bg-white/[0.05] border border-white/[0.10] rounded-xl
                      py-3.5 pl-12 pr-4 text-white placeholder:text-slate-700
                      focus:ring-1 focus:ring-orange-500/40 focus:border-orange-500/40
                      transition-all outline-none text-sm
                    "
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 tracking-[0.25em] uppercase ml-1" htmlFor="reg-email">
                  Email Hệ Thống
                </label>
                <div className="relative group/f">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-lg transition-colors duration-200 group-focus-within/f:text-orange-400">
                    alternate_email
                  </span>
                  <input
                    id="reg-email" type="email" required disabled={loading}
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="name@sentinel.security"
                    className="
                      w-full bg-white/[0.05] border border-white/[0.10] rounded-xl
                      py-3.5 pl-12 pr-4 text-white placeholder:text-slate-700
                      focus:ring-1 focus:ring-orange-500/40 focus:border-orange-500/40
                      transition-all outline-none text-sm
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 tracking-[0.25em] uppercase ml-1" htmlFor="reg-password">
                  Mật Khẩu
                </label>
                <div className="relative group/f">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-lg transition-colors duration-200 group-focus-within/f:text-orange-400">
                    vpn_key
                  </span>
                  <input
                    id="reg-password" type={showPass ? 'text' : 'password'} required disabled={loading}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="
                      w-full bg-white/[0.05] border border-white/[0.10] rounded-xl
                      py-3.5 pl-12 pr-12 text-white placeholder:text-slate-700
                      focus:ring-1 focus:ring-orange-500/40 focus:border-orange-500/40
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

              {/* Terms */}
              <div className="flex items-center gap-3 px-1 mt-1">
                <input
                  id="terms" type="checkbox" required disabled={loading}
                  checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-white/5 border-white/20 accent-orange-500 outline-none"
                />
                <label htmlFor="terms" className="text-xs text-slate-500 cursor-pointer select-none">
                  Tôi đồng ý với chính sách bảo mật nội bộ
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading || !agreedTerms}
                className="
                  relative w-full mt-2 py-3.5 rounded-xl font-bold text-base text-white overflow-hidden
                  bg-gradient-to-r from-orange-700 to-orange-500
                  hover:from-orange-600 hover:to-orange-400
                  hover:shadow-[0_0_32px_rgba(251,146,60,0.55)]
                  hover:scale-[1.02] active:scale-[0.98]
                  transition-all flex items-center justify-center gap-2.5
                  disabled:opacity-50 disabled:pointer-events-none
                  group
                "
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 holo-shimmer transition-opacity" />
                <span className="relative flex items-center gap-2.5">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">person_add</span>
                      Cấp quyền Admin
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
              <p className="text-slate-500 text-xs">
                Đã có thẻ đặc quyền?{' '}
                <Link to="/login" className="text-orange-400 hover:text-orange-300 underline-offset-4 hover:underline transition-all">
                  Đăng nhập ngay →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* data stream ticker */}
      <div className="absolute bottom-8 left-0 right-0 z-10 overflow-hidden pointer-events-none">
        <div className="flex whitespace-nowrap ticker-inner gap-8 text-[8px] text-orange-400/15 font-['Inter'] tracking-widest uppercase">
          {Array(4).fill(null).map((_, i) => (
            <span key={i}>
              ◆ SENTINEL ADMIN PORTAL ◆ PGP ENCRYPTED ◆ ZERO-TRUST ◆ MULTI-NODE ACCESS ◆ BIOMETRIC AUTH ◆ &nbsp;
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

export default Register;
