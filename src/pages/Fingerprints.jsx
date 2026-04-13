import React from 'react';
import { useLang } from '../contexts/LangContext';

const Fingerprints = () => {
  const { t } = useLang();

  const mockUsers = [
    { id: '#001', initials: 'NH', name: 'Nguyễn Hoàng', level: 'Quản trị viên', levelClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20', meta: 'ID: 8829 | 256-bit AES', lastActive: 'Hôm nay, 08:42 AM', status: 'Thành công', statusClass: 'text-emerald-500' },
    { id: '#002', initials: 'MT', name: 'Minh Tú', level: 'Nhân viên', levelClass: 'text-tertiary bg-tertiary/10 border-tertiary/20', meta: 'ID: 7712 | 256-bit AES', lastActive: 'Hôm qua, 18:15 PM', status: 'Truy cập', statusClass: 'text-outline' },
    { id: '#003', initials: 'KH', name: 'Khánh Huyền', level: 'Khách', levelClass: 'text-tertiary bg-tertiary/10 border-tertiary/20', meta: 'ID: 9021 | 256-bit AES', lastActive: '12/10/2023, 09:20 AM', status: 'Từ chối', statusClass: 'text-error' },
    { id: '#004', initials: 'AN', name: 'Anh Ngọc', level: 'Kỹ thuật', levelClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20', meta: 'ID: 6652 | 256-bit AES', lastActive: '05/10/2023, 14:33 PM', status: 'Bảo trì', statusClass: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container border border-outline-variant/10 shadow-sm p-6 rounded-xl flex items-center justify-between group hover:bg-surface-container-high transition-all duration-300">
          <div>
            <p className="text-outline text-sm font-medium mb-1 font-label">{t('Tổng số vân tay')}</p>
            <h3 className="text-4xl font-bold text-on-surface tracking-tight font-headline">128</h3>
          </div>
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-3xl">fingerprint</span>
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant/10 shadow-sm p-6 rounded-xl flex items-center justify-between group hover:bg-surface-container-high transition-all duration-300">
          <div>
            <p className="text-outline text-sm font-medium mb-1 font-label">{t('Hoạt động trong ngày')}</p>
            <h3 className="text-4xl font-bold text-on-surface tracking-tight font-headline">42</h3>
          </div>
          <div className="w-14 h-14 bg-tertiary/10 rounded-full flex items-center justify-center text-tertiary border border-tertiary/20">
            <span className="material-symbols-outlined text-3xl">bolt</span>
          </div>
        </div>
        <div className="bg-surface-container border border-outline-variant/10 shadow-sm p-6 rounded-xl flex items-center justify-between group hover:bg-surface-container-high transition-all duration-300">
          <div>
            <p className="text-outline text-sm font-medium mb-1 font-label">{t('Mức độ bảo mật')}</p>
            <h3 className="text-4xl font-bold text-on-surface tracking-tight font-headline">{t('Cao')}</h3>
          </div>
          <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 border border-green-500/20">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2 font-headline">{t('Danh sách Đăng ký')}</h2>
          <p className="text-outline text-sm">{t('Quản lý và giám sát quyền truy cập sinh trắc học thời gian thực.')}</p>
        </div>
        <button className="bg-gradient-to-br from-primary-container to-primary text-on-primary-container px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all duration-200 shadow-sm">
          <span className="material-symbols-outlined text-white">add</span>
          <span className="text-white">{t('Thêm vân tay mới')}</span>
        </button>
      </div>

      <div className="bg-surface-container border border-outline-variant/10 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-high/50 text-outline uppercase text-[11px] tracking-widest font-label border-b border-outline-variant/10">
              <th className="px-8 py-5 font-semibold">Slot ID</th>
              <th className="px-8 py-5 font-semibold">Tên người dùng</th>
              <th className="px-8 py-5 font-semibold">Cấp độ truy cập</th>
              <th className="px-8 py-5 font-semibold">Metadata đăng ký</th>
              <th className="px-8 py-5 font-semibold">Hoạt động lần cuối</th>
              <th className="px-8 py-5 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {mockUsers.map(user => (
              <tr key={user.id} className="hover:bg-surface-container-high transition-colors duration-200 group">
                <td className="px-8 py-5 text-primary font-mono font-bold">{user.id}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface border border-outline-variant/20">{user.initials}</div>
                    <span className="font-medium text-on-surface">{user.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${user.levelClass}`}>
                    {user.level}
                  </span>
                </td>
                <td className="px-8 py-5 text-outline text-sm font-label">{user.meta}</td>
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="text-on-surface text-sm">{user.lastActive}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${user.statusClass}`}>{user.status}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-outline hover:text-on-surface hover:bg-surface-container-highest rounded-lg transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-6 bg-surface-container flex justify-between items-center border-t border-outline-variant/10">
          <p className="text-xs text-outline font-label">{t('Hiển thị 4 trong số 128 kết quả')}</p>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-surface-container-highest text-outline hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="p-2 rounded-lg bg-primary text-on-primary">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Floating Status Widget */}
      <div className="fixed bottom-12 right-12 z-40 hidden md:block">
        <div className="bg-surface-container-high/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-outline-variant/10 max-w-sm">
          <div className="flex items-start gap-4">
            <div className="bg-green-500/10 p-2 rounded-lg text-green-500 border border-green-500/20">
              <span className="material-symbols-outlined">security</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface mb-1">{t('Trạng thái Hệ thống')}</h4>
              <p className="text-xs text-outline leading-relaxed">{t('Tất cả cảm biến vân tay đang hoạt động bình thường. Mã hóa đầu cuối đã được kích hoạt.')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fingerprints;
