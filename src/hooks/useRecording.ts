import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera } from 'react-native-vision-camera';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { MAX_RECORDING_DURATION } from '../constants';

const audioRecorder = AudioRecorderPlayer;

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const recordingPath = useRef<string>();
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
        await audioRecorder.startRecorder(path, {});
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
          await audioRecorder.stopRecorder();
        }
      }

      setIsRecording(false);
      
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
      
      // Note: Camera doesn't support pause, so this is mainly for audio
      await audioRecorder.pauseRecorder();
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      await audioRecorder.resumeRecorder();
      
      // Resume timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= MAX_RECORDING_DURATION) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
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