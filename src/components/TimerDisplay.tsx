import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimerDisplayProps } from '../types';
import { formatDuration } from '../utils/dateHelpers';
import { COLORS } from '../constants';

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  duration, 
  maxDuration, 
  isRecording 
}) => {
  const progress = duration / maxDuration;
  const isNearEnd = progress > 0.8;
  const isAtEnd = progress >= 1;

  const getTimerColor = () => {
    if (isAtEnd) return '#FF3B30';
    if (isNearEnd) return '#FF9500';
    if (isRecording) return COLORS.primary;
    return 'white';
  };

  const getRemainingTime = () => {
    const remaining = maxDuration - duration;
    return formatDuration(remaining);
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, { color: getTimerColor() }]}>
          {formatDuration(duration)}
        </Text>
        {isRecording && (
          <View style={[styles.recordingIndicator, { backgroundColor: getTimerColor() }]} />
        )}
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${Math.min(progress * 100, 100)}%`,
                backgroundColor: getTimerColor()
              }
            ]} 
          />
        </View>
      </View>

      {/* Remaining Time */}
      {isRecording && (
        <Text style={styles.remainingText}>
          {isAtEnd ? 'Maximum reached' : `${getRemainingTime()} left`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  progressBarContainer: {
    marginBottom: 4,
  },
  progressBarBackground: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  remainingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
});