import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import TimeUtil from '../util/TimeUtil';
import { StackActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import DeviceControllerUtil from '../util/DeviceControllerUtil';
import { storage } from '../../App';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import { useAppDispatch } from '../redux/hooks';
import { setIsSurveyTestMode } from '../redux/generalSlice';
import VotingSyncQueue from '../votings/VotingSyncQueue';
import { Survey } from '../data/types/survey.types.ts';
import { AnswerPicturePaths } from '../data/types/answer.picture.types.ts';

const BootScreen: () => React.JSX.Element = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [currentStep, setCurrentStep] = useState<string>('');
  const [warning, setWarning] = useState<string>('');

  const [kioskPin] = useMMKVStorage<string>('kiosk_pin', storage, '');
  const [autoSync] = useMMKVStorage<boolean>('auto_sync', storage, false);
  const [syncPeriod] = useMMKVStorage<string>('sync_period', storage, '60');
  const [selectedSurvey] = useMMKVStorage<Survey | undefined>(
    'selected_survey',
    storage,
    undefined
  );
  const [selectedSurveyValid] = useMMKVStorage<boolean>('selected_survey_valid', storage, false);
  const [answerPicturePaths] = useMMKVStorage<AnswerPicturePaths>(
    'answer_picture_paths',
    storage,
    {}
  );

  useEffect(() => {
    console.log('[Lifecycle] Mount - BootScreen');

    DeviceControllerUtil.startLockTask();

    const openDashboard = () => {
      navigation.dispatch(StackActions.replace('DashboardNavigator'));
    };

    const initialize = async () => {
      setCurrentStep('Einstellungen werden geladen ...');
      await TimeUtil.sleep(1000);

      setCurrentStep('Aktuelle Umfrage wird geprüft ...');
      await TimeUtil.sleep(1000);

      if (!selectedSurveyValid || !selectedSurvey || Object.keys(answerPicturePaths).length === 0) {
        setWarning('Derzeit ist keine Umfrage ausgewählt.');
        await TimeUtil.sleep(3000);
        openDashboard();

        return;
      }

      if (selectedSurvey.draft) {
        setWarning('Die gewählte Umfrage ist noch im Entwurf.');
        await TimeUtil.sleep(3000);
        openDashboard();

        return;
      }

      setCurrentStep('Die Kiosk-Modus Einstellungen werden überprüft ...');
      await TimeUtil.sleep(1000);

      if (!kioskPin) {
        setWarning('Es ist keine Kiosk-Modus Pin eingerichtet.');
        await TimeUtil.sleep(3000);
        openDashboard();

        return;
      }

      setCurrentStep('Der Umfrage-Modus wird gestartet ...');
      await TimeUtil.sleep(1000);

      if (autoSync) {
        VotingSyncQueue.getInstance().startSyncInterval(parseInt(syncPeriod, 10) * 60 * 1000);
      }

      dispatch(setIsSurveyTestMode(false));
      navigation.dispatch(StackActions.replace('SurveyNavigator'));
    };

    initialize().then();

    return () => {
      console.log('[Lifecycle] Unmount - BootScreen');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      DeviceControllerUtil.startLockTask();
    }, [])
  );

  return (
    <View style={styles.container}>
      {!warning ? (
        <>
          <ActivityIndicator style={styles.spinner} size="large" color="#6404ec" />
          <Text style={styles.loadingText}>App wird gestartet ...</Text>
          <Text style={styles.currentStepText}>{currentStep}</Text>
        </>
      ) : (
        <>
          <IonIcons name="information-circle-outline" size={40} color="#6404ec" />
          <Text style={styles.loadingTextWarning}>
            Der Umfrage-Modus kann nicht gestartet werden!
          </Text>
          <Text style={styles.currentStepText}>{warning}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  spinner: {
    padding: 10
  },
  loadingText: {
    fontWeight: 'bold',
    padding: 5,
    color: '#000000'
  },
  loadingTextWarning: {
    padding: 5,
    color: '#6404ec',
    fontWeight: 'bold'
  },
  currentStepText: {
    padding: 5,
    color: '#000000'
  }
});

export default BootScreen;
