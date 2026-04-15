import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex items-center justify-center overflow-hidden relative">
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(var(--color-surface-container) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      ></div>
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-12 items-center min-h-[500px]">
        {/* Left Side Branding */}
        <div className="hidden md:flex md:col-span-6 flex-col justify-center space-y-8 pr-12 animate-in slide-in-from-left-8 duration-700">
          <div className="space-y-4">
            <span className="text-primary font-bold tracking-[0.2em] text-sm uppercase">{t('Hệ Thống Bảo Mật Cấp Cao')}</span>
            <h1 className="text-6xl font-extrabold tracking-tight font-headline leading-tight">
              SENTINEL<span className="text-primary">.</span>
            </h1>
            <p className="text-outline text-lg max-w-md font-light leading-relaxed">
              {t('Kiểm soát truy cập toàn diện với độ trễ cực thấp. Bảo vệ tài sản số của bạn bằng công nghệ Precision Secure tiên tiến nhất.')}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/10 shadow-sm">
              <span className="material-symbols-outlined text-primary mb-2 block">verified_user</span>
              <div className="text-sm font-semibold">{t('Xác thực 2 lớp')}</div>
              <div className="text-xs text-outline mt-1">{t('Bảo mật đa tầng')}</div>
            </div>
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/10 shadow-sm">
              <span className="material-symbols-outlined text-tertiary mb-2 block">history</span>
              <div className="text-sm font-semibold">{t('Truy vết tức thì')}</div>
              <div className="text-xs text-outline mt-1">{t('Giám sát 24/7')}</div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:col-span-6 lg:col-span-5 lg:col-start-8 animate-in slide-in-from-right-8 duration-700">
          <div className="bg-surface/70 backdrop-blur-2xl p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group border border-outline-variant/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-50"></div>
            
            <div className="md:hidden flex justify-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight font-headline text-on-surface">SENTINEL</h2>
            </div>
            
            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-2 tracking-tight">{t('Đăng nhập')}</h3>
              <p className="text-outline text-sm">{t('Vui lòng nhập thông tin để truy cập hệ thống.')}</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-error/10 text-error px-4 py-3 rounded-xl text-sm font-medium border border-error/20">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-outline tracking-wider uppercase ml-1" htmlFor="email">{t('Email Hệ Thống')}</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg transition-colors group-focus-within/input:text-primary">alternate_email</span>
                  <input 
                    className="w-full bg-surface-container-highest border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/50 transition-all font-label outline-none shadow-sm" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@sentinel.security" 
                    type="email" 
                    required 
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-semibold text-outline tracking-wider uppercase" htmlFor="password">{t('Mật Khẩu')}</label>
                  <a className="text-xs text-primary hover:opacity-80 transition-colors font-medium" href="#">{t('Quên mật khẩu?')}</a>
                </div>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg transition-colors group-focus-within/input:text-primary">lock</span>
                  <input 
                    className="w-full bg-surface-container-highest border-none rounded-xl py-4 pl-12 pr-12 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/50 transition-all font-label outline-none shadow-sm" 
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    type="password" 
                    required 
                    disabled={loading}
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" type="button">
                    <span className="material-symbols-outlined text-lg">visibility</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 px-1 mt-2">
                <input 
                  className="w-5 h-5 rounded bg-surface-container-highest border-none text-primary focus:ring-offset-background focus:ring-primary/50 cursor-pointer outline-none" 
                  id="remember" 
                  type="checkbox" 
                />
                <label className="text-sm text-outline cursor-pointer select-none" htmlFor="remember">{t('Ghi nhớ đăng nhập trên thiết bị này')}</label>
              </div>
              
              <button 
                className="w-full py-4 rounded-xl font-bold text-lg shadow-sm hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 bg-gradient-to-br from-primary-container to-primary text-on-primary-container disabled:opacity-50 disabled:pointer-events-none" 
                type="submit"
                disabled={loading}
              >
                {loading ? t('Đang xử lý...') : t('Đăng nhập')}
                {!loading && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
              </button>
            </form>
            
            <div className="mt-10 pt-8 border-t border-outline-variant/10 text-center">
              <p className="text-outline text-sm font-medium">
                {t('Chưa có tài khoản?')} 
                <Link className="text-primary hover:underline underline-offset-4 ml-1 transition-all" to="/register">{t('Đăng ký ngay')}</Link>
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-outline hover:text-on-surface transition-colors cursor-default">
              <span className="material-symbols-outlined text-[16px]">shield</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">AES-256</span>
            </div>
            <div className="flex items-center gap-2 text-outline hover:text-on-surface transition-colors cursor-default">
              <span className="material-symbols-outlined text-[16px]">lock_clock</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">Auto-lock</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-8 left-0 w-full flex justify-center z-10 pointer-events-none">
        <p className="text-[10px] text-outline tracking-[0.3em] font-medium uppercase text-center hidden sm:block">
          © 2024 SENTINEL PRECISION SECURE. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
};

export default Login;
