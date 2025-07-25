import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import uuid from 'react-native-uuid';
import { Capsule, CapsuleType } from '../types';
import { STORAGE_KEYS, MEDIA_FORMATS } from '../constants';

const MEDIA_DIR = `${RNFS.DocumentDirectoryPath}/capsules`;

class StorageService {
  static async initializeStorage(): Promise<void> {
    try {
      // Create media directory if it doesn't exist
      const exists = await RNFS.exists(MEDIA_DIR);
      if (!exists) {
        await RNFS.mkdir(MEDIA_DIR);
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  static async saveCapsule(
    tempPath: string,
    metadata: {
      type: CapsuleType;
      title?: string;
      duration: number;
      mediaType: 'video' | 'audio';
      unlockDate?: number;
      emotion?: string;
    }
  ): Promise<Capsule> {
    try {
      // Ensure media directory exists
      await this.initializeStorage();
      
      // Move file to permanent location
      const capsuleId = uuid.v4() as string;
      const fileExtension = metadata.mediaType === 'video' 
        ? MEDIA_FORMATS.VIDEO_EXTENSION 
        : MEDIA_FORMATS.AUDIO_EXTENSION;
      const fileName = `${capsuleId}.${fileExtension}`;
      const permanentPath = `${MEDIA_DIR}/${fileName}`;
      
      await RNFS.moveFile(tempPath, permanentPath);
      
      // Create capsule object
      const capsule: Capsule = {
        id: capsuleId,
        type: metadata.type,
        title: metadata.title,
        createdAt: Date.now(),
        duration: metadata.duration,
        mediaType: metadata.mediaType,
        filePath: fileName, // Store relative path
        ...(metadata.type === 'future' && {
          unlockDate: metadata.unlockDate,
          isUnlocked: false,
        }),
        ...(metadata.type === 'lift' && {
          emotion: metadata.emotion,
        }),
      };
      
      // Save to AsyncStorage
      const existing = await this.getCapsules();
      const updated = [...existing, capsule];
      await AsyncStorage.setItem(STORAGE_KEYS.CAPSULES, JSON.stringify(updated));
      
      return capsule;
    } catch (error) {
      console.error('Failed to save capsule:', error);
      throw error;
    }
  }

  static async getCapsules(): Promise<Capsule[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CAPSULES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get capsules:', error);
      return [];
    }
  }

  static async getCapsulesByType(type: CapsuleType): Promise<Capsule[]> {
    try {
      const all = await this.getCapsules();
      return all.filter(c => c.type === type);
    } catch (error) {
      console.error('Failed to get capsules by type:', error);
      return [];
    }
  }

  static async updateCapsule(id: string, updates: Partial<Capsule>): Promise<void> {
    try {
      const capsules = await this.getCapsules();
      const index = capsules.findIndex(c => c.id === id);
      
      if (index !== -1) {
        capsules[index] = { ...capsules[index], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.CAPSULES, JSON.stringify(capsules));
      }
    } catch (error) {
      console.error('Failed to update capsule:', error);
      throw error;
    }
  }

  static async deleteCapsule(id: string): Promise<void> {
    try {
      const capsules = await this.getCapsules();
      const capsule = capsules.find(c => c.id === id);
      
      if (capsule) {
        // Delete media file
        const fullPath = `${MEDIA_DIR}/${capsule.filePath}`;
        try {
          await RNFS.unlink(fullPath);
        } catch (fileError) {
          console.warn('Failed to delete media file:', fileError);
        }
        
        // Remove from storage
        const filtered = capsules.filter(c => c.id !== id);
        await AsyncStorage.setItem(STORAGE_KEYS.CAPSULES, JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('Failed to delete capsule:', error);
      throw error;
    }
  }

  static async getStorageInfo() {
    try {
      const info = await RNFS.getFSInfo();
      const capsules = await this.getCapsules();
      
      // Calculate used space
      let usedSpace = 0;
      for (const capsule of capsules) {
        try {
          const path = `${MEDIA_DIR}/${capsule.filePath}`;
          const stat = await RNFS.stat(path);
          usedSpace += parseInt(stat.size.toString());
        } catch (statError) {
          console.warn('Failed to get file stats for:', capsule.filePath);
        }
      }
      
      return {
        totalSpace: info.totalSpace,
        freeSpace: info.freeSpace,
        usedSpace,
        capsuleCount: capsules.length,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        totalSpace: 0,
        freeSpace: 0,
        usedSpace: 0,
        capsuleCount: 0,
      };
    }
  }

  static getMediaPath(fileName: string): string {
    return `${MEDIA_DIR}/${fileName}`;
  }

  static async checkUnlockedCapsules(): Promise<Capsule[]> {
    try {
      const futureCapsules = await this.getCapsulesByType('future');
      const now = Date.now();
      const newlyUnlocked: Capsule[] = [];
      
      for (const capsule of futureCapsules) {
        if (!capsule.isUnlocked && capsule.unlockDate && capsule.unlockDate <= now) {
          await this.updateCapsule(capsule.id, { isUnlocked: true });
          newlyUnlocked.push({ ...capsule, isUnlocked: true });
        }
      }
      
      return newlyUnlocked;
    } catch (error) {
      console.error('Failed to check unlocked capsules:', error);
      return [];
    }
  }
}

export default StorageService;