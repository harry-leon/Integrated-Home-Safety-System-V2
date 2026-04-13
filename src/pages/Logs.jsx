import React from 'react';
import { useLang } from '../contexts/LangContext';

const Logs = () => {
  const { t } = useLang();

  const logs = [
    { time: '14:24:02', date: '24/05/2024', type: 'Truy cập', typeIcon: 'person', typeColor: 'blue', entity: 'Nguyen_Van_A', entityIcon: 'person', detail: 'Mở khóa cửa chính (Main Gate) qua nhận diện khuôn mặt.', status: 'Thành công', statusColor: 'emerald' },
    { time: '14:18:45', date: '24/05/2024', type: 'Cảnh báo', typeIcon: 'warning', typeColor: 'orange', entity: 'Sensor_B12', entityIcon: 'lock', detail: 'Phát hiện nỗ lực cạy cửa tại kho hàng số 2.', status: 'Từ chối', statusColor: 'red' },
    { time: '13:55:12', date: '24/05/2024', type: 'Lệnh', typeIcon: 'terminal', typeColor: 'purple', entity: 'System_Core', entityIcon: 'shield', detail: 'Cập nhật chính sách bảo mật cho toàn bộ hệ thống vân tay.', status: 'Thành công', statusColor: 'emerald' },
    { time: '12:40:01', date: '24/05/2024', type: 'Truy cập', typeIcon: 'person', typeColor: 'blue', entity: 'Unknown_User', entityIcon: 'person', detail: 'Nỗ lực đăng nhập hệ thống quản trị từ IP 192.168.1.105.', status: 'Từ chối', statusColor: 'red' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative pb-20">
      <section className="pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-outline-variant/10 pb-6">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black font-headline tracking-tighter text-on-surface mb-2">NHẬT KÝ HỆ THỐNG</h2>
            <p className="text-outline text-sm sm:text-lg">{t('Giám sát và kiểm soát mọi tương tác bảo mật theo thời gian thực.')}</p>
          </div>
          <button className="flex justify-center items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary-container to-primary text-on-primary-container rounded-xl font-bold tracking-tight shadow-sm hover:scale-[0.98] transition-all duration-200 w-full sm:w-auto">
            <span className="material-symbols-outlined">description</span>
            {t('Xuất báo cáo')}
          </button>
        </div>
      </section>

      <section>
        <div className="bg-surface-container rounded-2xl p-6 flex flex-wrap items-center gap-6 shadow-sm border border-outline-variant/10">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest pl-1">{t('Khoảng thời gian')}</label>
            <div className="flex items-center gap-2">
              <select className="bg-surface-container-high border-none outline-none rounded-lg text-sm text-on-surface px-4 py-2.5 focus:ring-1 focus:ring-primary w-full">
                <option>{t('Hôm nay')}</option>
                <option>{t('7 ngày qua')}</option>
                <option>{t('Tháng này')}</option>
                <option>{t('Tùy chọn...')}</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5 flex-[2] min-w-[300px]">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest pl-1">{t('Loại sự kiện')}</label>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-primary-container text-on-primary-container rounded-full text-xs font-bold transition-colors shadow-sm">{t('Tất cả')}</button>
              <button className="px-4 py-2 bg-surface-container-high text-outline hover:text-on-surface hover:bg-surface-container-highest rounded-full text-xs font-bold transition-colors">{t('Truy cập')}</button>
              <button className="px-4 py-2 bg-surface-container-high text-outline hover:text-on-surface hover:bg-surface-container-highest rounded-full text-xs font-bold transition-colors">{t('Cảnh báo')}</button>
              <button className="px-4 py-2 bg-surface-container-high text-outline hover:text-on-surface hover:bg-surface-container-highest rounded-full text-xs font-bold transition-colors">{t('Lệnh')}</button>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="p-2.5 bg-surface-container-high text-outline rounded-xl hover:text-on-surface hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            <button className="p-2.5 bg-surface-container-high text-outline rounded-xl hover:text-on-surface hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-surface-container rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-outline-variant/10">
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">{t('Thời gian')}</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">{t('Loại sự kiện')}</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">{t('Thực thể / Người dùng')}</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">{t('Chi tiết thao tác')}</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-outline uppercase tracking-widest">{t('Trạng thái')}</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {logs.map((log, i) => (
                  <tr key={i} className="hover:bg-surface-container-highest/20 transition-colors group cursor-default">
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-on-surface">{log.time}</span>
                        <span className="text-[10px] text-outline font-label mt-1">{log.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-${log.typeColor}-500/10 text-${log.typeColor}-500 text-[10px] font-bold uppercase tracking-wider border border-${log.typeColor}-500/20`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-${log.typeColor}-500`}></span>
                        {t(log.type)}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface border border-outline-variant/10">
                          <span className="material-symbols-outlined text-sm">{log.entityIcon}</span>
                        </div>
                        <span className="text-sm font-medium text-on-surface">{log.entity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm text-outline leading-relaxed max-w-sm">{t(log.detail)}</p>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-${log.statusColor}-500/10 text-${log.statusColor}-500 text-[10px] font-bold uppercase tracking-wider`}>
                        {t(log.status)}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button className="opacity-0 group-hover:opacity-100 p-2 text-outline hover:text-on-surface transition-all rounded-lg hover:bg-surface-container-highest">
                        <span className="material-symbols-outlined text-sm">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low">
            <p className="text-xs text-outline font-label hidden sm:block">
              {t('Hiển thị')} <span className="text-on-surface font-bold">1 - 25</span> {t('trên tổng số')} <span className="text-on-surface font-bold">1,240</span> {t('sự kiện')}
            </p>
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <button className="p-2 rounded-lg hover:bg-surface-container-highest text-outline transition-colors border border-transparent shadow-sm">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm">1</button>
              <button className="w-8 h-8 rounded-lg hover:bg-surface-container-highest text-outline text-xs font-bold transition-colors">2</button>
              <button className="w-8 h-8 rounded-lg hover:bg-surface-container-highest text-outline text-xs font-bold transition-colors">3</button>
              <span className="text-outline px-1">...</span>
              <button className="w-8 h-8 rounded-lg hover:bg-surface-container-highest text-outline text-xs font-bold transition-colors">50</button>
              <button className="p-2 rounded-lg hover:bg-surface-container-highest text-outline transition-colors border border-transparent shadow-sm">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4 pointer-events-none hidden lg:flex z-40">
        <div className="bg-surface-bright/80 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/10 shadow-lg pointer-events-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <span className="material-symbols-outlined text-green-500">verified_user</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-500">System Secure</p>
            <p className="text-[10px] text-outline mt-0.5">Tất cả các trạm đang hoạt động bình thường</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;
