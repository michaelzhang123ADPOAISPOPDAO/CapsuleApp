import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../constants';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = COLORS.textPrimary 
}) => {
  const icons: Record<string, string> = {
    // Navigation
    back: 'M19 12H5M12 19l-7-7 7-7',
    
    // Media types
    daily: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    future: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2',
    lift: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    
    // Recording
    video: 'M23 7l-7 5 7 5V7z M1 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5z',
    audio: 'M9 18V5l12-2v13 M6 15v3 M9 9v6',
    flip: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M13.8 12H3',
    
    // UI elements
    lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4',
    grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
    list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
    
    // Actions
    play: 'M8 5v14l11-7z',
    pause: 'M6 4h4v16H6z M14 4h4v16h-4z',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M19.5 19.5L16 16',
    share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13',
    delete: 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    
    // States
    empty: 'M12 19c7 0 8-1 8-7s-1-7-8-7-8 1-8 7 1 7 8 7z M8.21 13.89l7.5-7.5 M15.71 13.89l-7.5-7.5',
    close: 'M18 6L6 18 M6 6l12 12',
    'chevron-forward': 'M9 18l6-6-6-6',
  };

  const pathData = icons[name];
  
  if (!pathData) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path 
        d={pathData} 
        stroke={color} 
        strokeWidth={2} 
        fill="none" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Icon;