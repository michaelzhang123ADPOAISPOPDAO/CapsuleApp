import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { CapsuleType } from '../types';
import { COLORS } from '../constants';

interface RadialMenuProps {
  onSelect: (type: CapsuleType) => void;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const RadialMenu: React.FC<RadialMenuProps> = ({ onSelect, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
          style={[styles.menuItem, styles.dailyItem]}
          onPress={() => handleSelect('daily')}
          activeOpacity={0.8}
        >
          <Text style={styles.menuIcon}>📝</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Daily</Text>
            <Text style={styles.menuDescription}>Quick daily reflection</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.futureItem]}
          onPress={() => handleSelect('future')}
          activeOpacity={0.8}
        >
          <Text style={styles.menuIcon}>📮</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Future</Text>
            <Text style={styles.menuDescription}>Message to future self</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.liftItem]}
          onPress={() => handleSelect('lift')}
          activeOpacity={0.8}
        >
          <Text style={styles.menuIcon}>💗</Text>
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
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  dailyItem: {
    backgroundColor: '#E8F4FD',
  },
  futureItem: {
    backgroundColor: '#FFF4E6',
  },
  liftItem: {
    backgroundColor: '#FFE4E6',
  },
  menuIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});