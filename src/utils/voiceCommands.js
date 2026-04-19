export const normalizeSpeech = (value) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const routeCommands = [
  {
    path: '/',
    label: 'Open dashboard',
    patterns: [/\b(dashboard|overview|home)\b/, /\b(trang chu|tong quan)\b/],
  },
  {
    path: '/remote',
    label: 'Open control page',
    patterns: [/\b(remote|control|controller)\b/, /\b(dieu khien|mo trang dieu khien)\b/],
  },
  {
    path: '/logs',
    label: 'Open logs',
    patterns: [/\b(logs?|history|event log)\b/, /\b(nhat ky|lich su)\b/],
  },
  {
    path: '/analytics',
    label: 'Open analytics',
    patterns: [/\b(analytics|analysis|report|reports)\b/, /\b(phan tich|bao cao)\b/],
  },
  {
    path: '/fingerprints',
    label: 'Open fingerprints',
    patterns: [/\b(fingerprint|fingerprints|biometric)\b/, /\b(van tay|sinh trac)\b/],
  },
  {
    path: '/settings',
    label: 'Open settings',
    patterns: [/\b(settings?|account|profile)\b/, /\b(cai dat|tai khoan|ho so)\b/],
  },
];

const settingCommands = [
  {
    key: 'autoLockEnabled',
    value: true,
    label: 'Enable auto lock',
    patterns: [/\b(enable|turn on|switch on|start)\s+auto\s*lock\b/, /\b(auto\s*lock)\s+(on|enable)\b/, /\b(bat|mo)\s+(khoa tu dong|auto lock)\b/],
  },
  {
    key: 'autoLockEnabled',
    value: false,
    label: 'Disable auto lock',
    patterns: [/\b(disable|turn off|switch off|stop)\s+auto\s*lock\b/, /\b(auto\s*lock)\s+(off|disable)\b/, /\b(tat)\s+(khoa tu dong|auto lock)\b/],
  },
  {
    key: 'gasAlertEnabled',
    value: true,
    label: 'Enable gas alert',
    patterns: [/\b(enable|turn on|switch on)\s+gas\s+alert\b/, /\bgas\s+alert\s+(on|enable)\b/, /\b(bat|mo)\s+canh bao gas\b/],
  },
  {
    key: 'gasAlertEnabled',
    value: false,
    label: 'Disable gas alert',
    patterns: [/\b(disable|turn off|switch off)\s+gas\s+alert\b/, /\bgas\s+alert\s+(off|disable)\b/, /\btat\s+canh bao gas\b/],
  },
  {
    key: 'pirAlertEnabled',
    value: true,
    label: 'Enable PIR alert',
    patterns: [/\b(enable|turn on|switch on)\s+(pir|motion)\s+alert\b/, /\b(pir|motion)\s+alert\s+(on|enable)\b/, /\b(bat|mo)\s+canh bao pir\b/],
  },
  {
    key: 'pirAlertEnabled',
    value: false,
    label: 'Disable PIR alert',
    patterns: [/\b(disable|turn off|switch off)\s+(pir|motion)\s+alert\b/, /\b(pir|motion)\s+alert\s+(off|disable)\b/, /\btat\s+canh bao pir\b/],
  },
];

const matchesAny = (value, patterns) => patterns.some((pattern) => pattern.test(value));

export const parseVoiceCommand = (transcript, devices = []) => {
  const normalized = normalizeSpeech(transcript);
  if (!normalized) return null;

  if (/\b(help|what can i say|commands?)\b/.test(normalized) || /\b(tro giup|co the noi gi|lenh)\b/.test(normalized)) {
    return {
      type: 'help',
      label: 'Show voice commands',
      detail: 'Display supported voice commands.',
    };
  }

  if (/\b(clear|resolve|dismiss)\s+(the\s+)?alert(s)?\b/.test(normalized) || /\b(tat|xoa|xu ly)\s+canh bao\b/.test(normalized)) {
    return {
      type: 'resolve-alert',
      label: 'Resolve latest active alert',
      detail: 'Resolve the newest active alert after password verification.',
    };
  }

  const deviceMatch = normalized.match(/\b(?:device|thiet bi|chon thiet bi|select device)\s+(\d+)\b/);
  if (deviceMatch) {
    const index = Number(deviceMatch[1]) - 1;
    if (devices[index]) {
      return {
        type: 'device',
        deviceId: devices[index].id,
        label: `Switch to ${devices[index].deviceName || `device ${index + 1}`}`,
        detail: 'Use this device for future voice commands.',
      };
    }

    return {
      type: 'error',
      label: 'Device not found',
      detail: `Device ${deviceMatch[1]} is not available.`,
    };
  }

  const setting = settingCommands.find((command) => matchesAny(normalized, command.patterns));
  if (setting) {
    return {
      type: 'setting',
      key: setting.key,
      value: setting.value,
      label: setting.label,
      detail: 'Update selected device settings after password verification.',
    };
  }

  const route = routeCommands.find((command) => matchesAny(normalized, command.patterns));
  if (route) {
    return {
      type: 'navigate',
      path: route.path,
      label: route.label,
      detail: `Navigate to ${route.path}.`,
    };
  }

  if (/\b(unlock|open|open\s+(the\s+)?door)\b/.test(normalized) || /\b(mo khoa|mo cua)\b/.test(normalized)) {
    return {
      type: 'lock',
      targetState: 'unlocked',
      label: 'Unlock selected door',
      detail: 'Unlock the selected device.',
    };
  }

  if (/\b(lock|lock\s+(the\s+)?door|secure)\b/.test(normalized) || /\b(khoa cua|dong cua)\b/.test(normalized)) {
    return {
      type: 'lock',
      targetState: 'locked',
      label: 'Lock selected door',
      detail: 'Lock the selected device.',
    };
  }

  return null;
};

export const voiceHelpItems = [
  'Lock the door',
  'Unlock the door',
  'Clear alert',
  'Open logs',
  'Open analytics',
  'Select device 2',
  'Turn on auto lock',
  'Turn off gas alert',
  'Tat canh bao',
  'Mo trang dieu khien',
];
