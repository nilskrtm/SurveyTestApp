import API from '../api';
import { CreateVotingValues } from '../types/voting.types.ts';
import { CancelToken } from 'axios';

const createVoting = (surveyId: string, values: CreateVotingValues, cancelToken: CancelToken) => {
  return API.post<{ id: string }, typeof values>('/surveys/' + surveyId + '/votings', values, {
    cancelToken: cancelToken
  });
};

export default { createVoting };
