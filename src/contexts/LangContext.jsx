import React, { createContext, useContext, useState, useEffect } from 'react';

// Dictionaries
const translations = {
  vn: {
    dashboard: "Tổng quan",
    remote_control: "Điều khiển",
    fingerprints: "Vân tay",
    logs: "Nhật ký",
    analytics: "Phân tích",
    settings: "Cài đặt",
    support: "Hỗ trợ",
    logout: "Đăng xuất",
    admin: "Admin",
    admin_sub: "Quản trị viên",
    search: "Tìm kiếm thiết bị...",
    sys_status: "Trạng thái hệ thống",
    locked: "ĐÃ KHÓA",
    unlocked: "ĐÃ MỞ",
    sys_desc: "Hệ thống an ninh Sentinel đang hoạt động. Tất cả các điểm truy cập đều được bảo mật.",
    wifi: "Tín hiệu Wifi",
    battery: "Dung lượng Pin",
    environment: "Môi trường hiện tại",
    weather: "Thời tiết",
    brightness: "Độ sáng (LDR)",
    indoor: "Trong nhà",
    gas: "Nồng độ Gas",
    safe: "An toàn",
    sensor_detail: "Xem chi tiết cảm biến",
    alerts: "Cảnh báo gần đây",
    view_all: "Xem tất cả",
    live: "TRỰC TIẾP",
    front_door: "Cửa chính",
    last_update: "Cập nhật lần cuối",
    playback: "Xem lại",
    talk: "Đàm thoại",
    loading: "Đang tải...",
  },
  en: {
    dashboard: "Dashboard",
    remote_control: "Remote Control",
    fingerprints: "Fingerprints",
    logs: "Logs",
    analytics: "Analytics",
    settings: "Settings",
    support: "Support",
    logout: "Log Out",
    admin: "Admin",
    admin_sub: "Administrator",
    search: "Search devices...",
    sys_status: "System Status",
    locked: "LOCKED",
    unlocked: "UNLOCKED",
    sys_desc: "Sentinel security system is active. All access points secured.",
    wifi: "Wifi Signal",
    battery: "Battery Level",
    environment: "Current Environment",
    weather: "Weather",
    brightness: "Brightness (LDR)",
    indoor: "Indoor",
    gas: "Gas Level",
    safe: "Safe",
    sensor_detail: "View sensor details",
    alerts: "Recent Alerts",
    view_all: "View all",
    live: "LIVE",
    front_door: "Front Door",
    last_update: "Last updated",
    playback: "Playback",
    talk: "Two-way talk",
    loading: "Loading...",
  }
};

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vn');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => (prev === 'vn' ? 'en' : 'vn'));
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
