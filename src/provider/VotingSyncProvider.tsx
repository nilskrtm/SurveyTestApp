import React, { useEffect } from 'react';
import VotingSyncQueue, { CallbackObject } from '../votings/VotingSyncQueue';
import { useAppDispatch } from '../redux/hooks';
import { setIsVotingsSyncing } from '../redux/generalSlice';
import { useVotingRealm } from '../votings/VotingModels';

const VotingSyncProvider: () => React.JSX.Element = () => {
  const dispatch = useAppDispatch();
  const realm = useVotingRealm();

  useEffect(() => {
    console.log('[Lifecycle] Mount - VotingSyncProvider');

    VotingSyncQueue.initialize();

    VotingSyncQueue.getInstance().setRealmProvider(() => realm);

    const callbacks: CallbackObject[] = [];

    callbacks.push(
      VotingSyncQueue.getInstance().registerCallback('onQueueStart', () => {
        console.log('[VotingSyncQueue] Queue - Started');

        dispatch(setIsVotingsSyncing(true));
      })
    );
    callbacks.push(
      VotingSyncQueue.getInstance().registerCallback('onQueueStop', () => {
        console.log('[VotingSyncQueue] Queue - Stopped');

        dispatch(setIsVotingsSyncing(false));
      })
    );
    callbacks.push(
      VotingSyncQueue.getInstance().registerCallback('onSyncJobStart', (jobId: string) => {
        console.log('[VotingSyncQueue] Job - ' + jobId + ' was started.');
      })
    );
    callbacks.push(
      VotingSyncQueue.getInstance().registerCallback('onSyncJobSuccess', (jobId: string) => {
        console.log('[VotingSyncQueue] Job - ' + jobId + ' finished successfully.');
      })
    );
    callbacks.push(
      VotingSyncQueue.getInstance().registerCallback('onSyncJobFailure', (jobId: string) => {
        console.log('[VotingSyncQueue] Job - ' + jobId + ' failed.');
      })
    );

    return () => {
      console.log('[Lifecycle] Unmount - VotingSyncProvider');

      for (const i in callbacks) {
        VotingSyncQueue.getInstance().unregisterCallback(callbacks[i].callbackName, callbacks[i]);
      }
    };
  }, [dispatch, realm]);

  return <></>;
};

export default VotingSyncProvider;
