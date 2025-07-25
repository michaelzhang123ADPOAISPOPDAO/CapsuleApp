import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CapsuleCardProps } from '../types';
import { COLORS } from '../constants';
import { formatDate, formatDuration, formatUnlockDate } from '../utils/dateHelpers';

export const CapsuleCard: React.FC<CapsuleCardProps> = ({ capsule, onPress }) => {
  const getTypeColor = () => {
    switch (capsule.type) {
      case 'daily': return '#E8F4FD';
      case 'future': return '#FFF4E6';
      case 'lift': return '#FFE4E6';
    }
  };

  const getTypeIcon = () => {
    switch (capsule.type) {
      case 'daily': return '📝';
      case 'future': return '📮';
      case 'lift': return '💗';
    }
  };

  const getStatusInfo = () => {
    if (capsule.type === 'future') {
      if (!capsule.isUnlocked && capsule.unlockDate) {
        return {
          text: formatUnlockDate(capsule.unlockDate),
          icon: 'lock-closed',
          color: COLORS.warning,
        };
      } else {
        return {
          text: 'Unlocked',
          icon: 'lock-open',
          color: COLORS.success,
        };
      }
    }
    return null;
  };

  const statusInfo = getStatusInfo();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={capsule.type === 'future' && !capsule.isUnlocked}
    >
      <View style={[styles.typeIndicator, { backgroundColor: getTypeColor() }]}>
        <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {capsule.title || formatDate(capsule.createdAt)}
          </Text>
          <View style={styles.metadata}>
            <Icon 
              name={capsule.mediaType === 'video' ? 'videocam' : 'mic'} 
              size={16} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.duration}>
              {formatDuration(capsule.duration)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.date}>
            {formatDate(capsule.createdAt)}
          </Text>
          
          {capsule.type === 'lift' && capsule.emotion && (
            <View style={styles.emotionTag}>
              <Text style={styles.emotionText}>{capsule.emotion}</Text>
            </View>
          )}
          
          {statusInfo && (
            <View style={[styles.statusTag, { backgroundColor: statusInfo.color }]}>
              <Icon 
                name={statusInfo.icon} 
                size={12} 
                color="white" 
              />
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.arrow}>
        <Icon 
          name="chevron-forward" 
          size={20} 
          color={COLORS.textSecondary} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  typeIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emotionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  emotionText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  arrow: {
    justifyContent: 'center',
    marginLeft: 8,
  },
});