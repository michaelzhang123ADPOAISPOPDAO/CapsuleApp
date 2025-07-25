import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { CapsuleCardProps } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, LAYOUT } from '../constants';
import { formatDate, formatDuration, formatUnlockDate } from '../utils/dateHelpers';

export const CapsuleCard: React.FC<CapsuleCardProps> = ({ capsule, onPress }) => {
  const getTypeColor = () => {
    switch (capsule.type) {
      case 'daily': return COLORS.daily;
      case 'future': return COLORS.future;
      case 'lift': return COLORS.lift;
    }
  };


  const getStatusInfo = () => {
    if (capsule.type === 'future') {
      if (!capsule.isUnlocked && capsule.unlockDate) {
        return {
          text: formatUnlockDate(capsule.unlockDate),
          icon: 'lock',
          color: COLORS.secondary,
        };
      } else {
        return {
          text: 'Unlocked',
          icon: 'lock',
          color: COLORS.primary,
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
      activeOpacity={0.9}
      disabled={capsule.type === 'future' && !capsule.isUnlocked}
    >
      <View style={[styles.typeIndicator, { backgroundColor: getTypeColor() }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {capsule.title || formatDate(capsule.createdAt)}
          </Text>
          <View style={styles.metadata}>
            <Icon 
              name={capsule.mediaType === 'video' ? 'video' : 'audio'} 
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
            <View style={styles.statusIndicator}>
              <Icon 
                name={statusInfo.icon} 
                size={12} 
                color={statusInfo.color} 
              />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
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
    backgroundColor: COLORS.surface,
    borderWidth: LAYOUT.borderWidth,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius,
    overflow: 'hidden',
    marginBottom: SPACING.cardGap,
  },
  typeIndicator: {
    width: 3,
  },
  content: {
    flex: 1,
    padding: LAYOUT.cardPadding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    ...TYPOGRAPHY.timestamp,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  date: {
    ...TYPOGRAPHY.timestamp,
    color: COLORS.textSecondary,
  },
  emotionTag: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: LAYOUT.borderWidth,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  emotionText: {
    ...TYPOGRAPHY.caption,
    fontFamily: 'Inter-Medium',
    color: COLORS.textPrimary,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontFamily: 'Inter-Medium',
  },
  arrow: {
    paddingLeft: SPACING.sm,
    justifyContent: 'center',
  },
});