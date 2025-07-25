import { useState } from 'react';
import { Camera } from 'react-native-vision-camera';

export const usePermissions = () => {
  const [cameraPermission, setCameraPermission] = useState<string>('not-determined');
  const [microphonePermission, setMicrophonePermission] = useState<string>('not-determined');

  const checkCameraPermission = async () => {
    try {
      const status = await Camera.getCameraPermissionStatus();
      setCameraPermission(status);
      return status;
    } catch (error) {
      console.error('Failed to check camera permission:', error);
      return 'denied';
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      const status = await Camera.getMicrophonePermissionStatus();
      setMicrophonePermission(status);
      return status;
    } catch (error) {
      console.error('Failed to check microphone permission:', error);
      return 'denied';
    }
  };

  const requestCameraPermission = async () => {
    try {
      const status = await Camera.requestCameraPermission();
      setCameraPermission(status);
      return status;
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      return 'denied';
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const status = await Camera.requestMicrophonePermission();
      setMicrophonePermission(status);
      return status;
    } catch (error) {
      console.error('Failed to request microphone permission:', error);
      return 'denied';
    }
  };

  const requestAllPermissions = async () => {
    const [camera, microphone] = await Promise.all([
      requestCameraPermission(),
      requestMicrophonePermission(),
    ]);
    
    return {
      camera,
      microphone,
      allGranted: camera === 'granted' && microphone === 'granted',
    };
  };

  const checkAllPermissions = async () => {
    const [camera, microphone] = await Promise.all([
      checkCameraPermission(),
      checkMicrophonePermission(),
    ]);
    
    return {
      camera,
      microphone,
      allGranted: camera === 'granted' && microphone === 'granted',
    };
  };


  return {
    cameraPermission,
    microphonePermission,
    requestCameraPermission,
    requestMicrophonePermission,
    requestAllPermissions,
    checkAllPermissions,
    hasAllPermissions: cameraPermission === 'granted' && microphonePermission === 'granted',
  };
};