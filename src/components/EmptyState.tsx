import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { EmptyStateProps } from '../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

interface EmptyStatePropsExtended extends EmptyStateProps {
  searchQuery?: string;
}

export const EmptyState: React.FC<EmptyStatePropsExtended> = ({ type, searchQuery }) => {
  const getEmptyStateContent = () => {
    if (searchQuery) {
      return {
        icon: 'search',
        title: 'No matches found',
        subtitle: `No capsules match "${searchQuery}"`,
        iconColor: COLORS.textSecondary,
      };
    }

    switch (type) {
      case 'daily':
        return {
          icon: 'daily',
          title: 'No daily capsules yet',
          subtitle: 'Start recording your daily moments',
          iconColor: COLORS.daily,
        };
      case 'future':
        return {
          icon: 'future',
          title: 'No future capsules yet',
          subtitle: 'Send a message to your future self',
          iconColor: COLORS.future,
        };
      case 'lift':
        return {
          icon: 'lift',
          title: 'No lift capsules yet',
          subtitle: 'Record something to lift your spirits',
          iconColor: COLORS.lift,
        };
      default:
        return {
          icon: 'empty',
          title: 'No capsules',
          subtitle: 'Start recording to see your capsules here',
          iconColor: COLORS.textSecondary,
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon 
          name={content.icon} 
          size={64} 
          color={content.iconColor} 
        />
      </View>
      
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: SPACING.xl * 3,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.heading,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});