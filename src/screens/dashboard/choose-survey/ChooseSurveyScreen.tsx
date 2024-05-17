import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { AppNavigatorParamList, storage } from '../../../../App';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import TimeUtil from '../../../util/TimeUtil';
import {
  CommonActions,
  CompositeNavigationProp,
  CompositeScreenProps,
  useNavigation,
  useRoute
} from '@react-navigation/native';
import { APIPaging } from '../../../data/types/common.types.ts';
import { Survey } from '../../../data/types/survey.types.ts';
import SurveyService from '../../../data/services/survey.service.ts';
import { ChooseSurveyNavigatorParamList } from '../../../navigator/ChooseSurveyNavigator.tsx';
import { DashboardNavigatorParamList } from '../../../navigator/DashboardNavigator.tsx';
import { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

type ChooseSurveyScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ChooseSurveyNavigatorParamList, 'ChooseSurveyScreen'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<DashboardNavigatorParamList, 'ChooseSurveyNavigator'>,
    NativeStackNavigationProp<AppNavigatorParamList>
  >
>;

type ChooseSurveyScreenRouteProp = CompositeScreenProps<
  NativeStackScreenProps<ChooseSurveyNavigatorParamList, 'ChooseSurveyScreen'>,
  CompositeScreenProps<
    BottomTabScreenProps<DashboardNavigatorParamList, 'ChooseSurveyNavigator'>,
    NativeStackScreenProps<AppNavigatorParamList, 'DashboardNavigator'>
  >
>;

const ChooseSurveyScreen: () => React.JSX.Element = () => {
  const navigation = useNavigation<ChooseSurveyScreenNavigationProp>();
  const route = useRoute<ChooseSurveyScreenRouteProp['route']>();

  const [serverAddress] = useMMKVStorage<string>('server_address', storage, '');
  const [username] = useMMKVStorage<string>('username', storage, '');
  const [accessKey] = useMMKVStorage<string>('access_key', storage, '');

  const [loader, setLoader] = useState<{ loading: boolean; error: string }>({
    loading: false,
    error: ''
  });
  const [pagingOptions, setPagingOptions] = useState<APIPaging>({
    perPage: 0,
    page: 1,
    lastPage: 1,
    count: 0
  });

  const [surveys, setSurveys] = useState<Array<Survey>>([]);

  const hasWarning = !serverAddress || !username || !accessKey;

  const loadSurveys: (newPagingOptions: APIPaging) => void = useCallback<
    (newPagingOptions: APIPaging) => void
  >((newPagingOptions) => {
    setLoader({ loading: true, error: '' });

    SurveyService.getSurveys(newPagingOptions.page, 10).then((response) => {
      if (response.success) {
        setLoader({ loading: false, error: '' });
        setPagingOptions(response.data.paging);
        setSurveys(response.data.surveys);
      } else {
        console.log(response.error);
        setLoader({ loading: false, error: 'Fehler beim Laden der Umfragen!' });
      }
    });
  }, []);

  const selectSurvey: (surveyId: string) => void = (surveyId) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 2,
        routes: [
          {
            name: 'ChooseSurveySubmitScreen',
            params: {
              surveyId: surveyId,
              lastPagingOptions: pagingOptions
            }
          }
        ]
      })
    );
  };

  useEffect(() => {
    console.log('[Lifecycle] Mount - ChooseSurveyScreen');

    const parentNavigator = navigation.getParent();

    if (parentNavigator) {
      parentNavigator.setOptions({ headerLeft: undefined });
    }

    loadSurveys(route.params?.usePagingOptions || pagingOptions);

    return () => {
      console.log('[Lifecycle] Unmount - ChooseSurveyScreen');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSurveys]);

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
        <TouchableHighlight
          style={styles.reloadButton}
          activeOpacity={0.6}
          underlayColor="#e3e3e3"
          onPress={() => loadSurveys(pagingOptions)}
          disabled={loader.loading}>
          <IonIcons
            name="reload-circle-outline"
            size={30}
            color={!loader.loading ? '#6404ec' : '#505050'}
          />
        </TouchableHighlight>
      </View>
      {!loader.loading && !loader.error && surveys.length > 0 && (
        <>
          <ScrollView style={styles.scrollView}>
            {surveys.map((survey, index) => (
              <TouchableHighlight
                key={'survey-' + survey._id}
                activeOpacity={0.6}
                underlayColor="#ffffff"
                onPress={() => selectSurvey(survey._id)}>
                <View style={[styles.surveyBox, { borderTopWidth: index === 0 ? 0 : 1 }]}>
                  <View style={styles.surveyNameBox}>
                    <Text style={styles.largeText} numberOfLines={1}>
                      {survey.name}
                    </Text>
                    <Text style={styles.normalText} numberOfLines={2}>
                      {survey.description}
                    </Text>
                  </View>
                  <View style={styles.surveyDataBox}>
                    <View style={styles.surveyInfoContainer}>
                      <View style={styles.surveyInfoKeyContainer}>
                        <Text style={styles.infoKeyText} numberOfLines={1}>
                          Startdatum:
                        </Text>
                        <Text style={styles.infoKeyText} numberOfLines={1}>
                          Enddatum:
                        </Text>
                        <Text style={styles.infoKeyText} numberOfLines={1}>
                          Fragenanzahl:
                        </Text>
                      </View>
                      <View style={styles.surveyInfoValueContainer}>
                        <Text style={styles.infoValueText} numberOfLines={1}>
                          {TimeUtil.getDateAsString(new Date(survey.startDate))}
                        </Text>
                        <Text style={styles.infoValueText} numberOfLines={1}>
                          {TimeUtil.getDateAsString(new Date(survey.endDate))}
                        </Text>
                        <Text style={styles.infoValueText} numberOfLines={1}>
                          {survey.questions.length} Frage{survey.questions.length === 1 ? '' : 'n'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.surveyBadgeContainer}>
                      {survey.draft && (
                        <View style={[styles.badge, { backgroundColor: '#6404ec' }]}>
                          <Text style={styles.badgeText}>Entwurf</Text>
                        </View>
                      )}
                      {!survey.draft &&
                        new Date(survey.startDate).getTime() > new Date().getTime() && (
                          <View style={[styles.badge, { backgroundColor: 'rgb(74 222 128)' }]}>
                            <Text style={styles.badgeText}>Bereit</Text>
                          </View>
                        )}
                      {!survey.draft &&
                        new Date(survey.startDate).getTime() <= new Date().getTime() &&
                        new Date(survey.endDate).getTime() > new Date().getTime() && (
                          <View style={[styles.badge, { backgroundColor: 'rgb(74 222 128)' }]}>
                            <Text style={styles.badgeText}>Aktiv</Text>
                          </View>
                        )}
                      {!survey.draft &&
                        new Date(survey.endDate).getTime() < new Date().getTime() && (
                          <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
                            <Text style={styles.badgeText}>Beendet</Text>
                          </View>
                        )}
                      {survey.archived && (
                        <View style={[styles.badge, { backgroundColor: 'rgb(251 146 60)' }]}>
                          <Text style={styles.badgeText}>Archiv</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableHighlight>
            ))}
          </ScrollView>
          <View style={styles.pagingContainer}>
            <TouchableHighlight
              style={styles.pagerBox}
              activeOpacity={0.6}
              underlayColor="#ffffff"
              onPress={
                pagingOptions.page === 1
                  ? undefined
                  : () => {
                      loadSurveys({
                        ...pagingOptions,
                        page: pagingOptions.page - 1
                      });
                    }
              }>
              <IonIcons
                name="chevron-back-circle-outline"
                size={36}
                color={pagingOptions.page > 1 ? '#6404ec' : '#505050'}
              />
            </TouchableHighlight>
            <Text style={styles.pagingText}>
              Seite {pagingOptions.page} von {pagingOptions.lastPage}
            </Text>
            <TouchableHighlight
              style={styles.pagerBox}
              activeOpacity={0.6}
              underlayColor="#ffffff"
              onPress={
                pagingOptions.page === pagingOptions.lastPage
                  ? undefined
                  : () => {
                      loadSurveys({
                        ...pagingOptions,
                        page: pagingOptions.page + 1
                      });
                    }
              }>
              <IonIcons
                name="chevron-forward-circle-outline"
                size={36}
                color={pagingOptions.page < pagingOptions.lastPage ? '#6404ec' : '#505050'}
              />
            </TouchableHighlight>
          </View>
        </>
      )}
      {!loader.loading && !loader.error && surveys.length === 0 && (
        <View style={styles.infoErrorView}>
          <IonIcons name="information-circle-outline" size={40} color="#6404ec" />
          <Text style={styles.loadingText}>Es wurden keine Umfragen gefunden.</Text>
        </View>
      )}
      {loader.loading && !loader.error && (
        <View style={styles.infoErrorView}>
          <ActivityIndicator style={styles.spinner} size="large" color="#6404ec" />
          <Text style={styles.loadingText}>Umfragen werden geladen ...</Text>
        </View>
      )}
      {!loader.loading && loader.error && (
        <View style={styles.infoErrorView}>
          <IonIcons name="information-circle-outline" size={40} color="#ef4444" />
          <Text style={styles.errorText}>{loader.error}</Text>
        </View>
      )}
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
    marginLeft: 20,
    paddingVertical: 10,
    fontWeight: '600',
    fontSize: 14,
    color: '#6404ec',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  reloadButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20
  },
  scrollView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
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
  surveyBox: {
    width: '100%',
    height: 90,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderColor: '#e3e3e3',
    borderTopWidth: 1
  },
  surveyNameBox: {
    height: '100%',
    width: '70%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 4,
    paddingRight: 5
  },
  largeText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000'
  },
  normalText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#616161'
  },
  surveyDataBox: {
    height: '100%',
    width: '30%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 5
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
  surveyInfoContainer: {
    height: '100%',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around'
  },
  surveyInfoKeyContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  surveyInfoValueContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start'
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
  pagingContainer: {
    width: '100%',
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderColor: '#e3e3e3',
    borderTopWidth: 1
  },
  pagerBox: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1
  },
  pagingText: {
    flexGrow: 1,
    fontSize: 16,
    textAlign: 'center',
    color: '#000000'
  }
});

export default ChooseSurveyScreen;
