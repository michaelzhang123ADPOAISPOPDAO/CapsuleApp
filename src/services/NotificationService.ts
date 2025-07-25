import notifee from '@notifee/react-native';
import { Capsule } from '../types';
import { NOTIFICATION_IDS } from '../constants';

class NotificationService {
  static async initialize(): Promise<void> {
    try {
      await notifee.requestPermission();
      
      // Create notification channel for Android
      await notifee.createChannel({
        id: 'default',
        name: 'Capsule Notifications',
        importance: 4, // High importance
      });
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  static async scheduleUnlock(capsule: Capsule): Promise<void> {
    if (capsule.type !== 'future' || !capsule.unlockDate) {
      return;
    }

    try {
      const notificationId = `${NOTIFICATION_IDS.FUTURE_UNLOCK}${capsule.id}`;
      
      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title: 'Capsule Unlocked! 📮',
          body: capsule.title || 'Your future message is ready to watch',
          android: {
            channelId: 'default',
            smallIcon: 'ic_launcher',
            pressAction: {
              id: 'default',
            },
          },
          ios: {
            sound: 'default',
          },
        },
        {
          type: 'timestamp' as const,
          timestamp: capsule.unlockDate,
        }
      );
    } catch (error) {
      console.error('Failed to schedule unlock notification:', error);
    }
  }

  static async cancelUnlock(capsuleId: string): Promise<void> {
    try {
      const notificationId = `${NOTIFICATION_IDS.FUTURE_UNLOCK}${capsuleId}`;
      await notifee.cancelNotification(notificationId);
    } catch (error) {
      console.error('Failed to cancel unlock notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }
}

export default NotificationService;