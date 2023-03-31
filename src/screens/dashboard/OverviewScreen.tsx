import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import {StackActions, useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {
  selectIsVotingsSyncing,
  setIsSurveyTestMode,
} from '../../redux/generalSlice';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {useStorage} from '../../../App';
import TimeUtil from '../../util/TimeUtil';
import {
  SyncedVoting,
  useVotingQuery,
  VotingSyncJob,
} from '../../votings/VotingModels';
import {Collection, CollectionChangeSet} from 'realm';
import VotingSyncQueue from '../../votings/VotingSyncQueue';
import window from '@react-navigation/native/lib/typescript/src/__mocks__/window';

function OverviewScreen(): JSX.Element {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const votingSyncJobs = useVotingQuery(VotingSyncJob);
  const syncedVotings = useVotingQuery(SyncedVoting);

  const [openCount, setOpenCount] = useState<number>(0);
  const [syncedCount, setSyncedCount] = useState<number>(0);

  const [kioskPin] = useStorage<string>('kiosk_pin', '');
  const [selectedSurvey] = useStorage<any>('selected_survey', {});
  const [selectedSurveyValid] = useStorage<boolean>(
    'selected_survey_valid',
    false,
  );

  const syncing: boolean = useAppSelector(selectIsVotingsSyncing);

  const warnings: string[] = [];

  if (!kioskPin) {
    warnings.push('Es ist keine Kiosk-Modus Pin eingerichtet.');
  }

  if (selectedSurveyValid && selectedSurvey.draft) {
    warnings.push(
      'Die Umfrage ist noch im Entwurf und könnte schon weiter bearbeitet worden sein.',
    );
  }

  const canTestSurvey = () => {
    return (
      kioskPin &&
      selectedSurveyValid &&
      Object.keys(selectedSurvey).length > 0 &&
      selectedSurvey.questions.length > 0
    );
  };

  const canStartSurvey = () => {
    return (
      kioskPin &&
      selectedSurveyValid &&
      Object.keys(selectedSurvey).length > 0 &&
      !selectedSurvey.draft
    );
  };

  const startSurvey = (testMode: boolean) => {
    dispatch(setIsSurveyTestMode(testMode));
    navigation.dispatch(StackActions.replace('SurveyNavigator'));
  };

  useEffect(() => {
    console.log('[Lifecycle] Mount - OverviewScreen');

    setOpenCount(votingSyncJobs.length);
    setSyncedCount(syncedVotings.length);

    const votingSyncJobsListener = (
      collection: Collection<VotingSyncJob>,
      changes: CollectionChangeSet,
    ) => {
      if (changes.deletions || changes.insertions) {
        setOpenCount(collection.length);
      }
    };
    const syncedVotingsListener = (
      collection: Collection<SyncedVoting>,
      changes: CollectionChangeSet,
    ) => {
      if (changes.deletions || changes.insertions) {
        setSyncedCount(collection.length);
      }
    };

    votingSyncJobs.addListener(votingSyncJobsListener);
    syncedVotings.addListener(syncedVotingsListener);

    return () => {
      console.log('[Lifecycle] Unmount - OverviewScreen');

      votingSyncJobs.removeListener(votingSyncJobsListener);
      syncedVotings.removeListener(syncedVotingsListener);
    };
  }, [
    syncedVotings,
    syncedVotings.length,
    votingSyncJobs,
    votingSyncJobs.length,
  ]);

  return (
    <View style={styles.container}>
      {warnings.map((warning, index) => (
        <View key={'warning_' + index} style={styles.warningContainer}>
          <IonIcons name="warning" size={20} color="#ef4444" />
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      ))}
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Aktuelle Umfrage</Text>
        </View>
        <View style={styles.generalHolder}>
          <View style={styles.generalInfoContainer}>
            <View style={styles.generalInfoWrapper}>
              <View style={styles.generalInfoKeyHolder}>
                <Text
                  style={[styles.largeText, {fontWeight: '600'}]}
                  numberOfLines={1}>
                  Umfrage:{' '}
                </Text>
              </View>
              <View style={styles.generalInfoValueHolder}>
                <Text style={styles.largeText} numberOfLines={1}>
                  {selectedSurveyValid ? selectedSurvey.name : '-'}
                </Text>
              </View>
            </View>
            <View style={styles.generalInfoWrapper}>
              <View style={styles.generalInfoKeyHolder}>
                <Text
                  style={[styles.normalText, {fontWeight: '600'}]}
                  numberOfLines={1}>
                  Beschreibung:
                </Text>
              </View>
              <View style={styles.generalInfoValueHolder}>
                <Text style={styles.normalText}>
                  {selectedSurveyValid ? selectedSurvey.description : '-'}
                </Text>
              </View>
            </View>
            <View style={styles.generalInfoWrapper}>
              <View style={styles.generalInfoKeyHolder}>
                <Text
                  style={[styles.normalText, {fontWeight: '600'}]}
                  numberOfLines={1}>
                  Startdatum:
                </Text>
              </View>
              <View style={styles.generalInfoValueHolder}>
                <Text style={styles.normalText}>
                  {selectedSurveyValid
                    ? TimeUtil.getDateAsString(
                        new Date(selectedSurvey.startDate),
                      )
                    : 'XX.XX.XXXX - XX.XX Uhr'}
                </Text>
              </View>
            </View>
            <View style={styles.generalInfoWrapper}>
              <View style={styles.generalInfoKeyHolder}>
                <Text
                  style={[styles.normalText, {fontWeight: '600'}]}
                  numberOfLines={1}>
                  Enddatum:
                </Text>
              </View>
              <View style={styles.generalInfoValueHolder}>
                <Text style={styles.normalText}>
                  {selectedSurveyValid
                    ? TimeUtil.getDateAsString(new Date(selectedSurvey.endDate))
                    : 'XX.XX.XXXX - XX.XX Uhr'}
                </Text>
              </View>
            </View>
            <View style={styles.generalInfoWrapper}>
              <View style={styles.generalInfoKeyHolder}>
                <Text
                  style={[styles.normalText, {fontWeight: '600'}]}
                  numberOfLines={1}>
                  Begrüßung:
                </Text>
              </View>
              <View style={styles.generalInfoValueHolder}>
                <Text style={styles.normalText}>
                  {selectedSurveyValid ? selectedSurvey.greeting : '-'}
                </Text>
              </View>
            </View>
            <View style={styles.generalInfoWrapper}>
              <View style={styles.generalInfoKeyHolder}>
                <Text
                  style={[styles.normalText, {fontWeight: '600'}]}
                  numberOfLines={1}>
                  Fragen:
                </Text>
              </View>
              <View style={styles.generalInfoValueHolder}>
                <Text style={styles.normalText}>
                  {selectedSurveyValid
                    ? selectedSurvey.questions.length + ' Fragen'
                    : 'X Fragen'}
                </Text>
              </View>
            </View>
          </View>
          {selectedSurveyValid && (
            <View style={styles.badgeContainer}>
              {selectedSurvey.draft && (
                <View style={[styles.badge, {backgroundColor: '#fb923c'}]}>
                  <Text style={styles.badgeText}>Entwurf</Text>
                </View>
              )}
              {!selectedSurvey.draft &&
                new Date(selectedSurvey.startDate).getTime() >
                  new Date().getTime() && (
                  <View style={[styles.badge, {backgroundColor: '#22c55e'}]}>
                    <Text style={styles.badgeText}>Bereit</Text>
                  </View>
                )}
              {!selectedSurvey.draft &&
                new Date(selectedSurvey.startDate).getTime() <=
                  new Date().getTime() &&
                new Date(selectedSurvey.endDate).getTime() >
                  new Date().getTime() && (
                  <View style={[styles.badge, {backgroundColor: '#6404ec'}]}>
                    <Text style={styles.badgeText}>Aktiv</Text>
                  </View>
                )}
              {!selectedSurvey.draft &&
                new Date(selectedSurvey.endDate).getTime() <
                  new Date().getTime() && (
                  <View style={[styles.badge, {backgroundColor: '#ef4444'}]}>
                    <Text style={styles.badgeText}>Beendet</Text>
                  </View>
                )}
              {selectedSurvey.archived && (
                <View style={[styles.badge, {backgroundColor: '#9a3412'}]}>
                  <Text style={styles.badgeText}>Archiv</Text>
                </View>
              )}
            </View>
          )}
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Synchronisation</Text>
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor="#e3e3e3"
            onPress={() =>
              syncing
                ? VotingSyncQueue.getInstance().stop()
                : VotingSyncQueue.getInstance().start(true)
            }
            disabled={false}>
            <Text style={styles.headerText}>
              {syncing ? 'Stoppen' : 'Starten'}
            </Text>
          </TouchableHighlight>
        </View>
        <View style={styles.generalInfoContainer}>
          <View style={styles.generalInfoWrapper}>
            <View style={styles.generalInfoKeyHolder}>
              <Text
                style={[styles.normalText, {fontWeight: '600'}]}
                numberOfLines={1}>
                Status:{' '}
              </Text>
            </View>
            <View style={styles.generalInfoValueHolder}>
              <Text style={styles.normalText} numberOfLines={1}>
                {syncing ? 'Aktiv' : 'Inaktiv'}
              </Text>
            </View>
          </View>
          <View style={styles.generalInfoWrapper}>
            <View style={styles.generalInfoKeyHolder}>
              <Text
                style={[styles.normalText, {fontWeight: '600'}]}
                numberOfLines={1}>
                Offen:{' '}
              </Text>
            </View>
            <View style={styles.generalInfoValueHolder}>
              <Text style={styles.normalText} numberOfLines={1}>
                {openCount} Abstimmungen
              </Text>
            </View>
          </View>
          <View style={styles.generalInfoWrapper}>
            <View style={styles.generalInfoKeyHolder}>
              <Text
                style={[styles.normalText, {fontWeight: '600'}]}
                numberOfLines={1}>
                Synchronisiert:{' '}
              </Text>
            </View>
            <View style={styles.generalInfoValueHolder}>
              <Text style={styles.normalText} numberOfLines={1}>
                {syncedCount} Abstimmungen
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Aktionen</Text>
        </View>
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor="#F3F4F6"
          disabled={!canTestSurvey()}
          onPress={() => startSurvey(true)}>
          <View
            style={
              !canTestSurvey()
                ? [
                    styles.actionContainer,
                    {
                      opacity: 0.6,
                      borderTopWidth: 0,
                    },
                  ]
                : [
                    styles.actionContainer,
                    {
                      borderTopWidth: 0,
                    },
                  ]
            }>
            <IonIcons name="shapes-outline" size={28} color="#505050" />
            <Text numberOfLines={1} style={styles.actionTitle}>
              Testlauf der Umfrage starten
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          activeOpacity={0.6}
          underlayColor="#F3F4F6"
          disabled={!canStartSurvey()}
          onPress={() => startSurvey(false)}>
          <View
            style={
              !canStartSurvey()
                ? [
                    styles.actionContainer,
                    {
                      opacity: 0.6,
                    },
                  ]
                : styles.actionContainer
            }>
            <IonIcons name="play-outline" size={28} color="#505050" />
            <Text numberOfLines={1} style={styles.actionTitle}>
              Umfrage-Modus starten
            </Text>
          </View>
        </TouchableHighlight>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
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
    backgroundColor: '#ffffff',
  },
  warningText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '400',
  },
  redText: {
    color: '#ef4444',
  },
  headerContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    marginHorizontal: 20,
    paddingVertical: 10,
    fontWeight: '600',
    fontSize: 14,
    color: '#6404ec',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  generalHolder: {
    width: '100%',
    flexDirection: 'row',
  },
  generalInfoContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  generalInfoWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generalInfoKeyHolder: {
    width: 160,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  generalInfoValueHolder: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  largeText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000000',
  },
  normalText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
  },
  badgeContainer: {
    width: 110,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 4,
    backgroundColor: '#ffffff',
  },
  badge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  actionContainer: {
    width: '100%',
    height: 70,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderColor: '#e3e3e3',
    borderTopWidth: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
  },
});

export default OverviewScreen;
