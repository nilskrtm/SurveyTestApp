import Realm, { ObjectSchema } from 'realm';
import { createRealmContext } from '@realm/react';

export class VotingSyncJob extends Realm.Object<VotingSyncJob> {
  _id!: string;
  number!: number;
  active!: boolean;
  created!: Date;
  failState!: string;
  failedInScope!: boolean;
  surveyId!: string;
  voting!: string;

  static schema: ObjectSchema = {
    name: 'VotingSyncJob',
    properties: {
      _id: 'string',
      number: 'int',
      active: 'bool',
      created: 'date',
      failState: 'string',
      failedInScope: 'bool',
      surveyId: 'string',
      voting: 'string'
    },
    primaryKey: '_id'
  };
}

export class SyncedVoting extends Realm.Object<SyncedVoting> {
  _id!: string;
  number!: number;
  created!: Date;
  synced!: Date;
  surveyId!: string;
  voting!: string;

  static schema: ObjectSchema = {
    name: 'SyncedVoting',
    properties: {
      _id: 'string',
      number: 'int',
      created: 'date',
      synced: 'date',
      surveyId: 'string',
      voting: 'string'
    },
    primaryKey: '_id'
  };
}

const realmConfig: Realm.Configuration = {
  schema: [VotingSyncJob, SyncedVoting]
};
const { RealmProvider, useRealm, useQuery } = createRealmContext(realmConfig);

export const VotingRealmProvider = RealmProvider;
export const useVotingRealm = useRealm;
export const useVotingQuery = useQuery;
