import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import Video from 'react-native-video';
import DatePicker from 'react-native-date-picker';
import RNFS from 'react-native-fs';
import StorageService from '../services/StorageService';
import NotificationService from '../services/NotificationService';
import { CapsuleType } from '../types';
import { COLORS, EMOTIONS } from '../constants';
import { formatDuration } from '../utils/dateHelpers';
import Icon from 'react-native-vector-icons/Ionicons';
import HapticFeedback from 'react-native-haptic-feedback';

interface ReviewScreenProps {
  route: {
    params: {
      path: string;
      duration: number;
      type: CapsuleType;
      mediaType: 'video' | 'audio';
    };
  };
  navigation: any;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({ route, navigation }) => {
  const { path, duration, type, mediaType } = route.params;
  const [title, setTitle] = useState('');
  const [unlockDate, setUnlockDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days default
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState(EMOTIONS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const metadata = {
        type: type as CapsuleType,
        title: title.trim() || undefined,
        duration,
        mediaType,
        ...(type === 'future' && { unlockDate: unlockDate.getTime() }),
        ...(type === 'lift' && { emotion: selectedEmotion }),
      };
      
      const capsule = await StorageService.saveCapsule(path, metadata);
      
      // Schedule notification for future capsules
      if (type === 'future' && capsule.unlockDate) {
        await NotificationService.scheduleUnlock(capsule);
      }
      
      HapticFeedback.trigger('impactMedium');
      
      // Navigate back to main screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save capsule. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Recording?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: async () => {
            try {
              await RNFS.unlink(path);
            } catch (error) {
              console.warn('Failed to delete temp file:', error);
            }
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          }
        },
      ]
    );
  };

  const formatUnlockDate = () => {
    const days = Math.ceil((unlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 30) return `In ${days} days`;
    if (days < 365) return `In ${Math.floor(days / 30)} months`;
    return `In ${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''}`;
  };

  const getTypeInfo = () => {
    switch (type) {
      case 'daily':
        return { icon: '📝', title: 'Daily Capsule', color: '#E8F4FD' };
      case 'future':
        return { icon: '📮', title: 'Future Capsule', color: '#FFF4E6' };
      case 'lift':
        return { icon: '💗', title: 'Lift Capsule', color: '#FFE4E6' };
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Preview Section */}
        <View style={styles.previewSection}>
          {mediaType === 'video' ? (
            <Video
              source={{ uri: path }}
              style={styles.video}
              paused={!isPlaying}
              repeat={true}
              rate={playbackRate}
              resizeMode="cover"
              onLoad={() => setIsPlaying(true)}
            />
          ) : (
            <View style={styles.audioPlayer}>
              <Icon name="musical-notes" size={80} color={COLORS.primary} />
              <Text style={styles.audioTitle}>Audio Recording</Text>
              <Text style={styles.duration}>{formatDuration(duration)}</Text>
            </View>
          )}

          {/* Playback Controls */}
          <View style={styles.playbackControls}>
            {mediaType === 'video' && (
              <TouchableOpacity
                onPress={() => setIsPlaying(!isPlaying)}
                style={styles.playButton}
              >
                <Icon 
                  name={isPlaying ? 'pause' : 'play'} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            )}
            
            {/* Speed Controls */}
            <View style={styles.speedControls}>
              {[1, 1.5].map(speed => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedButton,
                    playbackRate === speed && styles.speedButtonActive
                  ]}
                  onPress={() => setPlaybackRate(speed)}
                >
                  <Text style={[
                    styles.speedText,
                    playbackRate === speed && styles.speedTextActive
                  ]}>
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Metadata Section */}
        <View style={styles.metadataSection}>
          <View style={[styles.typeHeader, { backgroundColor: typeInfo.color }]}>
            <Text style={styles.typeIcon}>{typeInfo.icon}</Text>
            <Text style={styles.typeTitle}>{typeInfo.title}</Text>
          </View>
          
          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Title (Optional)</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Give it a title..."
              placeholderTextColor={COLORS.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
          </View>

          {/* Type-specific inputs */}
          {type === 'future' && (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>When should this unlock?</Text>
              <TouchableOpacity 
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateSelectorLabel}>Unlock Date</Text>
                <View style={styles.dateSelectorValue}>
                  <Text style={styles.dateSelectorText}>{formatUnlockDate()}</Text>
                  <Icon name="chevron-down" size={16} color={COLORS.accent} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {type === 'lift' && (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>How are you feeling?</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.emotionScroll}
                contentContainerStyle={styles.emotionScrollContent}
              >
                {EMOTIONS.map(emotion => (
                  <TouchableOpacity
                    key={emotion}
                    style={[
                      styles.emotionChip,
                      selectedEmotion === emotion && styles.emotionChipActive
                    ]}
                    onPress={() => setSelectedEmotion(emotion)}
                  >
                    <Text style={[
                      styles.emotionChipText,
                      selectedEmotion === emotion && styles.emotionChipTextActive
                    ]}>
                      {emotion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.discardButton}
          onPress={handleDiscard}
          disabled={isSaving}
        >
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveText}>
            {isSaving ? 'Saving...' : 'Save Capsule'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={showDatePicker}
        date={unlockDate}
        mode="date"
        minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Min 1 day
        maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // Max 1 year
        onConfirm={(date) => {
          setShowDatePicker(false);
          setUnlockDate(date);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  previewSection: {
    height: 300,
    position: 'relative',
  },
  video: {
    flex: 1,
  },
  audioPlayer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  audioTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  duration: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  playbackControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedControls: {
    flexDirection: 'row',
    gap: 8,
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  speedButtonActive: {
    backgroundColor: COLORS.primary,
  },
  speedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  speedTextActive: {
    color: 'white',
  },
  metadataSection: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    paddingBottom: 100, // Space for action buttons
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 8,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  dateSelector: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSelectorLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  dateSelectorValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
    marginRight: 8,
  },
  emotionScroll: {
    marginHorizontal: -20,
  },
  emotionScrollContent: {
    paddingHorizontal: 20,
  },
  emotionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 12,
  },
  emotionChipActive: {
    backgroundColor: COLORS.primary,
  },
  emotionChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  emotionChipTextActive: {
    color: 'white',
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  discardButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
  },
  discardText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ReviewScreen;