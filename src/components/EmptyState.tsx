import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { EmptyStateProps } from '../types';
import { COLORS } from '../constants';

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
          icon: 'calendar',
          title: 'No daily capsules yet',
          subtitle: 'Start recording your daily moments',
          iconColor: '#4A90E2',
        };
      case 'future':
        return {
          icon: 'time',
          title: 'No future capsules yet',
          subtitle: 'Send a message to your future self',
          iconColor: '#F39C12',
        };
      case 'lift':
        return {
          icon: 'heart',
          title: 'No lift capsules yet',
          subtitle: 'Record something to lift your spirits',
          iconColor: '#E74C3C',
        };
      default:
        return {
          icon: 'folder-open',
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
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});