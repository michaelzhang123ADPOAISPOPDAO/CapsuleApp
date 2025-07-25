import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';

import MainScreen from './src/screens/MainScreen';
import RecordingScreen from './src/screens/RecordingScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import PlaybackScreen from './src/screens/PlaybackScreen';
import StorageService from './src/services/StorageService';
import NotificationService from './src/services/NotificationService';

const Stack = createStackNavigator();

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize services
    const initializeApp = async () => {
      try {
        await StorageService.initializeStorage();
        await NotificationService.initialize();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        >
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen 
            name="Recording" 
            component={RecordingScreen}
            options={{
              gestureEnabled: false, // Disable swipe back during recording
            }}
          />
          <Stack.Screen 
            name="Review" 
            component={ReviewScreen}
            options={{
              gestureEnabled: false, // Disable swipe back during review
            }}
          />
          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="Playback" component={PlaybackScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
