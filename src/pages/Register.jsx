import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState('');
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
      await register(fullName, email, password);
      // Registration successful + auto-logged in, go straight to dashboard
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại.');
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
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-12 items-center min-h-[600px] py-12">
        {/* Left Side Branding */}
        <div className="hidden md:flex md:col-span-6 flex-col justify-center space-y-8 pr-12 animate-in slide-in-from-left-8 duration-700">
          <div className="space-y-4">
            <span className="text-tertiary font-bold tracking-[0.2em] text-sm uppercase">{t('Tạo Hồ Sơ Quản Trị Mới')}</span>
            <h1 className="text-6xl font-extrabold tracking-tight font-headline leading-tight">
              SENTINEL<span className="text-tertiary">.</span>
            </h1>
            <p className="text-outline text-lg max-w-md font-light leading-relaxed">
              {t('Thiết lập quyền kiểm soát tối cao. Hãy đăng ký chứng chỉ điện tử của bạn để trở thành Node Quản Trị Hệ Thống.')}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/10 shadow-sm flex items-center gap-4">
              <span className="material-symbols-outlined text-tertiary mb-2 block">passkey</span>
              <div>
                <div className="text-sm font-semibold">{t('Mã hóa End-to-End PGP')}</div>
                <div className="text-xs text-outline">{t('Bảo mật tuyệt đối thông tin')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:col-span-6 lg:col-span-5 lg:col-start-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-surface/70 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden group border border-outline-variant/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary to-transparent opacity-50"></div>
            
            <div className="md:hidden flex justify-center mb-6">
              <h2 className="text-3xl font-extrabold tracking-tight font-headline text-on-surface">SENTINEL</h2>
            </div>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2 tracking-tight">{t('Đăng ký')}</h3>
              <p className="text-outline text-sm">{t('Điền dữ liệu hệ thống để cấp phát Token.')}</p>
            </div>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-error/10 text-error px-4 py-3 rounded-xl text-sm font-medium border border-error/20">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-outline tracking-wider uppercase ml-1" htmlFor="fullname">{t('Tên Định Danh')}</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg transition-colors group-focus-within/input:text-tertiary">badge</span>
                  <input 
                    className="w-full bg-surface-container-highest border-none rounded-xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-tertiary/50 transition-all font-label outline-none shadow-sm" 
                    id="fullname" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A" 
                    type="text" 
                    required 
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-outline tracking-wider uppercase ml-1" htmlFor="email">{t('Email Hệ Thống')}</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg transition-colors group-focus-within/input:text-tertiary">alternate_email</span>
                  <input 
                    className="w-full bg-surface-container-highest border-none rounded-xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-tertiary/50 transition-all font-label outline-none shadow-sm" 
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
              
              <div className="space-y-2 flex gap-4">
                 <div className="flex-1 space-y-2">
                    <label className="text-xs font-semibold text-outline tracking-wider uppercase" htmlFor="password">{t('Mật Khẩu')}</label>
                    <div className="relative group/input">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg transition-colors group-focus-within/input:text-tertiary">vpn_key</span>
                      <input 
                        className="w-full bg-surface-container-highest border-none rounded-xl py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-tertiary/50 transition-all font-label outline-none shadow-sm" 
                        id="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        type="password" 
                        required 
                        disabled={loading}
                      />
                    </div>
                 </div>
              </div>
              
              <div className="flex items-center space-x-3 px-1 mt-4">
                <input 
                  className="w-5 h-5 rounded bg-surface-container-highest border-none text-tertiary focus:ring-offset-background focus:ring-tertiary/50 cursor-pointer outline-none" 
                  id="terms" 
                  type="checkbox"
                  required 
                  disabled={loading}
                />
                <label className="text-xs text-outline cursor-pointer select-none" htmlFor="terms">{t('Tôi đồng ý với chính sách bảo mật nội bộ')}</label>
              </div>
              
              <button 
                className="w-full mt-2 py-4 rounded-xl font-bold text-lg shadow-sm hover:shadow-tertiary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 bg-gradient-to-br from-tertiary-container to-tertiary text-on-tertiary-container disabled:opacity-50 disabled:pointer-events-none" 
                type="submit"
                disabled={loading}
              >
                {!loading && <span className="material-symbols-outlined text-xl">person_add</span>}
                {loading ? t('Đang xử lý...') : t('Cấp quyền Admin')}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-outline-variant/10 text-center">
              <p className="text-outline text-sm font-medium">
                {t('Đã có thẻ đặc quyền?')} 
                <Link className="text-tertiary hover:underline underline-offset-4 ml-1 transition-all" to="/login">{t('Đăng nhập ngay')}</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
