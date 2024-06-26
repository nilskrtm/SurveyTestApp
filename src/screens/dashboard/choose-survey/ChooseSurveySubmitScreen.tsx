import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import {
  CommonActions,
  CompositeNavigationProp,
  CompositeScreenProps,
  useFocusEffect,
  useNavigation,
  useRoute
} from '@react-navigation/native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { AppNavigatorParamList, storage } from '../../../../App';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import DownloadSurveyJob, {
  DownloadSurveyJobSuccessPayload
} from '../../../jobs/DownloadSurveyJob';
import TimeUtil from '../../../util/TimeUtil';
import Dialog from 'react-native-dialog';
import VotingSyncQueue from '../../../votings/VotingSyncQueue';
import { Survey } from '../../../data/types/survey.types.ts';
import {
  AnswerPicture,
  AnswerPicturePaths,
  AnswerPictureUrls
} from '../../../data/types/answer.picture.types.ts';
import SurveyService from '../../../data/services/survey.service.ts';
import AnswerPictureService from '../../../data/services/answer.picture.service.ts';
import { APIResponse } from '../../../data/types/common.types.ts';
import { ChooseSurveyNavigatorParamList } from '../../../navigator/ChooseSurveyNavigator.tsx';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DashboardNavigatorParamList } from '../../../navigator/DashboardNavigator.tsx';

type ChooseSurveySubmitScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ChooseSurveyNavigatorParamList, 'ChooseSurveySubmitScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<DashboardNavigatorParamList, 'ChooseSurveyNavigator'>,
    NativeStackNavigationProp<AppNavigatorParamList>
  >
>;

type ChooseSurveySubmitScreenRouteProp = CompositeScreenProps<
  NativeStackScreenProps<ChooseSurveyNavigatorParamList, 'ChooseSurveySubmitScreen'>,
  CompositeScreenProps<
    BottomTabScreenProps<DashboardNavigatorParamList, 'ChooseSurveyNavigator'>,
    NativeStackScreenProps<AppNavigatorParamList>
  >
>;

type ChooseSurveySubmitScreenData = {
  loading: boolean;
  error: string;
  surveyId: string;
  survey?: Survey;
  isSelecting: boolean;
  selectText: string;
  selectErrorText: string;
};

const ChooseSurveySubmitScreen: () => React.JSX.Element = () => {
  const navigation = useNavigation<ChooseSurveySubmitScreenNavigationProp>();
  const route = useRoute<ChooseSurveySubmitScreenRouteProp['route']>();

  const [serverAddress] = useMMKVStorage<string>('server_address', storage, '');
  const [username] = useMMKVStorage<string>('username', storage, '');
  const [accessKey] = useMMKVStorage<string>('access_key', storage, '');
  const [, setSelectedSurvey] = useMMKVStorage<Survey | undefined>(
    'selected_survey',
    storage,
    undefined
  );
  const [, setSelectedSurveyValid] = useMMKVStorage<boolean>(
    'selected_survey_valid',
    storage,
    false
  );
  const [, setAnswerPicturePaths] = useMMKVStorage<AnswerPicturePaths>(
    'answer_picture_paths',
    storage,
    {}
  );

  const [state, setState] = useState<ChooseSurveySubmitScreenData>({
    loading: true,
    error: '',
    surveyId: route.params.surveyId,
    survey: undefined,
    isSelecting: false,
    selectText: '',
    selectErrorText: ''
  });
  const [selectSurveyDialogOpen, setSelectSurveyDialogOpen] = useState<boolean>(false);

  const hasWarning = !serverAddress || !username || !accessKey;

  const initialize = () => {
    const parentNavigator = navigation.getParent();

    if (parentNavigator) {
      parentNavigator.setOptions({ headerLeft: () => leftHeader() });
    }

    SurveyService.getSurvey(state.surveyId).then((response) => {
      if (response.success) {
        const survey = response.data.survey;
        const answerPictureUrls: AnswerPictureUrls = {};

        survey.questions.forEach((question) => {
          question.answerOptions.forEach((answerOption) => {
            if (!(answerOption.picture._id in answerPictureUrls)) {
              answerPictureUrls[answerOption.picture._id] = '';
            }
          });
        });

        const answerPictureUrlPromises: Array<
          Promise<APIResponse<{ answerPicture: AnswerPicture & { url: string } }>>
        > = new Array(Object.keys(answerPictureUrls).length);

        for (const i in Object.keys(answerPictureUrls)) {
          answerPictureUrlPromises[i] = AnswerPictureService.getAnswerPicture(
            Object.keys(answerPictureUrls)[i]
          );
        }

        Promise.all(answerPictureUrlPromises)
          .then((responses) => {
            for (const i in responses) {
              const answerPicture = responses[i].data.answerPicture;

              answerPictureUrls[answerPicture._id] = answerPicture.url;
            }

            survey.questions.forEach((question) => {
              question.answerOptions.forEach((answerOption) => {
                answerOption.picture.url = answerPictureUrls[answerOption.picture._id];
              });
            });

            setState({
              ...state,
              loading: false,
              survey: survey
            });
          })
          .catch((e) => {
            console.log(JSON.stringify(e));
            setState({
              ...state,
              loading: false,
              error: 'Fehler beim Laden der Umfrage!'
            });
          });
      } else {
        setState({
          ...state,
          loading: false,
          error: 'Fehler beim Laden der Umfrage!'
        });
      }
    });
  };

  const leftHeader: () => React.JSX.Element = () => {
    return (
      <TouchableHighlight activeOpacity={0.6} underlayColor="#6404ec" onPress={goBack}>
        <View
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 14
          }}>
          <IonIcons name="chevron-back-outline" size={28} color="#ffffff" />
        </View>
      </TouchableHighlight>
    );
  };

  const goBack = () => {
    abortSelecting();

    navigation.dispatch(
      CommonActions.reset({
        index: 2,
        routes: [
          {
            name: 'ChooseSurveyScreen',
            params: {
              usePagingOptions: route.params.lastPagingOptions
            }
          }
        ]
      })
    );
  };

  const selectSurvey = () => {
    VotingSyncQueue.getInstance().stop();

    setSelectSurveyDialogOpen(false);

    const downloadSurveyJob = new DownloadSurveyJob(state.surveyId);

    downloadSurveyJob.onStepStart((message: string) => {
      setState({
        ...state,
        selectText: message,
        isSelecting: true,
        selectErrorText: ''
      });
    });

    setState({
      ...state,
      isSelecting: true,
      selectText: 'Die Umfrage wird heruntergeladen...',
      selectErrorText: ''
    });

    downloadSurveyJob
      .start()
      .then((result) => {
        setState({
          ...state,
          isSelecting: false,
          selectText: 'Download beendet.',
          selectErrorText: ''
        });

        setSelectedSurveyValid(false);
        setSelectedSurvey((result as DownloadSurveyJobSuccessPayload).survey);
        setAnswerPicturePaths((result as DownloadSurveyJobSuccessPayload).answerPicturePaths);
        setSelectedSurveyValid(true);

        navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [
              {
                name: 'OverviewScreen'
              }
            ]
          })
        );
      })
      .catch((error) => {
        if ('message' in error && 'oldRecoverable' in error) {
          setState({
            ...state,
            isSelecting: false,
            selectErrorText: error.message
          });

          if (!error.oldRecoverable) {
            setSelectedSurveyValid(false);
            setSelectedSurvey(undefined);
          }
        } else {
          setState({
            ...state,
            isSelecting: false,
            selectErrorText: 'Fehler beim Auswählen der Umfrage!'
          });

          setSelectedSurveyValid(false);
          setSelectedSurvey(undefined);
        }
      });
  };

  const abortSelecting = () => {
    if (!state.isSelecting) {
      return;
    }

    // TODO: abort selecting
  };

  useEffect(() => {
    console.log('[Lifecycle] Mount - ChooseSurveySubmitScreen');

    initialize();

    return () => {
      console.log('[Lifecycle] Unmount - ChooseSurveySubmitScreen');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, route.params]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        goBack();

        return true;
      };
      const customBackHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => customBackHandler.remove();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <View style={styles.container}>
      {hasWarning && (
        <View style={styles.warningContainer}>
          <IonIcons name="warning" size={20} color="#ef4444" />
          <Text style={styles.warningText}>
            Die Einstellungen für die Server-Verbindung sind nicht vollständig.
          </Text>
        </View>
      )}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Umfrage auswählen</Text>
      </View>
      {!state.loading && !state.error && state.survey && (
        <>
          <View style={styles.surveyInfoContainer}>
            <View style={styles.surveyInfoLeftContainer}>
              <Text style={styles.largeText} numberOfLines={1}>
                {state.survey.name}
              </Text>
              <Text style={styles.normalText} numberOfLines={1}>
                {state.survey.description}
              </Text>
            </View>
            <View style={styles.surveyInfoRightContainer}>
              <View style={styles.surveyInfoKeyContainer}>
                <Text style={styles.infoKeyText} numberOfLines={1}>
                  Startdatum:
                </Text>
                <Text style={styles.infoKeyText} numberOfLines={1}>
                  Enddatum:
                </Text>
              </View>
              <View style={styles.surveyInfoValueContainer}>
                <Text style={styles.infoValueText} numberOfLines={1}>
                  {TimeUtil.getDateAsString(new Date(state.survey.startDate))}
                </Text>
                <Text style={styles.infoValueText} numberOfLines={1}>
                  {TimeUtil.getDateAsString(new Date(state.survey.endDate))}
                </Text>
              </View>
              <View style={styles.surveyBadgeContainer}>
                {state.survey.draft && (
                  <View style={[styles.badge, { backgroundColor: '#6404ec' }]}>
                    <Text style={styles.badgeText}>Entwurf</Text>
                  </View>
                )}
                {!state.survey.draft &&
                  new Date(state.survey.startDate).getTime() > new Date().getTime() && (
                    <View style={[styles.badge, { backgroundColor: 'rgb(74 222 128)' }]}>
                      <Text style={styles.badgeText}>Bereit</Text>
                    </View>
                  )}
                {!state.survey.draft &&
                  new Date(state.survey.startDate).getTime() <= new Date().getTime() &&
                  new Date(state.survey.endDate).getTime() > new Date().getTime() && (
                    <View style={[styles.badge, { backgroundColor: 'rgb(74 222 128)' }]}>
                      <Text style={styles.badgeText}>Aktiv</Text>
                    </View>
                  )}
                {!state.survey.draft &&
                  new Date(state.survey.endDate).getTime() < new Date().getTime() && (
                    <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
                      <Text style={styles.badgeText}>Beendet</Text>
                    </View>
                  )}
                {state.survey.archived && (
                  <View style={[styles.badge, { backgroundColor: 'rgb(251 146 60)' }]}>
                    <Text style={styles.badgeText}>Archiv</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText} numberOfLines={1}>
              Vorschau
            </Text>
            <Text style={styles.headerText} numberOfLines={1}>
              {state.survey.questions.length}{' '}
              {state.survey.questions.length === 1 ? 'Frage' : 'Fragen'}
            </Text>
          </View>
          <ScrollView style={styles.scrollView}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText} numberOfLines={1}>
                <Text style={[styles.greetingTextKey]}>Begrüßung: </Text>
                {state.survey.greeting}
              </Text>
            </View>
            {state.survey.questions.map((question, index: number) => (
              <View key={'question' + question._id} style={styles.questionContainer}>
                <Text style={styles.question} numberOfLines={1}>
                  <Text style={{ fontWeight: '500' }}>Frage {index + 1} - </Text>
                  {question.question}
                </Text>
                <Text style={styles.questionMeta} numberOfLines={1}>
                  <Text style={{ fontWeight: '500' }}>Zeitbegrenzung: </Text>
                  {question.timeout === 0 ? 'keine' : question.timeout + ' Sekunden'}
                  {'        '}
                  <Text style={{ fontWeight: '500' }}>Antwortmöglichkeiten: </Text>
                  {question.answerOptions.length}
                </Text>
                {question.answerOptions.length > 0 && (
                  <View style={styles.answerOptionsContainer}>
                    {question.answerOptions.map((answerOptionObject, answerOptionIndex: number) => {
                      if (answerOptionObject.picture.url) {
                        return (
                          <Image
                            key={answerOptionObject._id + '-' + answerOptionIndex}
                            style={styles.answerPicture}
                            resizeMode="contain"
                            source={{
                              uri: answerOptionObject.picture.url
                            }}
                          />
                        );
                      }
                    })}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.selectContainer}>
            <View style={styles.selectInfoBox}>
              {state.isSelecting && <ActivityIndicator size="small" color="#6404ec" />}
              {!state.selectErrorText ? (
                <Text style={styles.selectInfoText} numberOfLines={1}>
                  {state.selectText}
                </Text>
              ) : (
                <Text style={styles.selectErrorText} numberOfLines={1}>
                  {state.selectErrorText}
                </Text>
              )}
            </View>
            <TouchableHighlight
              activeOpacity={0.6}
              underlayColor="#ffffff"
              onPress={() => setSelectSurveyDialogOpen(true)}
              disabled={state.isSelecting}>
              <View style={styles.selectButtonBox}>
                <IonIcons
                  name="checkmark-circle-outline"
                  size={26}
                  color={!state.isSelecting ? '#6404ec' : '#505050'}
                />
                <Text
                  style={[
                    styles.selectText,
                    { color: !state.isSelecting ? '#6404ec' : '#505050' }
                  ]}>
                  Auswählen
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        </>
      )}
      {state.loading && !state.error && (
        <View style={styles.infoErrorView}>
          <ActivityIndicator style={styles.spinner} size="large" color="#6404ec" />
          <Text style={styles.loadingText}>Umfrage wird geladen ...</Text>
        </View>
      )}
      {!state.loading && state.error && (
        <View style={styles.infoErrorView}>
          <IonIcons name="information-circle-outline" size={40} color="#ef4444" />
          <Text style={styles.errorText}>{state.error}</Text>
        </View>
      )}
      <Dialog.Container
        visible={selectSurveyDialogOpen}
        onBackdropPress={undefined}
        onRequestClose={undefined}>
        <Dialog.Title>Umfrage auswählen</Dialog.Title>
        <Dialog.Description>
          Möchten Sie die Umfrage wirklich auswählen?{'\n\n\n'}
          <Text style={{ color: '#ef4444' }}>
            Nicht synchronisierte Abstimmungen gehen verloren!
          </Text>
        </Dialog.Description>
        <Dialog.Button color="#ef4444" label="Bestätigen" onPress={() => selectSurvey()} />
        <Dialog.Button
          color="#6404ec"
          label="Abbrechen"
          onPress={() => setSelectSurveyDialogOpen(false)}
        />
      </Dialog.Container>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  warningContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#ffffff'
  },
  warningText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '400'
  },
  headerContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerText: {
    marginHorizontal: 20,
    paddingVertical: 10,
    fontWeight: '600',
    fontSize: 14,
    color: '#6404ec',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  infoErrorView: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    padding: 10
  },
  loadingText: {
    fontWeight: 'bold',
    padding: 5,
    color: '#000000'
  },
  errorText: {
    padding: 5,
    color: '#ef4444',
    fontWeight: 'bold'
  },
  surveyInfoContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff'
  },
  surveyInfoLeftContainer: {
    width: '70%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingRight: 5
  },
  surveyInfoRightContainer: {
    width: '30%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 5
  },
  largeText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000000'
  },
  normalText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#616161'
  },
  surveyBadgeContainer: {
    height: '100%',
    width: 70,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 4
  },
  badge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '600'
  },
  surveyInfoKeyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  surveyInfoValueContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginRight: 20
  },
  infoKeyText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '500'
  },
  infoValueText: {
    color: '#000000',
    fontSize: 15
  },
  scrollView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  greetingContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff'
  },
  greetingText: {
    marginHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
    color: '#000000'
  },
  greetingTextKey: {
    marginHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '500',
    color: '#000000'
  },
  questionContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e3e3e3'
  },
  question: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000'
  },
  questionMeta: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000'
  },
  answerOptionsContainer: {
    width: '100%',
    maxHeight: 140,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 10
  },
  answerPicture: {
    flex: 1,
    maxWidth: '100%',
    maxHeight: '100%',
    width: undefined,
    height: undefined,
    aspectRatio: 1
  },
  selectContainer: {
    width: '100%',
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderColor: '#e3e3e3',
    borderTopWidth: 1
  },
  selectInfoBox: {
    height: '100%',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 20
  },
  selectInfoText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6404ec'
  },
  selectErrorText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#ef4444'
  },
  selectButtonBox: {
    height: '100%',
    width: 300,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 20,
    borderLeftWidth: 1,
    borderColor: '#e3e3e3'
  },
  selectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6404ec'
  }
});

export default ChooseSurveySubmitScreen;
