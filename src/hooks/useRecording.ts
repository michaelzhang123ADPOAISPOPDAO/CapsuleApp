import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera } from 'react-native-vision-camera';
import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';
import { MAX_RECORDING_DURATION } from '../constants';

// Configure AudioRecord
const options = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  audioSource: 6, // VOICE_RECOGNITION
  wavFile: 'temp_audio.wav'
};

AudioRecord.init(options);

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingPath = useRef<string | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(async (
    camera: Camera | null,
    isVideo: boolean
  ): Promise<string> => {
    try {
      // Setup path
      const fileName = `temp_${Date.now()}.${isVideo ? 'mp4' : 'm4a'}`;
      const path = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
      recordingPath.current = path;
      cameraRef.current = camera;

      // Start recording
      if (isVideo && camera) {
        camera.startRecording({
          onRecordingFinished: (video) => {
            console.log('Video recording finished:', video.path);
            recordingPath.current = video.path;
          },
          onRecordingError: (error) => {
            console.error('Video recording error:', error);
          },
        });
      } else {
        // For audio recording
        AudioRecord.start();
      }

      // Start timer
      setIsRecording(true);
      setDuration(0);
      
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= MAX_RECORDING_DURATION) {
            // Auto-stop recording when max duration reached
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

      return path;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      // Stop timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      let finalPath = recordingPath.current;

      if (isRecording) {
        // Stop camera recording if it was video
        if (cameraRef.current) {
          await cameraRef.current.stopRecording();
        } else {
          // Stop audio recording
          const audioPath = await AudioRecord.stop();
          finalPath = audioPath;
        }
      }

      setIsRecording(false);
      
      if (!finalPath) {
        throw new Error('Recording path is null');
      }
      
      return {
        path: finalPath,
        duration,
      };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }, [isRecording, duration]);

  const pauseRecording = useCallback(async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Note: react-native-audio-record doesn't support pause/resume
      console.log('Pause not supported with react-native-audio-record');
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      // Note: react-native-audio-record doesn't support pause/resume
      console.log('Resume not supported with react-native-audio-record');
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  }, []);

  return {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
};