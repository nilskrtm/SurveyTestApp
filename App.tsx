import React, { useEffect } from 'react';
import BootScreen from './src/screens/BootScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MMKVLoader, create } from 'react-native-mmkv-storage';
import DashboardNavigator from './src/navigator/DashboardNavigator';
import SurveyNavigator from './src//navigator/SurveyNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './src/redux/store';
import { Provider } from 'react-redux';
import DeviceControllerProvider from './src/provider/DeviceControllerProvider';
import VotingSyncProvider from './src/provider/VotingSyncProvider';
import { VotingRealmProvider } from './src/votings/VotingModels';

const App: () => React.JSX.Element = () => {
  const Stack = createNativeStackNavigator();

  useEffect(() => {
    console.log('[Lifecycle] Mount - App');

    return () => {
      console.log('[Lifecycle] Unmount - App');
    };
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <VotingRealmProvider>
          <DeviceControllerProvider />
          <VotingSyncProvider />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={'BootScreen'}
              screenOptions={{ animation: 'none', headerShown: false }}>
              <Stack.Screen name="BootScreen" component={BootScreen} />
              <Stack.Screen name="DashboardNavigator" component={DashboardNavigator} />
              <Stack.Screen name="SurveyNavigator" component={SurveyNavigator} />
            </Stack.Navigator>
          </NavigationContainer>
        </VotingRealmProvider>
      </Provider>
    </SafeAreaProvider>
  );
};

export const useStorage = create(new MMKVLoader().initialize());

export default App;
