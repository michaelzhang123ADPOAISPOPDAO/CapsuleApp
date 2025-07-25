import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import Video from 'react-native-video';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Icon from '../components/Icon';
import { COLORS, TYPOGRAPHY } from '../constants';
import { formatDate, formatDuration, formatUnlockDate } from '../utils/dateHelpers';
import StorageService from '../services/StorageService';
import HapticFeedback from 'react-native-haptic-feedback';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type PlaybackScreenProps = StackScreenProps<RootStackParamList, 'Playback'>;

const audioPlayer = AudioRecorderPlayer;

const PlaybackScreen: React.FC<PlaybackScreenProps> = ({ route, navigation }) => {
  const { capsule } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(capsule.duration);
  
  const videoRef = useRef<any>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls for video
  const resetHideControlsTimer = () => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    
    setShowControls(true);
    
    if (capsule.mediaType === 'video' && isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handlePlayPause = async () => {
    HapticFeedback.trigger('impactLight');
    
    if (capsule.mediaType === 'video') {
      setIsPlaying(!isPlaying);
    } else {
      // Handle audio playback
      if (isPlaying) {
        await audioPlayer.pausePlayer();
        setIsPlaying(false);
      } else {
        const mediaPath = StorageService.getMediaPath(capsule.filePath);
        await audioPlayer.startPlayer(mediaPath, {});
        setIsPlaying(true);
        
        audioPlayer.addPlayBackListener((e: any) => {
          setAudioPosition(Math.floor(e.currentPosition / 1000));
          setAudioDuration(Math.floor(e.duration / 1000));
          
          if (e.currentPosition >= e.duration) {
            setIsPlaying(false);
            setAudioPosition(0);
          }
        });
      }
    }
    
    resetHideControlsTimer();
  };

  const handleSpeedChange = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    resetHideControlsTimer();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Capsule',
      'Are you sure you want to delete this capsule? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteCapsule(capsule.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete capsule');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      const message = capsule.title 
        ? `Check out my capsule: "${capsule.title}"`
        : `Check out my ${capsule.type} capsule from ${formatDate(capsule.createdAt)}`;
        
      await Share.share({
        message,
        title: 'Capsule App',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const getTypeInfo = () => {
    switch (capsule.type) {
      case 'daily':
        return { icon: 'daily', title: 'Daily Capsule' };
      case 'future':
        return { icon: 'future', title: 'Future Capsule' };
      case 'lift':
        return { icon: 'lift', title: 'Lift Capsule' };
    }
  };

  const typeInfo = getTypeInfo();
  const mediaPath = StorageService.getMediaPath(capsule.filePath);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {/* Media Display */}
      <TouchableOpacity
        style={styles.mediaContainer}
        activeOpacity={1}
        onPress={resetHideControlsTimer}
      >
        {capsule.mediaType === 'video' ? (
          <Video
            ref={videoRef}
            source={{ uri: mediaPath }}
            style={StyleSheet.absoluteFill}
            paused={!isPlaying}
            rate={playbackRate}
            resizeMode="contain"
            onProgress={(data) => setCurrentTime(Math.floor(data.currentTime))}
            onEnd={() => setIsPlaying(false)}
          />
        ) : (
          <View style={styles.audioVisualization}>
            <Icon 
              name="audio" 
              size={120} 
              color={COLORS.primary} 
            />
            <Text style={styles.audioTitle}>
              {capsule.title || 'Audio Recording'}
            </Text>
            
            {/* Audio Progress */}
            <View style={styles.audioProgress}>
              <Text style={styles.timeText}>
                {formatDuration(audioPosition)}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(audioPosition / audioDuration) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.timeText}>
                {formatDuration(audioDuration)}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Controls Overlay */}
      {showControls && (
        <>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.topButton}
            >
              <Icon name="back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.topCenter}>
              <Icon name={typeInfo.icon} size={20} color="white" />
              <Text style={styles.topTitle}>{typeInfo.title}</Text>
            </View>
            
            <TouchableOpacity 
              onPress={handleShare}
              style={styles.topButton}
            >
              <Icon name="share" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {/* Metadata */}
            <View style={styles.metadata}>
              <Text style={styles.metadataTitle} numberOfLines={1}>
                {capsule.title || formatDate(capsule.createdAt)}
              </Text>
              
              <View style={styles.metadataRow}>
                <Text style={styles.metadataText}>
                  {formatDate(capsule.createdAt)}
                </Text>
                <Text style={styles.metadataText}>•</Text>
                <Text style={styles.metadataText}>
                  {formatDuration(capsule.duration)}
                </Text>
                {capsule.emotion && (
                  <>
                    <Text style={styles.metadataText}>•</Text>
                    <Text style={styles.metadataText}>
                      {capsule.emotion}
                    </Text>
                  </>
                )}
              </View>
              
              {capsule.type === 'future' && capsule.unlockDate && (
                <Text style={styles.unlockInfo}>
                  {capsule.isUnlocked 
                    ? `Unlocked ${formatDate(Date.now())}` 
                    : formatUnlockDate(capsule.unlockDate)
                  }
                </Text>
              )}
            </View>

            {/* Playback Controls */}
            <View style={styles.playbackControls}>
              <TouchableOpacity
                onPress={handleSpeedChange}
                style={styles.speedButton}
              >
                <Text style={styles.speedText}>{playbackRate}x</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.playButton}
              >
                <Icon 
                  name={isPlaying ? 'pause' : 'play'} 
                  size={32} 
                  color="white" 
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteButton}
              >
                <Icon name="delete" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            {/* Video Progress */}
            {capsule.mediaType === 'video' && (
              <View style={styles.videoProgress}>
                <Text style={styles.timeText}>
                  {formatDuration(currentTime)}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(currentTime / capsule.duration) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.timeText}>
                  {formatDuration(capsule.duration)}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  mediaContainer: {
    flex: 1,
  },
  audioVisualization: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 40,
  },
  audioTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  audioProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 16,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  topTitle: {
    ...TYPOGRAPHY.button,
    color: 'white',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  metadata: {
    marginBottom: 20,
  },
  metadataTitle: {
    ...TYPOGRAPHY.heading,
    color: 'white',
    marginBottom: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataText: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  unlockInfo: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  speedButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  speedText: {
    ...TYPOGRAPHY.button,
    fontSize: 14,
    color: 'white',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  timeText: {
    ...TYPOGRAPHY.timestamp,
    color: 'white',
    minWidth: 40,
    textAlign: 'center',
  },
});

export default PlaybackScreen;