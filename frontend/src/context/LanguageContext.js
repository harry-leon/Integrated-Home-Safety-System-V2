'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    brand: 'SENTINEL',
    tagline: 'Precision Security',
    
    // Sidebar Navigation
    navDashboard: 'Dashboard',
    navRemoteControl: 'Remote Control',
    navFingerprints: 'Fingerprints',
    navLogs: 'Logs',
    navAnalytics: 'Analytics',
    navSettings: 'Settings',
    navSupport: 'Support',
    navLogout: 'Log Out',

    // TopBar
    userRole: 'Security Lead',
    
    // Tabs
    tabOverview: 'Overview',
    tabActivity: 'Activity',
    tabDevices: 'Devices',
    tabRemoteAccess: 'Remote Access',

    // Footer
    systemOnline: 'SYSTEM ONLINE',
    lastSync: 'LAST SYNC: 2 MINS AGO',
    terms: 'TERMS OF SERVICE',
    privacy: 'PRIVACY POLICY',

    // Dashboard Page
    heroStatusDesc: 'System Integrity Status',
    heroStatusArmed: 'SYSTEM ARMED',
    signal: 'SIGNAL',
    battery: 'BATTERY',
    mainEntry: 'Main Entry',
    frontDoorLock: 'Front Door Lock',
    securelyEngaged: 'Securely Engaged',
    unlockDoor: 'Unlock Door',
    emergencyLock: 'Emergency Lock',
    temp: 'Temperature',
    gas: 'Gas Level',
    ldrIndex: 'LDR Index',
    outsideWeather: 'Outside Weather',
    weatherDesc: 'Partly',
    securityLog: 'Security Log',
    backPatioDoor: 'Back Patio Door',
    active: 'ACTIVE',
    signalStrength: 'Signal Strength',
    patioDesc: 'The patio sensor reports zero vibration and remains locked since 22:00 last night. Wi-Fi connection is stable at 45ms ping.',

    // Remote Control Page
    remoteTitle: 'SYSTEM REMOTE',
    remoteSubtitle: 'Central control hub for entry and environmental parameters.',
    liveConnection: 'LIVE CONNECTION',
    northDoor: 'North Perimeter Door 01',
    secured: 'SECURED',
    state: 'State',
    locked: 'LOCKED',
    lastAction: 'Last Action',
    ago: 'AGO',
    autoLock: 'Auto-lock',
    autoLockDesc: 'Delayed securing',
    gasAlert: 'Gas Alert',
    gasAlertDesc: 'LPG/CO monitoring',
    pirAlert: 'PIR Alert',
    pirAlertDesc: 'Motion sensor trigger',
    securityPin: 'Security PIN',
    manageAccessCodes: 'MANAGE ACCESS CODES',
    gasThreshold: 'Gas Threshold',
    safe: 'Safe',
    critical: 'Critical',
    ldrThreshold: 'LDR Threshold',
    dark: 'Dark',
    bright: 'Bright',
    autoLockDelay: 'Auto-lock Delay',
    minText: 'Min',
    maxText: 'Max',
    recentEvents: 'Recent Access Events',
    viewFullLog: 'View Full Log',

    // Structural Pages
    bioTitle: 'BIOMETRICS & ACCESS',
    bioSub: 'Manage registered fingerprints, RFID cards, and authorized profiles.',
    logTitle: 'SECURITY LOGS',
    logSub: 'Comprehensive audit trail of all systemic events, access attempts, and anomalies.',
    anaTitle: 'ANALYTICS & DATA',
    anaSub: 'Long-term usage trends, environmental charting, and battery analytics.',
    settersTitle: 'SYSTEM SETTINGS',
    settersSub: 'Global device configuration, firmware updates, and network management.',
  },
  vi: {
    brand: 'SENTINEL',
    tagline: 'An Ninh Chính Xác',
    
    // Sidebar Navigation
    navDashboard: 'Bảng Điều Khiển',
    navRemoteControl: 'Điều Khiển Từ Xa',
    navFingerprints: 'Vân Tay',
    navLogs: 'Lịch Sử / Log',
    navAnalytics: 'Thống Kê',
    navSettings: 'Cài Đặt',
    navSupport: 'Hỗ Trợ',
    navLogout: 'Đăng Xuất',

    // TopBar
    userRole: 'Trưởng An Ninh',
    
    // Tabs
    tabOverview: 'Tổng Quan',
    tabActivity: 'Hoạt Động',
    tabDevices: 'Máy Móc',
    tabRemoteAccess: 'Truy Cập Từ Xa',

    // Footer
    systemOnline: 'HỆ THỐNG TRỰC TUYẾN',
    lastSync: 'KẾT NỐI CUỐI: 2 PHÚT TRƯỚC',
    terms: 'CHÍNH SÁCH DỊCH VỤ',
    privacy: 'BẢO MẬT',

    // Dashboard Page
    heroStatusDesc: 'Trạng Thái Nguyên Vẹn Hệ Thống',
    heroStatusArmed: 'ĐÃ KÍCH BÁO ĐỘNG',
    signal: 'TÍN HIỆU',
    battery: 'PIN',
    mainEntry: 'Lối Vào Chính',
    frontDoorLock: 'Khoá Cửa Trước',
    securelyEngaged: 'Đã Đóng An Toàn',
    unlockDoor: 'Mở Khoá Cửa',
    emergencyLock: 'Khoá Khẩn Cấp',
    temp: 'Nhiệt Độ',
    gas: 'Mức Khí Gas',
    ldrIndex: 'Chỉ Số LDR',
    outsideWeather: 'Thời Tiết Ngoài Trời',
    weatherDesc: 'Nhiều Mây',
    securityLog: 'Nhật Ký An Ninh',
    backPatioDoor: 'Cửa Sân Sau',
    active: 'HOẠT ĐỘNG',
    signalStrength: 'Cường Độ Tín Hiệu',
    patioDesc: 'Cảm biến sân báo cáo không có độ rung và cửa đã bị khoá kể từ 22:00 đêm qua. Kết nối mạng Wi-Fi ổn định với độ trễ 45ms ping.',

    // Remote Control Page
    remoteTitle: 'ĐIỀU KHIỂN HỆ THỐNG',
    remoteSubtitle: 'Trung tâm kiếm soát trung tâm thông số xâm nhập và môi trường.',
    liveConnection: 'KẾT NỐI TRỰC TIẾP',
    northDoor: 'Cửa Chu Vi Phía Bắc 01',
    secured: 'ĐÃ BẢO TỒN',
    state: 'Trạng Thái',
    locked: 'ĐÃ KHOÁ',
    lastAction: 'Hành Động Cuối',
    ago: 'TRƯỚC',
    autoLock: 'Khoá Tự Động',
    autoLockDesc: 'Kích hoạt khoá trễ thời gian',
    gasAlert: 'Báo Động Gas',
    gasAlertDesc: 'Kiểm soát chập cháy CO',
    pirAlert: 'Báo Động PIR',
    pirAlertDesc: 'Kích hoạt cảnh báo chuyển động',
    securityPin: 'Mã PIN Bảo Mật',
    manageAccessCodes: 'QUẢN LÝ MÃ TRUY CẬP',
    gasThreshold: 'Ngưỡng Gas',
    safe: 'An Toàn',
    critical: 'Nguy Kịch',
    ldrThreshold: 'Ngưỡng Ánh Sáng',
    dark: 'Tối',
    bright: 'Sáng',
    autoLockDelay: 'Thời Gian Trễ Khóa Tự Động',
    minText: 'Ít Nhất',
    maxText: 'Cao Nhất',
    recentEvents: 'Sự Kiện Truy Cập Gần Nhất',
    viewFullLog: 'Xem Toàn Bộ Lịch Sử',

    // Structural Pages
    bioTitle: 'Sinh Trắc Học & Truy Cập',
    bioSub: 'Quản lý vân tay đã đăng ký, thẻ RFID và các tệp thành viên được ủy quyền.',
    logTitle: 'NHẬT KÝ BẢO MẬT',
    logSub: 'Theo dõi toàn diện các sự kiện hệ thống, các nỗ lực truy cập bất hợp pháp và dị thường.',
    anaTitle: 'PHÂN TÍCH & DỮ LIỆU',
    anaSub: 'Xu hướng sử dụng dài hạn, biểu đồ môi trường học và phân tích pin.',
    settersTitle: 'CÀI ĐẶT HỆ THỐNG',
    settersSub: 'Thay đổi toàn bộ cấu hình thiết bị, cập nhật Firmware, và hệ thống nhà mạng kết nối.',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  // Load persistence
  const loadLang = useCallback(() => {
    const saved = localStorage.getItem('sentinel-lang');
    if (saved && ['en', 'vi'].includes(saved)) {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    loadLang();
  }, [loadLang]);

  const toggleLang = () => {
    const nLang = lang === 'en' ? 'vi' : 'en';
    setLang(nLang);
    localStorage.setItem('sentinel-lang', nLang);
  };

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside Provider');
  return ctx;
}
