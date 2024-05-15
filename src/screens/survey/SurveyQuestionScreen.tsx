import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableHighlight, Image, Easing } from 'react-native';
import { CommonActions, CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import SurveyOverlay from '../../views/SurveyOverlayView';
import { AppNavigatorParamList, storage } from '../../../App';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import FileUtil from '../../util/FileUtil';
import VotingSyncQueue from '../../votings/VotingSyncQueue';
import { Survey } from '../../data/types/survey.types.ts';
import { Question } from '../../data/types/question.types.ts';
import { AnswerPicturePaths } from '../../data/types/answer.picture.types.ts';
import { AnswerOption } from '../../data/types/answer.option.types.ts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SurveyNavigatorParamList } from '../../navigator/SurveyNavigator.tsx';
import { Voting } from '../../data/types/voting.types.ts';

type SurveyQuestionScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SurveyNavigatorParamList, 'SurveyQuestionScreen'>,
  NativeStackNavigationProp<AppNavigatorParamList>
>;

const SurveyQuestionScreen: () => React.JSX.Element = () => {
  const navigation = useNavigation<SurveyQuestionScreenNavigationProp>();

  const fadeViewAnimation = useRef(new Animated.Value(0)).current;
  const progressViewAnimation = useRef(new Animated.Value(0)).current;

  const [selectedSurvey] = useMMKVStorage<Survey>('selected_survey', storage, {} as Survey);
  const [answerPicturePaths] = useMMKVStorage<AnswerPicturePaths>(
    'answer_picture_paths',
    storage,
    {}
  );

  const [question, setQuestion] = useState<Question | undefined>(undefined);
  const [questionLoaded, setQuestionLoaded] = useState<boolean>(false);
  const [questionReady, setQuestionReady] = useState<boolean>(false);
  const [questionTimer, setQuestionTimer] = useState<ReturnType<typeof setTimeout>>();

  const [currentVoting, setCurrentVoting] = useState<Voting>({
    _id: '',
    survey: '',
    date: '',
    votes: []
  });

  const displayQuestion: (order: number) => void = (order) => {
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
        if (!question || question.order < selectedSurvey.questions.length) {
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

  const questionDisplayed: (order: number) => void = (order) => {
    const foundQuestionObject = getQuestion(order);

    if (foundQuestionObject.timeout > 0) {
      startTimer(foundQuestionObject.timeout);
    }

    setQuestionReady(true);
  };

  const startTimer: (timeout: number) => void = (timeout) => {
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
    if (questionTimer) {
      clearTimeout(questionTimer);
      setQuestionTimer(undefined);
    }

    progressViewAnimation.stopAnimation();
    progressViewAnimation.setValue(0);
  };

  const onClickAnswerOption: (answerOption: AnswerOption) => void = (answerOptionObject) => {
    if (!question) return;

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

  const getQuestion: (questionNumber: number) => Question = (questionNumber) => {
    return selectedSurvey.questions.filter((questionObj) => {
      return questionObj.order === questionNumber;
    })[0];
  };

  const getImageURI: (answerOption: AnswerOption) => string = (answerOption) => {
    return (
      'file://' + FileUtil.getMainPath() + '/' + answerPicturePaths[answerOption.picture._id].path
    );
  };

  useEffect(() => {
    console.log('[Lifecycle] Mount - SurveyQuestionScreen');

    setCurrentVoting({
      _id: '',
      survey: '',
      date: '',
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
      {question && (
        <>
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
                          currentVoting.votes.filter(
                            (answer: any) => answer.question === question._id
                          ).length !== 0
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
