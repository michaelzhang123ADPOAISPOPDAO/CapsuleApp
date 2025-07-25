import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { CapsuleType } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, LAYOUT } from '../constants';
import Icon from './Icon';

interface RadialMenuProps {
  onSelect: (type: CapsuleType) => void;
  onClose: () => void;
}


export const RadialMenu: React.FC<RadialMenuProps> = ({ onSelect, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: LAYOUT.animationDuration,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleSelect = (type: CapsuleType) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onSelect(type));
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        { opacity: fadeAnim }
      ]}
    >
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
      />

      <Animated.View
        style={[
          styles.menuContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleSelect('daily')}
          activeOpacity={0.9}
        >
          <View style={[styles.typeIndicator, { backgroundColor: COLORS.daily }]} />
          <Icon name="daily" size={24} color={COLORS.textPrimary} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Daily</Text>
            <Text style={styles.menuDescription}>Quick daily reflection</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleSelect('future')}
          activeOpacity={0.9}
        >
          <View style={[styles.typeIndicator, { backgroundColor: COLORS.future }]} />
          <Icon name="future" size={24} color={COLORS.textPrimary} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Future</Text>
            <Text style={styles.menuDescription}>Message to future self</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleSelect('lift')}
          activeOpacity={0.9}
        >
          <View style={[styles.typeIndicator, { backgroundColor: COLORS.lift }]} />
          <Icon name="lift" size={24} color={COLORS.textPrimary} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Lift</Text>
            <Text style={styles.menuDescription}>Emotional support</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuContainer: {
    width: 320,
    backgroundColor: COLORS.surface,
    borderWidth: LAYOUT.borderWidth,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius * 2,
    padding: SPACING.screenPadding,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: LAYOUT.borderRadius,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: LAYOUT.borderWidth,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  typeIndicator: {
    width: 3,
    height: 24,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    ...TYPOGRAPHY.heading,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  menuDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});