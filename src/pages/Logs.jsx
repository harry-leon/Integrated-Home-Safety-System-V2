import React, { useState, useEffect, useCallback } from 'react';
import { useLang } from '../contexts/LangContext';
import { smartLockApi } from '../services/api';

const Logs = () => {
  const { t } = useLang();
  
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  
  // Filter States
  const [selectedDevice, setSelectedDevice] = useState('');
  const [timeRange, setTimeRange] = useState('ALL'); // ALL, TODAY, WEEK, MONTH
  const [eventType, setEventType] = useState('ALL'); // ALL, ACCESS, WARNING, COMMAND

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Calculate start/end dates based on timeRange
      let start = null;
      let end = null;
      const now = new Date();
      
      if (timeRange === 'TODAY') {
        start = new Date(now.setHours(0, 0, 0, 0)).toISOString().replace('Z', '');
        end = new Date().toISOString().replace('Z', '');
      } else if (timeRange === 'WEEK') {
        start = new Date(now.setDate(now.getDate() - 7)).toISOString().replace('Z', '');
        end = new Date().toISOString().replace('Z', '');
      } else if (timeRange === 'MONTH') {
        start = new Date(now.setMonth(now.getMonth() - 1)).toISOString().replace('Z', '');
        end = new Date().toISOString().replace('Z', '');
      }

      const filters = {
        deviceId: selectedDevice || undefined,
        start: start || undefined,
        end: end || undefined
      };

      const data = await smartLockApi.getAccessLogs(filters);
      
      if (data) {
        // Map backend DTO to frontend structure
        const formattedLogs = data.map(log => {
          const dateObj = new Date(log.createdAt);
          const time = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const date = dateObj.toLocaleDateString('vi-VN');
          
          let type = 'Truy cập';
          let typeIcon = 'person';
          let typeColor = 'blue';
          let entityIcon = 'person';
          
          if (log.action === 'TAMPERED' || log.action === 'DENIED' || log.action === 'ALARM') {
            type = 'Cảnh báo';
            typeIcon = 'warning';
            typeColor = 'orange';
            entityIcon = 'lock';
          } else if (log.method === 'REMOTE' || log.method === 'SYSTEM') {
            type = 'Lệnh';
            typeIcon = 'terminal';
            typeColor = 'purple';
            entityIcon = 'shield';
          }
          
          let statusStr = 'Thành công';
          let statusColor = 'emerald';
          if (log.action === 'DENIED') {
            statusStr = 'Từ chối';
            statusColor = 'red';
          } else if (log.action === 'TAMPERED' || log.action === 'ALARM') {
            statusStr = 'Cảnh báo';
            statusColor = 'red';
          }
          
          return {
            id: log.id,
            time,
            date,
            type,
            typeIcon,
            typeColor,
            entity: log.personName || log.userName || log.deviceName || 'Thông tin trống',
            entityIcon,
            detail: log.detail || `${log.action} qua ${log.method}`,
            status: statusStr,
            statusColor
          };
        });

        // Client-side filtering for event type since backend doesn't support 'type' param yet
        let finalLogs = formattedLogs;
        if (eventType !== 'ALL') {
          finalLogs = formattedLogs.filter(l => l.type === eventType || (eventType === 'ACCESS' && l.type === 'Truy cập') || (eventType === 'WARNING' && l.type === 'Cảnh báo') || (eventType === 'COMMAND' && l.type === 'Lệnh'));
        }
        
        setLogs(finalLogs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError('Không thể kết nối với máy chủ. Vui lòng kiểm tra lại Backend.');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDevice, timeRange, eventType]);

  useEffect(() => {
    // Initial fetch of logs and devices
    fetchLogs();
    
    const fetchDevices = async () => {
      try {
        const devList = await smartLockApi.getDevices();
        if (devList) setDevices(devList);
      } catch (err) {
        console.warn("Could not fetch devices for filter dropdown");
      }
    };
    fetchDevices();
  }, [fetchLogs]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const now = new Date();
      let start = null;
      let end = null;
      
      if (timeRange === 'TODAY') {
        start = new Date(now.setHours(0, 0, 0, 0)).toISOString().replace('Z', '');
        end = new Date().toISOString().replace('Z', '');
      } else if (timeRange === 'WEEK') {
        start = new Date(now.setDate(now.getDate() - 7)).toISOString().replace('Z', '');
        end = new Date().toISOString().replace('Z', '');
      } else if (timeRange === 'MONTH') {
        start = new Date(now.setMonth(now.getMonth() - 1)).toISOString().replace('Z', '');
        end = new Date().toISOString().replace('Z', '');
      }

      const filters = {
        deviceId: selectedDevice || undefined,
        start: start || undefined,
        end: end || undefined
      };

      const blob = await smartLockApi.exportLogs(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `access_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Lỗi khi xuất file: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 relative pb-20">
      <section className="pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-outline-variant/10 pb-6">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black font-headline tracking-tighter text-on-surface mb-2 uppercase">Nhật ký truy cập</h2>
            <p className="text-outline text-sm sm:text-lg">{t('Giám sát và kiểm soát mọi tương tác bảo mật theo thời gian thực.')}</p>
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`flex justify-center items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary-container to-primary text-on-primary-container rounded-xl font-bold tracking-tight shadow-sm hover:scale-[0.98] transition-all duration-200 w-full sm:w-auto ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined">{isExporting ? 'sync' : 'description'}</span>
            {isExporting ? t('Đang xử lý...') : t('Xuất báo cáo CSV')}
          </button>
        </div>
      </section>

      {/* FILTER BAR - ĐÂY CHÍNH LÀ NƠI THỰC HIỆN FILTERING */}
      <section>
        <div className="bg-surface-container rounded-2xl p-6 flex flex-wrap items-center gap-6 shadow-sm border border-outline-variant/10">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest pl-1">{t('Chọn thiết bị')}</label>
            <select 
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-surface-container-high border-none outline-none rounded-lg text-sm text-on-surface px-4 py-2.5 focus:ring-1 focus:ring-primary w-full"
            >
              <option value="">{t('Tất cả thiết bị')}</option>
              {devices.map(dev => (
                <option key={dev.id} value={dev.id}>{dev.deviceName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest pl-1">{t('Khoảng thời gian')}</label>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-surface-container-high border-none outline-none rounded-lg text-sm text-on-surface px-4 py-2.5 focus:ring-1 focus:ring-primary w-full"
            >
              <option value="ALL">{t('Mọi lúc')}</option>
              <option value="TODAY">{t('Hôm nay')}</option>
              <option value="WEEK">{t('7 ngày qua')}</option>
              <option value="MONTH">{t('Tháng này')}</option>
            </select>
          </div>

          <div className="space-y-1.5 flex-[1.5] min-w-[300px]">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest pl-1">{t('Loại sự kiện')}</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'ACCESS', label: 'Truy cập' },
                { id: 'WARNING', label: 'Cảnh báo' },
                { id: 'COMMAND', label: 'Lệnh' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setEventType(item.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    eventType === item.id 
                    ? 'bg-primary text-on-primary shadow-md' 
                    : 'bg-surface-container-high text-outline hover:text-on-surface'
                  }`}
                >
                  {t(item.label)}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button 
              onClick={fetchLogs}
              className="p-2.5 bg-surface-container-high text-outline rounded-xl hover:text-on-surface hover:bg-surface-container-highest transition-colors"
            >
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
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-6"><div className="h-4 bg-surface-container-highest rounded w-20 mb-2"></div><div className="h-3 bg-surface-container-highest rounded w-16"></div></td>
                      <td className="px-6 py-6"><div className="h-6 bg-surface-container-highest rounded-full w-24"></div></td>
                      <td className="px-6 py-6"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-surface-container-highest"></div><div className="h-4 bg-surface-container-highest rounded w-28"></div></div></td>
                      <td className="px-6 py-6"><div className="h-4 bg-surface-container-highest rounded w-full max-w-[200px]"></div></td>
                      <td className="px-6 py-6"><div className="h-6 bg-surface-container-highest rounded-full w-20"></div></td>
                      <td className="px-6 py-6"></td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-error">
                      <span className="material-symbols-outlined text-4xl mb-2">cloud_off</span>
                      <p className="font-bold">{error}</p>
                      <button onClick={fetchLogs} className="mt-4 text-xs bg-error/10 px-4 py-2 rounded-lg hover:bg-error/20 transition-all">Thử lại</button>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-outline">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-20">history</span>
                      <p>{t('Không tìm thấy bản ghi nào khớp với bộ lọc.')}</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log, i) => (
                    <tr key={log.id || i} className="hover:bg-surface-container-highest/20 transition-colors group cursor-default">
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && logs.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low">
              <p className="text-xs text-outline font-label hidden sm:block">
                {t('Hiển thị tất cả kết quả khớp với bộ lọc')}
              </p>
              <div className="flex items-center gap-2 mx-auto sm:mx-0">
                <button disabled className="p-2 rounded-lg opacity-30 text-outline border border-transparent">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="w-8 h-8 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm">1</button>
                <button disabled className="p-2 rounded-lg opacity-30 text-outline border border-transparent">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Logs;
