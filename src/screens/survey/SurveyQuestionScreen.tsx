import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableHighlight, Image, Easing } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import SurveyOverlay from '../../views/SurveyOverlayView';
import { storage } from '../../../App';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import FileUtil from '../../util/FileUtil';
import VotingSyncQueue from '../../votings/VotingSyncQueue';

function SurveyQuestionScreen(): React.JSX.Element {
  const navigation = useNavigation();

  const fadeViewAnimation = useRef(new Animated.Value(0)).current;
  const progressViewAnimation = useRef(new Animated.Value(0)).current;

  const [selectedSurvey] = useMMKVStorage<any>('selected_survey', storage, {});
  const [answerPicturePaths] = useMMKVStorage<any>('answer_picture_paths', storage, {});

  const [question, setQuestion] = useState<any>({});
  const [questionLoaded, setQuestionLoaded] = useState<boolean>(false);
  const [questionReady, setQuestionReady] = useState<boolean>(false);
  const [questionTimer, setQuestionTimer] = useState<any>(null);

  const [currentVoting, setCurrentVoting] = useState<any>({});

  const displayQuestion = (order: number) => {
    stopTimer();
    setQuestionReady(false);
    progressViewAnimation.setValue(1);

    if (order === 1) {
      setQuestion(getQuestion(order));
      setQuestionLoaded(true);

      Animated.timing(fadeViewAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }).start(() => questionDisplayed(order));
    } else {
      Animated.timing(fadeViewAnimation, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      }).start(() => {
        if (question.order < selectedSurvey.questions.length) {
          setQuestion(getQuestion(order));

          Animated.timing(fadeViewAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true
          }).start(() => questionDisplayed(order));
        } else {
          stopTimer();

          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                {
                  name: 'SurveyEndScreen',
                  params: {
                    voting: {
                      ...currentVoting,
                      ...{ date: new Date().toISOString() }
                    }
                  }
                }
              ]
            })
          );
        }
      });
    }
  };

  const questionDisplayed = (order: number) => {
    const foundQuestionObject = getQuestion(order);

    if (foundQuestionObject.timeout > 0) {
      startTimer(foundQuestionObject.timeout);
    }

    setQuestionReady(true);
  };

  const startTimer = (timeout: number) => {
    stopTimer();

    setQuestionTimer(
      setTimeout(() => {
        abortSurvey();
      }, timeout * 1000)
    );

    progressViewAnimation.setValue(1);

    Animated.timing(progressViewAnimation, {
      toValue: 0,
      duration: timeout * 1000,
      easing: Easing.linear,
      useNativeDriver: false
    }).start();
  };

  const stopTimer = () => {
    if (questionTimer != null) {
      clearTimeout(questionTimer);
      setQuestionTimer(null);
    }

    progressViewAnimation.stopAnimation();
    progressViewAnimation.setValue(0);
  };

  const onClickAnswerOption = (answerOptionObject: any) => {
    const currentVotes = currentVoting.votes;
    let exists = false;

    for (const i in currentVotes) {
      if (currentVotes[i].question === question._id) {
        exists = true;

        break;
      }
    }

    if (!questionReady || !exists) {
      currentVotes.push({
        question: question._id,
        answerOption: answerOptionObject._id
      });

      setCurrentVoting({ ...currentVoting, ...{ votes: currentVotes } });
      displayQuestion(question.order + 1);
    }
  };

  const abortSurvey = () => {
    stopTimer();
    setQuestionReady(false);

    Animated.timing(fadeViewAnimation, {
      toValue: 0,
      duration: 600,
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
  };

  const getQuestion = (questionNumber: number) => {
    return selectedSurvey.questions.filter((questionObject: any) => {
      return questionObject.order === questionNumber;
    })[0];
  };

  const getImageURI = (answerOptionObject: any) => {
    return (
      'file://' +
      FileUtil.getMainPath() +
      '/' +
      answerPicturePaths[answerOptionObject.picture._id].path
    );
  };

  useEffect(() => {
    console.log('[Lifecycle] Mount - SurveyQuestionScreen');

    setCurrentVoting({
      votes: []
    });

    displayQuestion(1);

    return () => {
      stopTimer();

      console.log('[Lifecycle] Unmount - SurveyQuestionScreen');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentContainer, { opacity: fadeViewAnimation }]}>
        <View style={styles.questionTextContainer}>
          <Text style={styles.questionText} adjustsFontSizeToFit={true} allowFontScaling={true}>
            {questionLoaded ? question.question : ''}
          </Text>
        </View>
        <View style={styles.answerPictureContainer}>
          {questionLoaded
            ? question.answerOptions.map((answerOptionObject: any, index: number) => {
                return (
                  <TouchableHighlight
                    style={styles.answerPictureHolder}
                    key={answerOptionObject._id + ' ' + index}
                    disabled={
                      !questionReady ||
                      currentVoting.votes.filter((answer: any) => answer.question === question._id)
                        .length !== 0
                    }
                    onPress={() => onClickAnswerOption(answerOptionObject)}
                    underlayColor="transparent">
                    <Image
                      style={styles.answerPicture}
                      resizeMode="contain"
                      source={{
                        uri: getImageURI(answerOptionObject)
                      }}
                    />
                  </TouchableHighlight>
                );
              })
            : null}
        </View>
        <View style={styles.actionsContainer}>
          <TouchableHighlight
            onPress={() => abortSurvey()}
            underlayColor="transparent"
            activeOpacity={0.6}>
            <Text style={styles.actionBarText}>Abbrechen</Text>
          </TouchableHighlight>
          <Text style={styles.actionBarText}>
            Frage {question.order} von {selectedSurvey.questions.length}
          </Text>
        </View>
      </Animated.View>
      <Animated.View
        style={[
          styles.overlayStyles,
          {
            width: progressViewAnimation.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: ['0%', '25%', '50%', '75%', '100%']
            })
          }
        ]}
      />
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
    justifyContent: 'flex-end',
    backgroundColor: '#ffffff'
  },
  overlayStyles: {
    position: 'absolute',
    height: 5,
    bottom: 0,
    left: 0,
    zIndex: 999,
    backgroundColor: '#000000'
  },
  contentContainer: {
    width: '90%',
    height: '95%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  questionTextContainer: {
    width: '100%',
    height: '60%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  questionText: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 90, // used as max font size
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  answerPictureContainer: {
    width: '100%',
    height: '30%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15
  },
  answerPictureHolder: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10
  },
  answerPicture: {
    flex: 1,
    maxWidth: '100%',
    maxHeight: '100%',
    width: undefined,
    height: undefined,
    aspectRatio: 1
  },
  actionsContainer: {
    width: '100%',
    height: '10%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  actionBarText: {
    fontSize: 22
  }
});

export default SurveyQuestionScreen;
