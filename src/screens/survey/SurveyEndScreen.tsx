import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, InteractionManager } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import SurveyOverlay from '../../views/SurveyOverlayView';
import { useAppSelector } from '../../redux/hooks';
import { selectIsSurveyTestMode } from '../../redux/generalSlice';
import { storage } from '../../../App';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import VotingSyncQueue from '../../votings/VotingSyncQueue';

const SurveyEndScreen: () => React.JSX.Element = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const testMode: boolean = useAppSelector(selectIsSurveyTestMode);

  const fadeViewAnimation = useRef(new Animated.Value(0)).current;

  const [autoSync] = useMMKVStorage<boolean>('auto_sync', storage, false);
  const [selectedSurvey] = useMMKVStorage<any>('selected_survey', storage, {});

  const saveAnswerSet = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const voting = route.params.voting;
    const startDate = new Date(selectedSurvey.startDate).getTime();
    const endDate = new Date(selectedSurvey.endDate).getTime();
    const currentDate = new Date().getTime();

    if (startDate > currentDate || endDate < currentDate) {
      return;
    }

    voting.date = new Date(voting.date);

    VotingSyncQueue.getInstance().addVoting(selectedSurvey._id, voting, autoSync);
  };

  useEffect(() => {
    console.log('[Lifecycle] Mount - SurveyEndScreen');

    InteractionManager.runAfterInteractions(() => {
      Animated.timing(fadeViewAnimation, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true
      }).start(() => {
        if (!testMode) {
          saveAnswerSet();
        }

        Animated.timing(fadeViewAnimation, {
          toValue: 0,
          duration: 750,
          delay: 1500,
          useNativeDriver: true
        }).start(() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                {
                  name: 'SurveyStartScreen'
                }
              ]
            })
          );
        });
      });
    });

    return () => {
      console.log('[Lifecycle] Unmount - SurveyEndScreen');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentContainer, { opacity: fadeViewAnimation }]}>
        <Text style={styles.endText} adjustsFontSizeToFit={true} allowFontScaling={true}>
          Vielen Dank!
        </Text>
      </Animated.View>
      <SurveyOverlay
        onPinSuccess={() => {
          VotingSyncQueue.getInstance().stopSyncInterval();
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'DashboardNavigator',
                  state: {
                    routes: [{ name: 'OverviewScreen' }]
                  }
                }
              ]
            })
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  contentContainer: {
    width: '90%',
    height: '90%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  endText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 90, // used as max font size
    textAlign: 'center',
    textAlignVertical: 'center'
  }
});

export default SurveyEndScreen;
