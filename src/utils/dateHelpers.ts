import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (timestamp: number): string => {
  return format(new Date(timestamp), 'MMM d, yyyy');
};

export const formatTime = (timestamp: number): string => {
  return format(new Date(timestamp), 'h:mm a');
};

export const formatDateTime = (timestamp: number): string => {
  return format(new Date(timestamp), 'MMM d, yyyy • h:mm a');
};

export const formatRelativeTime = (timestamp: number): string => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatUnlockDate = (unlockDate: number): string => {
  const now = Date.now();
  const days = Math.ceil((unlockDate - now) / (1000 * 60 * 60 * 24));
  
  if (days <= 0) return 'Unlocked';
  if (days === 1) return 'Unlocks tomorrow';
  if (days < 30) return `Unlocks in ${days} days`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `Unlocks in ${months} month${months > 1 ? 's' : ''}`;
  }
  
  const years = Math.floor(days / 365);
  return `Unlocks in ${years} year${years > 1 ? 's' : ''}`;
};