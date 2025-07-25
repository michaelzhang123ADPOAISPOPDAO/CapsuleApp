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
import { TimerDisplay } from '../components/TimerDisplay';
import Icon from 'react-native-vector-icons/Ionicons';
import { CapsuleType } from '../types';
import { COLORS, MAX_RECORDING_DURATION } from '../constants';
import HapticFeedback from 'react-native-haptic-feedback';

interface RecordingScreenProps {
  route: {
    params: {
      type: CapsuleType;
    };
  };
  navigation: any;
}

const RecordingScreen: React.FC<RecordingScreenProps> = ({ route, navigation }) => {
  const { type } = route.params;
  const [isVideo, setIsVideo] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices?.[cameraPosition];
  
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
    Animated.spring(recordButtonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleRecordButtonPressOut = () => {
    Animated.spring(recordButtonScale, {
      toValue: 1,
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
        return { icon: '📝', title: 'Daily Capsule' };
      case 'future':
        return { icon: '📮', title: 'Future Capsule' };
      case 'lift':
        return { icon: '💗', title: 'Lift Capsule' };
    }
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
              name="mic" 
              size={80} 
              color={isRecording ? COLORS.primary : COLORS.textSecondary} 
            />
            {isRecording && (
              <Text style={styles.audioRecordingText}>Recording Audio...</Text>
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
          <Text style={styles.typeIcon}>{typeInfo.icon}</Text>
          <Text style={styles.typeTitle}>{typeInfo.title}</Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <TimerDisplay 
          duration={duration} 
          maxDuration={MAX_RECORDING_DURATION}
          isRecording={isRecording}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          onPress={toggleMediaType}
          style={[styles.controlButton, isRecording && styles.controlButtonDisabled]}
          disabled={isRecording}
        >
          <Icon 
            name={isVideo ? 'videocam' : 'mic'} 
            size={30} 
            color={isRecording ? '#666' : 'white'} 
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
              name="camera-reverse" 
              size={30} 
              color={isRecording ? '#666' : 'white'} 
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
  audioRecordingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
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
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 8,
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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