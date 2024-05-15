import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableHighlight, StyleSheet } from 'react-native';
import Dialog from 'react-native-dialog';
import { storage } from '../../App';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../redux/hooks';
import { selectIsVotingsSyncing, selectIsSurveyTestMode } from '../redux/generalSlice';

type SurveyOverlayProps = {
  onPinSuccess: () => void;
};

const SurveyOverlay: (props: SurveyOverlayProps) => React.JSX.Element = (props) => {
  const [pinText, setPinText] = useState<string>('');
  const [pinDialogOpen, setPinDialogOpen] = useState<boolean>(false);
  const [pinDialogTimer, setPinDialogTimer] = useState<ReturnType<typeof setTimeout>>();

  const [kioskPin] = useMMKVStorage<string>('kiosk_pin', storage, '');
  const [selectedSurvey] = useMMKVStorage<any>('selected_survey', storage, {});
  const [selectedSurveyValid] = useMMKVStorage<boolean>('selected_survey_valid', storage, false);

  const testMode: boolean = useAppSelector(selectIsSurveyTestMode);
  const syncing: boolean = useAppSelector(selectIsVotingsSyncing);

  const infoMessage = () => {
    if (testMode) {
      return 'Testmodus';
    }

    if (selectedSurveyValid) {
      const currentDate = new Date().getTime();
      const startDate = new Date(selectedSurvey.startDate).getTime();
      const endDate = new Date(selectedSurvey.endDate).getTime();

      if (currentDate < startDate) {
        return 'Zeitraum der Umfrage noch nicht gestartet';
      }
      if (currentDate > endDate) {
        return 'Zeitraum der Umfrage bereits beendet';
      }
    }

    return '';
  };

  const openPinDialog = () => {
    setPinText('');
    setPinDialogOpen(true);

    clearTimeout(pinDialogTimer);

    setPinDialogTimer(
      setTimeout(() => {
        closePinDialog();
      }, 10000)
    );
  };

  const closePinDialog = () => {
    if (pinDialogTimer) {
      clearTimeout(pinDialogTimer);
      setPinDialogTimer(undefined);
    }

    setPinDialogOpen(false);
  };

  const enterPin = () => {
    setPinDialogOpen(false);

    if (pinText.localeCompare(kioskPin) === 0) {
      if (pinDialogTimer) {
        clearTimeout(pinDialogTimer);
        setPinDialogTimer(undefined);

        props.onPinSuccess();
      }
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(pinDialogTimer);
    };
  }, [pinDialogTimer]);

  return (
    <>
      <View style={styles.infoContainer}>
        {infoMessage() ? (
          <View style={styles.infoWrapper}>
            <IonIcons
              name="information-circle-outline"
              size={20}
              color="#ef4444"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Antworten werden nicht gespeichert
              {' (' + infoMessage() + ')'}
            </Text>
          </View>
        ) : (
          syncing && <ActivityIndicator size="small" color="#6404ec" />
        )}
      </View>
      <View style={styles.hiddenButtonContainer}>
        <TouchableHighlight
          style={styles.hiddenButton}
          onPress={openPinDialog}
          underlayColor="transparent">
          <View />
        </TouchableHighlight>
      </View>
      <Dialog.Container
        visible={pinDialogOpen}
        onBackdropPress={closePinDialog}
        onRequestClose={closePinDialog}
        verticalButtons={false}>
        <Dialog.Title>Kiosk-Modus beenden</Dialog.Title>
        <Dialog.Input
          keyboardType="numeric"
          maxLength={10}
          value={pinText}
          onChangeText={(text) => setPinText(text)}
        />
        <Dialog.Button color="#6404ec" label="Abbruch" onPress={closePinDialog} />
        <Dialog.Button color="#6404ec" label="Bestätigen" onPress={enterPin} />
      </Dialog.Container>
    </>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    position: 'absolute',
    left: 0,
    top: 0
  },
  infoWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingLeft: 5,
    paddingTop: 3
  },
  infoIcon: {
    paddingTop: 1.5
  },
  infoText: {
    fontSize: 16,
    color: '#ef4444',
    zIndex: 1
  },
  hiddenButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 999999,
    width: 30,
    height: 30,
    color: 'transparent'
  },
  hiddenButton: {
    width: 30,
    height: 30,
    color: 'transparent'
  }
});

export default SurveyOverlay;
