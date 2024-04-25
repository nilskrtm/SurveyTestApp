import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableHighlight,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { SyncedVoting, useVotingQuery, VotingSyncJob } from '../../votings/VotingModels';
import PagingUtil from '../../util/PagingUtil';
import TimeUtil from '../../util/TimeUtil';

const PER_PAGE = 25;

type VotingsScreenData = {
  dropdownOpen: boolean;
  loading: boolean;
  error: string;
  votingType: string;
  pagingOptions: any;
  data: any[];
};

function VotingsScreen(): React.JSX.Element {
  const votingSyncJobs = useVotingQuery(VotingSyncJob);
  const syncedVotings = useVotingQuery(SyncedVoting);

  const dropdownRef = useRef<any>();

  const [state, setState] = useState<VotingsScreenData>({
    dropdownOpen: false,
    loading: true,
    error: '',
    votingType: 'open',
    pagingOptions: {
      perPage: PER_PAGE,
      page: 1,
      lastPage: 1,
      offset: 0,
      count: 0
    },
    data: []
  });

  const hasWarning = false;

  const loadData = useCallback((votingType: string, newPagingOptions: any) => {
    setState({ ...state, votingType: votingType, loading: true, error: '' });

    try {
      if (votingType === 'open') {
        const count: number = votingSyncJobs.length;
        const paging: any = PagingUtil.calculatePaging(newPagingOptions, count);

        const data = votingSyncJobs
          .sorted('number', true)
          .slice(paging.offset, paging.offset + paging.perPage);

        setState({
          ...state,
          votingType: votingType,
          loading: false,
          data: data,
          pagingOptions: paging
        });

        return;
      }

      if (votingType === 'synced') {
        const count: number = syncedVotings.length;
        const paging: any = PagingUtil.calculatePaging(newPagingOptions, count);
        const data = syncedVotings
          .sorted('number', true)
          .slice(paging.offset, paging.offset + paging.perPage);

        setState({
          ...state,
          votingType: votingType,
          loading: false,
          data: data,
          pagingOptions: paging
        });

        return;
      }
    } catch {
      setState({
        ...state,
        votingType: votingType,
        loading: false,
        data: [],
        error: 'Fehler beim Laden der Daten!'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDropdown = () => {
    setState({ ...state, dropdownOpen: !state.dropdownOpen });
  };

  const setVotingType = (type: string) => {
    setState({ ...state, dropdownOpen: false });

    loadData(type, {
      perPage: PER_PAGE,
      page: 1
    });
  };

  const getVotingSyncJobState = (votingJob: VotingSyncJob) => {
    if (votingJob.failState === 'network') {
      return 'Fehler bei Serververbindung';
    } else if (votingJob.failState === 'auth') {
      return 'Fehler bei Authentifizierung';
    }

    return 'Synchronisation ausstehend';
  };

  useEffect(() => {
    console.log('[Lifecycle] Mount - VotingScreen');

    loadData('open', {
      perPage: PER_PAGE,
      page: 1
    });

    return () => {
      console.log('[Lifecycle] Unmount - VotingScreen');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {hasWarning && (
        <View style={styles.warningContainer}>
          <IonIcons name="warning" size={20} color="#ef4444" />
          <Text style={styles.warningText}>Die Synchronisation ist aktiv.</Text>
        </View>
      )}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Abstimmungen</Text>
        <TouchableOpacity
          ref={dropdownRef}
          style={styles.dropdownContainer}
          onPress={() => toggleDropdown()}>
          <Modal visible={state.dropdownOpen} transparent animationType="none">
            <TouchableOpacity
              style={styles.dropdownOverlay}
              onPress={() => setState({ ...state, dropdownOpen: false })}>
              <View style={styles.dropdown}>
                {state.votingType === 'open' ? (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => setVotingType('synced')}>
                    <Text style={styles.dropdownItemText} numberOfLines={1}>
                      erfolgreich synchronisiert
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => setVotingType('open')}>
                    <Text style={styles.dropdownItemText} numberOfLines={1}>
                      noch nicht synchronisiert
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          </Modal>
          <Text style={styles.headerText} numberOfLines={1}>
            {state.votingType === 'open'
              ? 'noch nicht synchronisiert'
              : 'erfolgreich synchronisiert'}
          </Text>
          <IonIcons name="chevron-down" size={20} style={styles.dropdownIcon} />
        </TouchableOpacity>
      </View>
      {!state.loading && !state.error && state.data.length > 0 && (
        <>
          <ScrollView style={styles.scrollView}>
            {state.votingType === 'open' ? (
              <>
                <View style={[styles.voteBox, { borderTopWidth: 0 }]}>
                  <View style={styles.voteTextBox}>
                    <Text style={styles.voteHeaderText} numberOfLines={1}>
                      Abstimmung
                    </Text>
                  </View>
                  <View style={styles.voteTextBox}>
                    <Text style={styles.voteHeaderText} numberOfLines={1}>
                      Abgestimmt am
                    </Text>
                  </View>
                  <View style={styles.voteTextBox}>
                    <Text style={styles.voteHeaderText} numberOfLines={1}>
                      Synchronisationsstatus
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.voteBox, { borderTopWidth: 0 }]}>
                  <View style={styles.voteTextBox}>
                    <Text style={styles.voteHeaderText} numberOfLines={1}>
                      Abstimmung
                    </Text>
                  </View>
                  <View style={styles.voteTextBox}>
                    <Text style={styles.voteHeaderText} numberOfLines={1}>
                      Abgestimmt am
                    </Text>
                  </View>
                  <View style={styles.voteTextBox}>
                    <Text style={styles.voteHeaderText} numberOfLines={1}>
                      Synchronisiert am
                    </Text>
                  </View>
                </View>
              </>
            )}
            {state.data.map((object) => (
              <View style={styles.voteBox} key={object._id}>
                {state.votingType === 'open' ? (
                  <>
                    <View style={styles.voteTextBox}>
                      <Text style={styles.voteText} numberOfLines={1}>
                        Abstimmung {object.number}
                      </Text>
                    </View>
                    <View style={styles.voteTextBox}>
                      <Text style={styles.voteText} numberOfLines={1}>
                        {TimeUtil.getDateAsString(new Date(object.created))}
                      </Text>
                    </View>
                    <View style={styles.voteTextBox}>
                      <Text style={styles.voteText} numberOfLines={1}>
                        {getVotingSyncJobState(object)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.voteTextBox}>
                      <Text style={styles.voteText} numberOfLines={1}>
                        Abstimmung {object.number}
                      </Text>
                    </View>
                    <View style={styles.voteTextBox}>
                      <Text style={styles.voteText} numberOfLines={1}>
                        {TimeUtil.getDateAsString(new Date(object.created))}
                      </Text>
                    </View>
                    <View style={styles.voteTextBox}>
                      <Text style={styles.voteText} numberOfLines={1}>
                        {TimeUtil.getDateAsString(new Date(object.synced))}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.pagingContainer}>
            <TouchableHighlight
              style={styles.pagerBox}
              activeOpacity={0.6}
              underlayColor="#ffffff"
              onPress={
                state.pagingOptions.page === 1
                  ? undefined
                  : () => {
                      loadData(state.votingType, {
                        ...state.pagingOptions,
                        page: state.pagingOptions.page - 1
                      });
                    }
              }>
              <IonIcons
                name="chevron-back-circle-outline"
                size={36}
                color={state.pagingOptions.page > 1 ? '#6404ec' : '#505050'}
              />
            </TouchableHighlight>
            <Text style={styles.pagingText}>
              Seite {state.pagingOptions.page} von {state.pagingOptions.lastPage}
            </Text>
            <TouchableHighlight
              style={styles.pagerBox}
              activeOpacity={0.6}
              underlayColor="#ffffff"
              onPress={
                state.pagingOptions.page === state.pagingOptions.lastPage
                  ? undefined
                  : () => {
                      loadData(state.votingType, {
                        ...state.pagingOptions,
                        page: state.pagingOptions.page + 1
                      });
                    }
              }>
              <IonIcons
                name="chevron-forward-circle-outline"
                size={36}
                color={
                  state.pagingOptions.page < state.pagingOptions.lastPage ? '#6404ec' : '#505050'
                }
              />
            </TouchableHighlight>
          </View>
        </>
      )}
      {!state.loading && !state.error && state.data.length === 0 && (
        <View style={styles.infoErrorView}>
          <IonIcons name="information-circle-outline" size={40} color="#6404ec" />
          <Text style={styles.loadingText}>
            {state.votingType === 'open'
              ? 'Es wurden keine offenen Abstimmungen für die aktuelle Umfrage gefunden.'
              : 'Es wurden noch keine Abstimmungen der aktuellen Umfrage synchronisiert.'}
          </Text>
        </View>
      )}
      {state.loading && !state.error && (
        <View style={styles.infoErrorView}>
          <ActivityIndicator style={styles.spinner} size="large" color="#6404ec" />
          <Text style={styles.loadingText}>Abstimmungen werden geladen ...</Text>
        </View>
      )}
      {!state.loading && state.error && (
        <View style={styles.infoErrorView}>
          <IonIcons name="information-circle-outline" size={40} color="#ef4444" />
          <Text style={styles.errorText}>{state.error}</Text>
        </View>
      )}
    </View>
  );
}

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
  dropdownContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  dropdownIcon: {
    marginRight: 20,
    marginLeft: 10
  },
  dropdownOverlay: {
    width: '100%',
    height: '100%'
  },
  dropdown: {
    position: 'absolute',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    top: 95
  },
  dropdownItem: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderColor: '#e3e3e3',
    borderBottomWidth: 1
  },
  dropdownItemText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#616161',
    letterSpacing: 1.2,
    textAlign: 'right',
    textTransform: 'uppercase',
    marginRight: 40
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
  voteBox: {
    width: '100%',
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderColor: '#e3e3e3',
    borderTopWidth: 1
  },
  voteTextBox: {
    width: '33%'
  },
  voteHeaderText: {
    width: '100%',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000000'
  },
  voteText: {
    width: '100%',
    fontSize: 16,
    textAlign: 'center',
    color: '#000000'
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

export default VotingsScreen;
