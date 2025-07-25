export const MAX_RECORDING_DURATION = 600; // 10 minutes in seconds

export const COLORS = {
  background: '#FAF9F7',      // Warm off-white
  surface: '#FFFFFF',         // Pure white
  primary: '#E85A5A',         // Warm coral (record/save actions only)
  secondary: '#8BAAAD',       // Dusty blue-gray
  tertiary: '#C297B8',        // Dusty pink
  border: '#E8E8E8',          // Soft borders
  textPrimary: '#2C2C2C',     // Soft black
  textSecondary: '#8A8A8A',   // Muted gray
  textTertiary: '#C0C0C0',    // Light gray (placeholders)
  overlay: 'rgba(0,0,0,0.25)', // Timer/control overlays
  // Type indicators
  daily: '#E85A5A',           // Coral
  future: '#8BAAAD',          // Blue-gray
  lift: '#C297B8',            // Dusty pink
  // Legacy compatibility
  card: '#FFFFFF',
  text: '#2C2C2C',
  accent: '#E85A5A',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
};

export const EMOTIONS = [
  'Anxious', 'Sad', 'Stressed', 'Lonely',
  'Overwhelmed', 'Frustrated', 'Angry',
  'Worried', 'Insecure', 'Tired'
];

export const TYPOGRAPHY = {
  heading: { fontFamily: 'Inter-Medium', fontSize: 20 },
  body: { fontFamily: 'Inter-Regular', fontSize: 16 },
  button: { fontFamily: 'Inter-SemiBold', fontSize: 16 },
  timestamp: { fontFamily: 'SpaceMono-Regular', fontSize: 14, opacity: 0.85 },
  caption: { fontFamily: 'Inter-Regular', fontSize: 14 },
};

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  screenPadding: 20,
  cardGap: 12,
};

export const LAYOUT = {
  borderRadius: 8,          // Slightly rounded, not sharp
  borderWidth: 1,
  buttonHeight: 56,
  inputHeight: 48,
  cardPadding: 20,
  animationDuration: 250,   // Relaxed transitions
};

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