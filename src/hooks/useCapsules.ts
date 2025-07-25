import { useState, useEffect, useCallback } from 'react';
import { Capsule, CapsuleType } from '../types';
import StorageService from '../services/StorageService';

export const useCapsules = () => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCapsules = useCallback(async () => {
    try {
      setLoading(true);
      const data = await StorageService.getCapsules();
      setCapsules(data);
    } catch (error) {
      console.error('Failed to load capsules:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCapsulesByType = useCallback((type: CapsuleType) => {
    return capsules.filter(c => c.type === type);
  }, [capsules]);

  const getCapsuleCounts = useCallback(() => {
    return {
      daily: capsules.filter(c => c.type === 'daily').length,
      future: capsules.filter(c => c.type === 'future').length,
      lift: capsules.filter(c => c.type === 'lift').length,
    };
  }, [capsules]);

  const getLatestCapsules = useCallback(() => {
    const dailyCapsules = capsules
      .filter(c => c.type === 'daily')
      .sort((a, b) => b.createdAt - a.createdAt);
    
    const futureCapsules = capsules
      .filter(c => c.type === 'future')
      .sort((a, b) => (a.unlockDate || 0) - (b.unlockDate || 0));
    
    const liftCapsules = capsules
      .filter(c => c.type === 'lift')
      .sort((a, b) => b.createdAt - a.createdAt);

    return {
      daily: dailyCapsules[0] || null,
      future: futureCapsules[0] || null,
      lift: liftCapsules[0] || null,
    };
  }, [capsules]);

  const deleteCapsule = useCallback(async (id: string) => {
    try {
      await StorageService.deleteCapsule(id);
      await loadCapsules(); // Reload after deletion
    } catch (error) {
      console.error('Failed to delete capsule:', error);
      throw error;
    }
  }, [loadCapsules]);

  const updateCapsule = useCallback(async (id: string, updates: Partial<Capsule>) => {
    try {
      await StorageService.updateCapsule(id, updates);
      await loadCapsules(); // Reload after update
    } catch (error) {
      console.error('Failed to update capsule:', error);
      throw error;
    }
  }, [loadCapsules]);

  const checkUnlockedCapsules = useCallback(async () => {
    try {
      const unlocked = await StorageService.checkUnlockedCapsules();
      if (unlocked.length > 0) {
        await loadCapsules(); // Reload if any were unlocked
      }
      return unlocked;
    } catch (error) {
      console.error('Failed to check unlocked capsules:', error);
      return [];
    }
  }, [loadCapsules]);

  useEffect(() => {
    loadCapsules();
  }, [loadCapsules]);

  return {
    capsules,
    loading,
    loadCapsules,
    getCapsulesByType,
    capsuleCounts: getCapsuleCounts(),
    latestCapsules: getLatestCapsules(),
    deleteCapsule,
    updateCapsule,
    checkUnlockedCapsules,
  };
};