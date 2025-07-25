import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { useCapsules } from '../hooks/useCapsules';
import { usePermissions } from '../hooks/usePermissions';
import { RadialMenu } from '../components/RadialMenu';
import HapticFeedback from 'react-native-haptic-feedback';
import { CapsuleType } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, LAYOUT } from '../constants';
import { formatDate, formatUnlockDate } from '../utils/dateHelpers';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type MainScreenProps = StackScreenProps<RootStackParamList, 'Main'>;

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const { capsuleCounts, latestCapsules, checkUnlockedCapsules } = useCapsules();
  const { hasAllPermissions, requestAllPermissions } = usePermissions();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Check for newly unlocked capsules when screen loads
    checkUnlockedCapsules();
  }, [checkUnlockedCapsules]);

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const checkPermissionsAndNavigate = async (type: CapsuleType) => {
    if (!hasAllPermissions) {
      const result = await requestAllPermissions();
      if (!result.allGranted) {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone access are required to record capsules.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    navigation.navigate('Recording', { type });
  };

  const handlePress = () => {
    HapticFeedback.trigger('impactLight');
    checkPermissionsAndNavigate('daily');
  };

  const handleLongPress = () => {
    HapticFeedback.trigger('impactMedium');
    setShowRadialMenu(true);
  };

  const handleTypeSelect = (type: CapsuleType) => {
    setShowRadialMenu(false);
    checkPermissionsAndNavigate(type);
  };

  const getNextUnlock = () => {
    const future = latestCapsules.future;
    if (!future || future.isUnlocked) return null;
    if (!future.unlockDate) return null;
    return `🔒 ${formatUnlockDate(future.unlockDate)}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Capsule</Text>
        <Text style={styles.headerSubtitle}>Record moments for yourself</Text>
      </View>

      {/* Record Button */}
      <Animated.View style={[styles.recordButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          delayLongPress={500}
          activeOpacity={0.8}
        >
          <Text style={styles.recordButtonText}>Record Capsule</Text>
          <Text style={styles.recordButtonHint}>Tap for daily • Hold for options</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Category List */}
      <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => navigation.navigate('Category', { type: 'daily' })}
          activeOpacity={0.9}
        >
          <View style={[styles.typeIndicator, { backgroundColor: COLORS.daily }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Daily</Text>
              <Text style={styles.cardCount}>{capsuleCounts.daily}</Text>
            </View>
            <Text style={styles.cardMeta}>
              {latestCapsules.daily 
                ? `Last: ${formatDate(latestCapsules.daily.createdAt)}`
                : 'Nothing here yet'
              }
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => navigation.navigate('Category', { type: 'future' })}
          activeOpacity={0.9}
        >
          <View style={[styles.typeIndicator, { backgroundColor: COLORS.future }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Future</Text>
              <Text style={styles.cardCount}>{capsuleCounts.future}</Text>
            </View>
            <Text style={styles.cardMeta}>
              {getNextUnlock() || 'No scheduled messages'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => navigation.navigate('Category', { type: 'lift' })}
          activeOpacity={0.9}
        >
          <View style={[styles.typeIndicator, { backgroundColor: COLORS.lift }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Lift</Text>
              <Text style={styles.cardCount}>{capsuleCounts.lift}</Text>
            </View>
            <Text style={styles.cardMeta}>
              {latestCapsules.lift?.emotion || 'Nothing here yet'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Radial Menu */}
      {showRadialMenu && (
        <RadialMenu
          onSelect={handleTypeSelect}
          onClose={() => setShowRadialMenu(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 32,
    fontFamily: 'Inter-Medium',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  recordButtonContainer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
  },
  recordButton: {
    backgroundColor: COLORS.primary,
    height: 64,
    borderRadius: LAYOUT.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonText: {
    ...TYPOGRAPHY.button,
    fontSize: 18,
    color: '#FFFFFF',
  },
  recordButtonHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  categoryList: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    borderWidth: LAYOUT.borderWidth,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: SPACING.cardGap,
  },
  typeIndicator: {
    width: 3,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    ...TYPOGRAPHY.heading,
    color: COLORS.textPrimary,
  },
  cardCount: {
    ...TYPOGRAPHY.heading,
    color: COLORS.textSecondary,
  },
  cardMeta: {
    ...TYPOGRAPHY.timestamp,
    color: COLORS.textSecondary,
  },
});

export default MainScreen;