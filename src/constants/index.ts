export const MAX_RECORDING_DURATION = 600; // 10 minutes in seconds

export const COLORS = {
  primary: '#FF6B6B',
  background: '#F5F5F7',
  card: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  accent: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
};

export const EMOTIONS = [
  'Anxious', 'Sad', 'Stressed', 'Lonely',
  'Overwhelmed', 'Frustrated', 'Angry',
  'Worried', 'Insecure', 'Tired'
];

export const STORAGE_KEYS = {
  CAPSULES: '@capsules',
  SETTINGS: '@settings',
};

export const MEDIA_FORMATS = {
  VIDEO_EXTENSION: 'mp4',
  AUDIO_EXTENSION: 'm4a',
} as const;

export const NOTIFICATION_IDS = {
  FUTURE_UNLOCK: 'future_unlock_',
} as const;