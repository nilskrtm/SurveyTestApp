// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import promiseReflect from 'promise-reflect';
import uuid from 'react-native-uuid';
import WebUtil from '../util/WebUtil';
import axios, { AxiosInstance, CancelTokenSource } from 'axios';
import { SyncedVoting, VotingSyncJob } from './VotingModels';
import { SortDescriptor, Realm } from 'realm';

type VotingSyncQueueCallbacks = {
  [key in CallbackName]: CallbackObject[];
};

export type CallbackName =
  | 'onQueueStart'
  | 'onQueueStop'
  | 'onSyncJobStart'
  | 'onSyncJobSuccess'
  | 'onSyncJobFailure';

export type CallbackObject = {
  id: string;
  callbackName: CallbackName;
  callback: (...args: any[]) => void;
};

class VotingSyncQueue {
  static instance: VotingSyncQueue;

  realmProvider: () => Realm = () => null as unknown as Realm;
  authInstanceProvider: () => AxiosInstance = () => axios.create();
  concurrency = 5;
  timeout = 0;
  callbacks: VotingSyncQueueCallbacks = {
    onQueueStart: [],
    onQueueStop: [],
    onSyncJobStart: [],
    onSyncJobSuccess: [],
    onSyncJobFailure: []
  };
  status = 'inactive';
  processingRequestTokenSources: { [key: string]: CancelTokenSource } = {};
  syncInterval: any = null;

  constructor() {
    console.log('[VotingSyncQueue] Initializing');
  }

  static initialize() {
    VotingSyncQueue.instance = new VotingSyncQueue();
  }

  static getInstance(): VotingSyncQueue {
    return VotingSyncQueue.instance;
  }

  getRealm(): Realm {
    return this.realmProvider();
  }

  getAuthInstance(): AxiosInstance {
    return this.authInstanceProvider();
  }

  getConcurrency(): number {
    return this.concurrency;
  }

  getTimeout(): number {
    return this.timeout;
  }

  getStatus(): string {
    return this.status;
  }

  setRealmProvider(realmProvider: () => Realm): void {
    this.realmProvider = realmProvider;
  }

  setAuthInstanceProvider(authInstanceProvider: () => AxiosInstance): void {
    this.authInstanceProvider = authInstanceProvider;
  }

  setConcurrency(concurrency: number) {
    this.concurrency = concurrency;
  }

  setTimeout(timeout: number) {
    this.timeout = timeout;
  }

  registerCallback(callbackName: CallbackName, callback: any): CallbackObject {
    const callbackObject: CallbackObject = {
      id: uuid.v4() as string,
      callbackName: callbackName,
      callback: callback
    };

    this.callbacks[callbackName].push(callbackObject);

    return callbackObject;
  }

  unregisterCallback(callbackName: CallbackName, callbackObject: CallbackObject) {
    for (const i in this.callbacks[callbackName]) {
      if (this.callbacks[callbackName][parseInt(i, 10)].id === callbackObject.id) {
        this.callbacks[callbackName].slice(parseInt(i, 10), 1);

        return;
      }
    }
  }

  addVoting(surveyId: string, voting: any, startQueue = true) {
    this.getRealm().write(() => {
      const votingSyncJobs = this.getRealm()
        .objects<VotingSyncJob>('VotingSyncJob')
        .sorted([['number', true]]);
      const syncedVotings = this.getRealm()
        .objects<SyncedVoting>('SyncedVoting')
        .sorted([['number', true]]);
      const maxNumberVotingSyncJobs = votingSyncJobs.length > 0 ? votingSyncJobs[0].number : 0;
      const maxNumberSyncedVotings = syncedVotings.length > 0 ? syncedVotings[0].number : 0;

      this.getRealm().create<VotingSyncJob>('VotingSyncJob', {
        _id: uuid.v4() as string,
        number: Math.max(maxNumberVotingSyncJobs, maxNumberSyncedVotings) + 1,
        active: false,
        created: new Date(),
        failState: '',
        failedInScope: false,
        surveyId: surveyId,
        voting: JSON.stringify(voting)
      });
    });

    if (startQueue && this.status === 'inactive') {
      this.start();
    }
  }

  async start(tryFailed = false) {
    if (this.status === 'active') {
      return false;
    }

    this.status = 'active';
    this.executeGeneralLifecycleCallback('onQueueStart');

    if (tryFailed) {
      this.getRealm().write(() => {
        let jobs: Realm.Results<VotingSyncJob> | void[] = this.getRealm()
          .objects<VotingSyncJob>('VotingSyncJob')
          .filtered('failedInScope != FALSE');

        if (jobs.length > 0) {
          jobs = jobs.map((job) => {
            if (job) {
              job.failedInScope = false;
            }
          });
        }
      });
    }

    let concurrentJobs = this.getConcurrentJobs(tryFailed);

    while (this.status === 'active' && concurrentJobs.length) {
      const processingJobs = concurrentJobs.map((job) => {
        return this.processJob(job);
      });

      await Promise.all(processingJobs.map(promiseReflect));

      concurrentJobs = this.getConcurrentJobs(tryFailed);
    }

    this.stop();
  }

  stop() {
    this.status = 'inactive';

    this.executeGeneralLifecycleCallback('onQueueStop');

    for (const i in this.processingRequestTokenSources) {
      const cancelTokenSource: CancelTokenSource = this.processingRequestTokenSources[i];

      cancelTokenSource.cancel();
    }

    for (const i in this.processingRequestTokenSources) {
      delete this.processingRequestTokenSources[i];
    }

    this.getRealm().write(() => {
      let jobs: Realm.Results<VotingSyncJob> | void[] = this.getRealm()
        .objects<VotingSyncJob>('VotingSyncJob')
        .filtered('active != FALSE');

      if (jobs.length > 0) {
        jobs = jobs.map((job) => {
          if (job) {
            job.active = false;
          }
        });
      }
    });
  }

  getJobs(): Realm.Results<VotingSyncJob & Realm.Object> | null {
    let jobs = null;

    this.getRealm().write(() => {
      jobs = this.getRealm().objects<VotingSyncJob>('VotingSyncJob');
    });

    return jobs;
  }

  getConcurrentJobs(tryFailed: boolean): VotingSyncJob[] {
    let concurrentJobs: VotingSyncJob[] = [];

    this.getRealm().write(() => {
      let nextJob: VotingSyncJob | null = null;
      let initialQuery = 'active == FALSE';

      if (!tryFailed) {
        initialQuery += ' AND failState == ""';
      } else {
        initialQuery += ' AND failedInScope == FALSE';
      }

      const sortingArray: SortDescriptor[] = [['created', false]];

      if (tryFailed) {
        sortingArray.push(['failState', false]);
      }

      const jobs = this.getRealm()
        .objects<VotingSyncJob>('VotingSyncJob')
        .filtered(initialQuery)
        .sorted(sortingArray);

      if (jobs.length) {
        nextJob = jobs[0];
      }

      if (nextJob) {
        const concurrency: number = this.getConcurrency();
        let allRelatedJobsQuery = 'active == FALSE';

        if (!tryFailed) {
          allRelatedJobsQuery += ' AND failState == ""';
        } else {
          allRelatedJobsQuery += ' AND failedInScope == FALSE';
        }

        const allRelatedJobs = this.getRealm()
          .objects<VotingSyncJob>('VotingSyncJob')
          .filtered(allRelatedJobsQuery)
          .sorted(sortingArray);

        let jobsToMarkActive: VotingSyncJob[] | void[] = allRelatedJobs.slice(0, concurrency);
        const concurrentJobIds: string[] = jobsToMarkActive.map((job) => job._id);

        jobsToMarkActive = jobsToMarkActive.map((job) => {
          job.active = true;
          job.failState = '';
        });

        const reselectQuery = concurrentJobIds
          .map((jobId: string) => '_id == "' + jobId + '"')
          .join(' OR ');
        const reselectedJobs = this.getRealm()
          .objects<VotingSyncJob>('VotingSyncJob')
          .filtered(reselectQuery)
          .sorted([['created', false]]);

        concurrentJobs = reselectedJobs.slice(0, concurrency);
      }
    });

    return concurrentJobs;
  }

  async processJob(job: VotingSyncJob) {
    const jobId = job._id;
    const voting = JSON.parse(job.voting);

    this.executeJobLifecycleCallback('onSyncJobStart', jobId, voting);

    try {
      await this.executeJob(job);

      this.getRealm().write(() => {
        this.getRealm().create<SyncedVoting>('SyncedVoting', {
          _id: jobId,
          number: job.number,
          created: job.created,
          synced: new Date(),
          surveyId: job.surveyId,
          voting: job.voting
        });
        this.getRealm().delete(job);
      });

      this.executeJobLifecycleCallback('onSyncJobSuccess', jobId, voting);
    } catch (error: any) {
      this.getRealm().write(() => {
        job.active = false;
        job.failState = 'network';
        job.failedInScope = true;

        if (error.response) {
          if (error.response.status === 401) {
            job.failState = 'auth';
          }
        }

        if (WebUtil.isCancelled(error)) {
          job.failState = '';
        }
      });

      this.executeJobLifecycleCallback('onSyncJobFailure', jobId, voting);
    }
  }

  async executeJob(job: VotingSyncJob) {
    const jobId = job._id;
    const surveyID = job.surveyId;
    const voting = JSON.parse(job.voting);

    if (this.timeout > 0) {
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('TIMEOUT: Job: ' + jobId + ' timed out in ' + this.timeout + 'ms'));
        }, this.timeout);
      });

      await Promise.race([timeoutPromise, this.sendVoting(jobId, surveyID, voting)]);
    } else {
      await this.sendVoting(jobId, surveyID, voting);
    }
  }

  sendVoting(jobId: string, surveyId: string, voting: any) {
    return new Promise((resolve, reject) => {
      const cancelTokenSource: CancelTokenSource = WebUtil.cancelToken().source();
      const requestTokenSourceId: string = uuid.v4() as string;

      this.processingRequestTokenSources[requestTokenSourceId] = cancelTokenSource;

      this.getAuthInstance()
        .post('/surveys/' + surveyId + '/votings', voting, {
          cancelToken: cancelTokenSource.token
        })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
          reject(error);
        })
        .finally(() => {
          delete this.processingRequestTokenSources[requestTokenSourceId];
        });
    });
  }

  startSyncInterval(intervalMillis: number) {
    this.stopSyncInterval();

    this.syncInterval = setInterval(() => {
      this.start(true);
    }, intervalMillis);

    console.log(
      '[VotingSyncQueue] Interval - Started sync-interval for ' + intervalMillis + ' milliseconds'
    );
  }

  stopSyncInterval() {
    if (this.syncInterval) {
      this.stop();

      try {
        clearInterval(this.syncInterval);
      } catch {}

      this.syncInterval = null;

      console.log('[VotingSyncQueue] Interval - Stopped sync-interval');
    }
  }

  executeGeneralLifecycleCallback(callbackName: CallbackName) {
    for (const i in this.callbacks[callbackName]) {
      this.callbacks[callbackName][parseInt(i, 10)].callback();
    }
  }

  executeJobLifecycleCallback(callbackName: CallbackName, jobId: string, jobPayload: any) {
    for (const i in this.callbacks[callbackName]) {
      this.callbacks[callbackName][parseInt(i, 10)].callback(jobId, jobPayload);
    }
  }

  flushQueue() {
    this.getRealm().write(() => {
      this.getRealm().deleteAll();
    });
  }
}

export default VotingSyncQueue;
