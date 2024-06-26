import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChooseSurveyScreen from '../screens/dashboard/choose-survey/ChooseSurveyScreen';
import ChooseSurveySubmitScreen from '../screens/dashboard/choose-survey/ChooseSurveySubmitScreen';
import { APIPaging } from '../data/types/common.types.ts';

export type ChooseSurveyNavigatorParamList = {
  ChooseSurveyScreen:
    | {
        usePagingOptions?: APIPaging;
      }
    | undefined;
  ChooseSurveySubmitScreen: {
    surveyId: string;
    lastPagingOptions?: APIPaging;
  };
};

const ChooseSurveyNavigator: () => React.JSX.Element = () => {
  const Stack = createNativeStackNavigator<ChooseSurveyNavigatorParamList>();
  // const navigation = useNavigation();

  useEffect(() => {
    console.log('[Lifecycle] Mount - ChooseSurveyNavigator');

    return () => {
      console.log('[Lifecycle] Unmount - ChooseSurveyNavigator');
    };
  }, []);

  /*
  useFocusEffect(
    React.useCallback(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 2,
          routes: [
            {
              name: 'ChooseSurveyScreen',
            },
          ],
        }),
      );
    }, [navigation]),
  );
   */

  return (
    <Stack.Navigator
      initialRouteName={'ChooseSurveyScreen'}
      screenOptions={{
        animation: 'none',
        headerShown: false
      }}>
      <Stack.Screen name="ChooseSurveyScreen" component={ChooseSurveyScreen} />
      <Stack.Screen name="ChooseSurveySubmitScreen" component={ChooseSurveySubmitScreen} />
    </Stack.Navigator>
  );
};

export default ChooseSurveyNavigator;
