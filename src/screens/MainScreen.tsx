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
import { COLORS } from '../constants';
import { formatDate, formatUnlockDate } from '../utils/dateHelpers';

interface MainScreenProps {
  navigation: any;
}

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const { capsuleCounts, latestCapsules, checkUnlockedCapsules } = useCapsules();
  const { hasAllPermissions, requestAllPermissions } = usePermissions();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Check for newly unlocked capsules when screen loads
    checkUnlockedCapsules();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
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
          activeOpacity={0.7}
        >
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryIcon}>📝</Text>
            <Text style={styles.categoryTitle}>Daily ({capsuleCounts.daily})</Text>
          </View>
          {latestCapsules.daily ? (
            <Text style={styles.categoryPreview} numberOfLines={1}>
              {latestCapsules.daily.title || formatDate(latestCapsules.daily.createdAt)}
            </Text>
          ) : (
            <Text style={styles.categoryPreview}>No daily capsules yet</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => navigation.navigate('Category', { type: 'future' })}
          activeOpacity={0.7}
        >
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryIcon}>📮</Text>
            <Text style={styles.categoryTitle}>Future ({capsuleCounts.future})</Text>
          </View>
          <Text style={styles.categoryPreview} numberOfLines={1}>
            {getNextUnlock() || 'No scheduled messages'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => navigation.navigate('Category', { type: 'lift' })}
          activeOpacity={0.7}
        >
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryIcon}>💗</Text>
            <Text style={styles.categoryTitle}>Lift ({capsuleCounts.lift})</Text>
          </View>
          {latestCapsules.lift ? (
            <Text style={styles.categoryPreview} numberOfLines={1}>
              {latestCapsules.lift.emotion || 'Latest lift capsule'}
            </Text>
          ) : (
            <Text style={styles.categoryPreview}>No lift capsules yet</Text>
          )}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  recordButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  recordButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 25,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  recordButtonHint: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '400',
  },
  categoryList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryPreview: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 36,
  },
});

export default MainScreen;