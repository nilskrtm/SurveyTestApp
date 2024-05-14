import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Animated,
  InteractionManager
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import SurveyOverlay from '../../views/SurveyOverlayView';
import { storage } from '../../../App';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import VotingSyncQueue from '../../votings/VotingSyncQueue';

function SurveyStartScreen(): React.JSX.Element {
  const navigation = useNavigation();

  const [selectedSurvey] = useMMKVStorage<any>('selected_survey', storage, {});

  const fadeSpacerAnimation = useRef<Animated.Value>(new Animated.Value(0)).current;
  const fadeViewAnimation = useRef<Animated.Value>(new Animated.Value(0)).current;

  const [startClicked, setStartClicked] = useState<boolean>(false);

  const fadeInSpacer = () => {
    Animated.timing(fadeSpacerAnimation, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true
    }).start(() => {
      fadeOutSpacer();
    });
  };

  const fadeOutSpacer = () => {
    Animated.timing(fadeSpacerAnimation, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true
    }).start(() => {
      fadeInSpacer();
    });
  };

  const onStart = () => {
    if (startClicked) {
      return;
    }

    setStartClicked(true);

    Animated.timing(fadeViewAnimation, {
      toValue: 0,
      duration: 700,
      useNativeDriver: true
    }).start(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            {
              name: 'SurveyQuestionScreen'
            }
          ]
        })
      );
    });
  };

  useEffect(() => {
    console.log('[Lifecycle] Mount - SurveyStartScreen');

    InteractionManager.runAfterInteractions(() => {
      Animated.timing(fadeViewAnimation, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true
      }).start();
    });

    return () => {
      console.log('[Lifecycle] Unmount - SurveyStartScreen');
    };
  }, [fadeViewAnimation]);

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <TouchableHighlight
          style={styles.overlay}
          activeOpacity={1}
          underlayColor="transparent"
          disabled={startClicked}
          onPress={onStart}>
          <View style={styles.overlay} />
        </TouchableHighlight>
      </View>
      <Animated.View style={[styles.contentContainer, { opacity: fadeViewAnimation }]}>
        <View style={styles.greetingTextContainer}>
          <Text style={styles.greetingText} adjustsFontSizeToFit={true} allowFontScaling={true}>
            {selectedSurvey.greeting}
          </Text>
        </View>
        <View style={styles.startTextContainer}>
          <Animated.Text
            style={[styles.startText, { opacity: fadeSpacerAnimation }]}
            adjustsFontSizeToFit={true}
            allowFontScaling={true}
            onLayout={fadeInSpacer}>
            Zum Starten Tippen
          </Animated.Text>
        </View>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 999,
    backgroundColor: 'transparent'
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff'
  },
  greetingTextContainer: {
    width: '100%',
    height: '80%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  startTextContainer: {
    width: '100%',
    height: '20%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  greetingText: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 90, // used as max font size
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  startText: {
    color: '#505050',
    fontWeight: '400',
    fontSize: 30, // used as max font size
    textAlign: 'center',
    textAlignVertical: 'center'
  }
});

export default SurveyStartScreen;
