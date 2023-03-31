import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SurveyStartScreen from '../screens/survey/SurveyStartScreen';
import SurveyQuestionScreen from '../screens/survey/SurveyQuestionScreen';
import SurveyEndScreen from '../screens/survey/SurveyEndScreen';
import DeviceControllerUtil from '../util/DeviceControllerUtil';

function SurveyNavigator(): JSX.Element {
  const Stack = createNativeStackNavigator();

  useEffect(() => {
    console.log('[Lifecycle] Mount - SurveyNavigator');

    DeviceControllerUtil.startLockTask();

    return () => {
      console.log('[Lifecycle] Unmount - SurveyNavigator');
    };
  }, []);

  return (
    <Stack.Navigator
      initialRouteName={'SurveyStartScreen'}
      screenOptions={{
        animation: 'none',
        headerShown: false,
      }}>
      <Stack.Screen name="SurveyStartScreen" component={SurveyStartScreen} />
      <Stack.Screen
        name="SurveyQuestionScreen"
        component={SurveyQuestionScreen}
      />
      <Stack.Screen name="SurveyEndScreen" component={SurveyEndScreen} />
    </Stack.Navigator>
  );
}

export default SurveyNavigator;
