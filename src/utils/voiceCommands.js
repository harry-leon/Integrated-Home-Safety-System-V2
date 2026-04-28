// ── Normalize: strip diacritics, lowercase, collapse whitespace ───────────────
export const normalizeSpeech = (value) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

// ── Phrase-based matcher ──────────────────────────────────────────────────────
// Each entry has `phrases` (array of normalized strings).
// A match fires when the spoken text CONTAINS any of those phrases.
// Longer phrases are checked first (most specific wins).

const matchesPhrases = (normalized, phrases) =>
  phrases.some((phrase) => normalized.includes(phrase));

// ── Route commands ────────────────────────────────────────────────────────────
const routeCommands = [
  {
    path: '/',
    label: 'Mở tổng quan',
    labelEn: 'Open dashboard',
    phrases: [
      // EN
      'open dashboard', 'go to dashboard', 'show dashboard',
      'go home', 'open home', 'show overview', 'go to overview',
      // VN — normalized (no diacritics)
      'mo trang chu', 'mo tong quan', 'di den trang chu',
      'xem tong quan', 'trang chu', 'tong quan',
    ],
  },
  {
    path: '/remote',
    label: 'Mở điều khiển',
    labelEn: 'Open remote control',
    phrases: [
      // EN
      'open remote', 'open control', 'go to remote', 'go to control',
      'show remote', 'remote control', 'device control',
      // VN
      'mo dieu khien', 'di den dieu khien', 'trang dieu khien',
      'dieu khien thiet bi', 'mo trang dieu khien',
    ],
  },
  {
    path: '/logs',
    label: 'Mở nhật ký',
    labelEn: 'Open logs',
    phrases: [
      // EN
      'open logs', 'show logs', 'go to logs', 'view logs',
      'open history', 'show history', 'event log', 'access log',
      // VN
      'mo nhat ky', 'xem nhat ky', 'di den nhat ky',
      'nhat ky su kien', 'lich su truy cap', 'nhat ky',
    ],
  },
  {
    path: '/analytics',
    label: 'Mở phân tích',
    labelEn: 'Open analytics',
    phrases: [
      // EN
      'open analytics', 'show analytics', 'go to analytics',
      'view analytics', 'open reports', 'show reports', 'view reports',
      // VN
      'mo phan tich', 'xem phan tich', 'di den phan tich',
      'bao cao hoat dong', 'xem bao cao', 'phan tich hoat dong',
    ],
  },
  {
    path: '/fingerprints',
    label: 'Mở vân tay',
    labelEn: 'Open fingerprints',
    phrases: [
      // EN
      'open fingerprints', 'show fingerprints', 'go to fingerprints',
      'biometric', 'fingerprint management',
      // VN
      'mo van tay', 'xem van tay', 'quan ly van tay',
      'di den van tay', 'sinh trac hoc',
    ],
  },
  {
    path: '/settings',
    label: 'Mở cài đặt',
    labelEn: 'Open settings',
    phrases: [
      // EN
      'open settings', 'go to settings', 'show settings',
      'account settings', 'open account', 'open profile',
      // VN
      'mo cai dat', 'di den cai dat', 'xem cai dat',
      'cai dat tai khoan', 'mo tai khoan', 'ho so ca nhan',
    ],
  },
];

// ── Setting commands ──────────────────────────────────────────────────────────
const settingCommands = [
  {
    key: 'autoLockEnabled',
    value: true,
    label: 'Bật tự khóa cửa',
    labelEn: 'Enable auto lock',
    phrases: [
      // EN
      'enable auto lock', 'turn on auto lock', 'switch on auto lock',
      'activate auto lock', 'start auto lock', 'auto lock on',
      // VN
      'bat khoa tu dong', 'mo khoa tu dong', 'kich hoat khoa tu dong',
      'bat tu dong khoa', 'khoa tu dong bat',
    ],
  },
  {
    key: 'autoLockEnabled',
    value: false,
    label: 'Tắt tự khóa cửa',
    labelEn: 'Disable auto lock',
    phrases: [
      // EN
      'disable auto lock', 'turn off auto lock', 'switch off auto lock',
      'deactivate auto lock', 'stop auto lock', 'auto lock off',
      // VN
      'tat khoa tu dong', 'vo hieu khoa tu dong', 'tat tu dong khoa',
      'khoa tu dong tat',
    ],
  },
  {
    key: 'gasAlertEnabled',
    value: true,
    label: 'Bật cảnh báo khí gas',
    labelEn: 'Enable gas alert',
    phrases: [
      // EN
      'enable gas alert', 'turn on gas alert', 'switch on gas alert',
      'activate gas alert', 'gas alert on',
      // VN
      'bat canh bao gas', 'mo canh bao gas', 'kich hoat canh bao gas',
      'bat canh bao khi gas',
    ],
  },
  {
    key: 'gasAlertEnabled',
    value: false,
    label: 'Tắt cảnh báo khí gas',
    labelEn: 'Disable gas alert',
    phrases: [
      // EN
      'disable gas alert', 'turn off gas alert', 'switch off gas alert',
      'deactivate gas alert', 'gas alert off',
      // VN
      'tat canh bao gas', 'vo hieu canh bao gas', 'tat canh bao khi gas',
    ],
  },
  {
    key: 'pirAlertEnabled',
    value: true,
    label: 'Bật cảnh báo chuyển động',
    labelEn: 'Enable motion alert',
    phrases: [
      // EN
      'enable pir alert', 'turn on pir alert', 'enable motion alert',
      'turn on motion alert', 'motion alert on', 'pir alert on',
      'activate motion sensor',
      // VN
      'bat canh bao chuyen dong', 'mo canh bao chuyen dong',
      'bat canh bao pir', 'kich hoat cam bien chuyen dong',
    ],
  },
  {
    key: 'pirAlertEnabled',
    value: false,
    label: 'Tắt cảnh báo chuyển động',
    labelEn: 'Disable motion alert',
    phrases: [
      // EN
      'disable pir alert', 'turn off pir alert', 'disable motion alert',
      'turn off motion alert', 'motion alert off', 'pir alert off',
      // VN
      'tat canh bao chuyen dong', 'vo hieu canh bao chuyen dong',
      'tat canh bao pir',
    ],
  },
];

const normalizeCustomCommands = (commands = []) =>
  (Array.isArray(commands) ? commands : [])
    .map((command) => ({
      ...command,
      phrase: normalizeSpeech(command.phrase),
    }))
    .filter((command) => command.phrase && command.type);

const parseCustomCommand = (normalized, devices, customCommands) => {
  const match = normalizeCustomCommands(customCommands).find((command) => {
    if (command.matchMode === 'contains') return normalized.includes(command.phrase);
    return normalized === command.phrase;
  });

  if (!match) return null;

  if (match.type === 'navigate') {
    return {
      type: 'navigate',
      path: match.path || '/',
      label: match.label || `Custom: ${match.phrase}`,
      detail: 'User-defined navigation command.',
      custom: true,
    };
  }

  if (match.type === 'lock') {
    return {
      type: 'lock',
      targetState: match.targetState || 'locked',
      label: match.label || `Custom: ${match.phrase}`,
      detail: 'User-defined lock command.',
      custom: true,
    };
  }

  if (match.type === 'setting') {
    return {
      type: 'setting',
      key: match.key,
      value: match.value,
      label: match.label || `Custom: ${match.phrase}`,
      detail: 'User-defined setting command.',
      custom: true,
    };
  }

  if (match.type === 'resolve-alert') {
    return {
      type: 'resolve-alert',
      label: match.label || `Custom: ${match.phrase}`,
      detail: 'User-defined alert command.',
      custom: true,
    };
  }

  if (match.type === 'device') {
    const device = devices.find((item) => item.id === match.deviceId) || devices[Number(match.deviceIndex || 1) - 1];
    if (!device) {
      return {
        type: 'error',
        label: 'Device not found',
        detail: 'The device assigned to this custom command is not available.',
      };
    }

    return {
      type: 'device',
      deviceId: device.id,
      label: match.label || `Switch to ${device.deviceName || 'selected device'}`,
      detail: 'User-defined device selection command.',
      custom: true,
    };
  }

  return null;
};

export const parseVoiceCommand = (transcript, devices = [], customCommands = []) => {
  const normalized = normalizeSpeech(transcript);
  if (!normalized) return null;

  // 1. Custom commands first (user-defined, highest priority)
  const customCommand = parseCustomCommand(normalized, devices, customCommands);
  if (customCommand) return customCommand;

  // 2. Help
  const helpPhrases = [
    'help', 'what can i say', 'show commands', 'list commands', 'voice help',
    'tro giup', 'co the noi gi', 'xem lenh', 'danh sach lenh', 'huong dan',
  ];
  if (matchesPhrases(normalized, helpPhrases)) {
    return {
      type: 'help',
      label: 'Hiển thị lệnh giọng nói',
      detail: 'Danh sách các lệnh được hỗ trợ.',
    };
  }

  // 3. Resolve alert
  const resolveAlertPhrases = [
    'resolve alert', 'clear alert', 'dismiss alert', 'resolve all alerts',
    'clear all alerts', 'fix alert', 'handle alert',
    'xu ly canh bao', 'tat canh bao', 'xoa canh bao', 'giai quyet canh bao',
    'xu ly tat ca canh bao',
  ];
  if (matchesPhrases(normalized, resolveAlertPhrases)) {
    return {
      type: 'resolve-alert',
      label: 'Xử lý cảnh báo mới nhất',
      detail: 'Xử lý cảnh báo đang hoạt động sau khi xác thực.',
    };
  }

  // 4. Device selection — "device 2", "thiết bị 1", "chọn thiết bị 3"
  const devicePhraseMatch = normalized.match(
    /(?:device|select device|switch to device|thiet bi|chon thiet bi|doi thiet bi)\s+(\d+)/,
  );
  if (devicePhraseMatch) {
    const index = Number(devicePhraseMatch[1]) - 1;
    if (devices[index]) {
      return {
        type: 'device',
        deviceId: devices[index].id,
        label: `Chuyển sang ${devices[index].deviceName || `thiết bị ${index + 1}`}`,
        detail: 'Dùng thiết bị này cho các lệnh tiếp theo.',
      };
    }
    return {
      type: 'error',
      label: 'Không tìm thấy thiết bị',
      detail: `Thiết bị ${devicePhraseMatch[1]} không khả dụng.`,
    };
  }

  // 5. Settings — check longer phrases first (most specific)
  const sortedSettings = [...settingCommands].sort(
    (a, b) => Math.max(...b.phrases.map((p) => p.length)) - Math.max(...a.phrases.map((p) => p.length)),
  );
  const setting = sortedSettings.find((cmd) => matchesPhrases(normalized, cmd.phrases));
  if (setting) {
    return {
      type: 'setting',
      key: setting.key,
      value: setting.value,
      label: setting.label,
      detail: 'Cập nhật cài đặt thiết bị sau khi xác thực.',
    };
  }

  // 6. Lock / Unlock — check unlock first (more specific)
  const unlockPhrases = [
    'unlock the door', 'unlock door', 'open the door', 'open door',
    'unlock it', 'please unlock',
    'mo khoa cua', 'mo cua', 'giai phong khoa', 'mo khoa',
  ];
  if (matchesPhrases(normalized, unlockPhrases)) {
    return {
      type: 'lock',
      targetState: 'unlocked',
      label: 'Mở khóa cửa',
      detail: 'Mở khóa thiết bị đang chọn.',
    };
  }

  const lockPhrases = [
    'lock the door', 'lock door', 'secure the door', 'secure door',
    'lock it', 'please lock', 'close and lock',
    'khoa cua lai', 'dong cua', 'khoa cua', 'dong va khoa',
  ];
  if (matchesPhrases(normalized, lockPhrases)) {
    return {
      type: 'lock',
      targetState: 'locked',
      label: 'Khóa cửa',
      detail: 'Khóa thiết bị đang chọn.',
    };
  }

  // 7. Navigation — check longer phrases first
  const sortedRoutes = [...routeCommands].sort(
    (a, b) => Math.max(...b.phrases.map((p) => p.length)) - Math.max(...a.phrases.map((p) => p.length)),
  );
  const route = sortedRoutes.find((cmd) => matchesPhrases(normalized, cmd.phrases));
  if (route) {
    return {
      type: 'navigate',
      path: route.path,
      label: route.label,
      detail: `Điều hướng đến ${route.path}.`,
    };
  }

  return null;
};

export const voiceHelpItems = [
  // EN
  'Lock the door',
  'Unlock the door',
  'Open dashboard',
  'Open logs',
  'Open analytics',
  'Open settings',
  'Select device 1',
  'Enable auto lock',
  'Disable gas alert',
  'Resolve alert',
  // VN
  'Khóa cửa lại',
  'Mở khóa cửa',
  'Mở tổng quan',
  'Mở nhật ký',
  'Mở phân tích',
  'Bật tự khóa cửa',
  'Tắt cảnh báo gas',
  'Xử lý cảnh báo',
  'Chọn thiết bị 1',
];

export const createVoiceCommand = (payload) => ({
  id: payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  phrase: payload.phrase || '',
  label: payload.label || payload.phrase || 'Custom command',
  matchMode: payload.matchMode || 'exact',
  type: payload.type || 'navigate',
  path: payload.path || '/',
  targetState: payload.targetState || 'locked',
  key: payload.key || 'autoLockEnabled',
  value: payload.value ?? true,
  deviceId: payload.deviceId || '',
  deviceIndex: payload.deviceIndex || 1,
});
