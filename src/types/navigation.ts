import { CapsuleType, Capsule } from './index';

export type RootStackParamList = {
  Main: undefined;
  Recording: { type: CapsuleType };
  Review: { 
    path: string; 
    duration: number; 
    type: CapsuleType; 
    mediaType: 'video' | 'audio' 
  };
  Category: { type: CapsuleType };
  Playback: { capsule: Capsule };
};

export interface NavigationProps {
  navigation: {
    navigate: (screen: keyof RootStackParamList, params?: any) => void;
    goBack: () => void;
    reset: (options: any) => void;
  };
}