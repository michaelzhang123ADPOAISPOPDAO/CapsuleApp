import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useRecording } from '../hooks/useRecording';
import Icon from '../components/Icon';
import { COLORS, MAX_RECORDING_DURATION } from '../constants';
import HapticFeedback from 'react-native-haptic-feedback';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type RecordingScreenProps = StackScreenProps<RootStackParamList, 'Recording'>;

const RecordingScreen: React.FC<RecordingScreenProps> = ({ route, navigation }) => {
  const { type } = route.params;
  const [isVideo, setIsVideo] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === cameraPosition);
  
  const { 
    isRecording, 
    duration, 
    startRecording, 
    stopRecording 
  } = useRecording();

  const recordButtonScale = useRef(new Animated.Value(1)).current;
  const audioVisualizerScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (duration >= MAX_RECORDING_DURATION) {
      handleStopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  useEffect(() => {
    if (isRecording && !isVideo) {
      // Animate audio visualizer
      Animated.loop(
        Animated.sequence([
          Animated.timing(audioVisualizerScale, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(audioVisualizerScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      audioVisualizerScale.setValue(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, isVideo]);

  const handleStartRecording = async () => {
    try {
      HapticFeedback.trigger('impactMedium');
      const path = await startRecording(camera.current, isVideo);
      console.log('Recording started at:', path);
    } catch (error) {
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
      console.error('Recording error:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      HapticFeedback.trigger('impactMedium');
      const result = await stopRecording();
      if (result && result.path) {
        navigation.navigate('Review', { 
          ...result, 
          type,
          mediaType: isVideo ? 'video' : 'audio' 
        });
      } else {
        Alert.alert('Error', 'Failed to save recording. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
      console.error('Stop recording error:', error);
    }
  };

  const toggleCamera = () => {
    if (isRecording) return;
    HapticFeedback.trigger('impactLight');
    setCameraPosition(p => p === 'front' ? 'back' : 'front');
  };

  const toggleMediaType = () => {
    if (isRecording) return;
    HapticFeedback.trigger('impactLight');
    setIsVideo(!isVideo);
  };

  const handleRecordButtonPressIn = () => {
    Animated.timing(recordButtonScale, {
      toValue: 0.97,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleRecordButtonPressOut = () => {
    Animated.timing(recordButtonScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleClose = () => {
    if (isRecording) {
      Alert.alert(
        'Stop Recording?',
        'Are you sure you want to stop and discard this recording?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: async () => {
              await stopRecording();
              navigation.goBack();
            }
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const getTypeInfo = () => {
    switch (type) {
      case 'daily':
        return { icon: 'daily', title: 'Daily Capsule' };
      case 'future':
        return { icon: 'future', title: 'Future Capsule' };
      case 'lift':
        return { icon: 'lift', title: 'Lift Capsule' };
    }
  };

  // Format time without leading zeros for warmth
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const typeInfo = getTypeInfo();

  if (!device) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Camera not available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      {/* Camera or Audio Visualization */}
      {isVideo ? (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          video={true}
          audio={true}
        />
      ) : (
        <View style={styles.audioContainer}>
          <Animated.View 
            style={[
              styles.audioVisualizer,
              { transform: [{ scale: audioVisualizerScale }] }
            ]}
          >
            <Icon 
              name="audio" 
              size={60} 
              color={COLORS.surface} 
            />
            <Text style={styles.audioText}>Audio Recording</Text>
            {isRecording && (
              <View style={styles.audioDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            )}
          </Animated.View>
        </View>
      )}

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" size={28} color="white" />
        </TouchableOpacity>
        
        <View style={styles.typeIndicator}>
          <Icon name={typeInfo.icon} size={20} color="white" />
          <Text style={styles.typeTitle}>{typeInfo.title}</Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <View style={styles.timerBubble}>
          <Text style={styles.timerText}>
            {formatTime(duration)} / 10:00
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          onPress={toggleMediaType}
          style={[styles.controlButton, isRecording && styles.controlButtonDisabled]}
          disabled={isRecording}
        >
          <Icon 
            name={isVideo ? 'video' : 'audio'} 
            size={24} 
            color={isRecording ? 'rgba(255,255,255,0.4)' : '#FFFFFF'} 
          />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: recordButtonScale }] }}>
          <TouchableOpacity
            onPress={isRecording ? handleStopRecording : handleStartRecording}
            onPressIn={handleRecordButtonPressIn}
            onPressOut={handleRecordButtonPressOut}
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}
            activeOpacity={0.8}
          >
            <View style={isRecording ? styles.stopIcon : styles.recordIcon} />
          </TouchableOpacity>
        </Animated.View>

        {isVideo ? (
          <TouchableOpacity 
            onPress={toggleCamera}
            style={[styles.controlButton, isRecording && styles.controlButtonDisabled]}
            disabled={isRecording}
          >
            <Icon 
              name="flip" 
              size={24} 
              color={isRecording ? 'rgba(255,255,255,0.4)' : '#FFFFFF'} 
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.controlButton} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
  },
  audioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  audioVisualizer: {
    alignItems: 'center',
  },
  audioText: {
    color: COLORS.surface,
    fontSize: 18,
    marginTop: 16,
    fontWeight: '500',
  },
  audioDots: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  typeTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  timerContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  timerBubble: {
    backgroundColor: COLORS.overlay,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: '500',
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(102, 102, 102, 0.2)',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  recordButtonActive: {
    backgroundColor: '#FF3B3B',
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  stopIcon: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 4,
  },
});

export default RecordingScreen;