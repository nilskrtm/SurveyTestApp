type Voting = {
  _id: string;
  survey: string;
  date: string;
  votes: Array<Vote>;
};

type Vote = {
  question: string;
  answerOption: string;
};

type CreateVotingValues = Partial<Pick<Voting, 'survey' | 'date' | 'votes'>>;

export type { Voting, Vote, CreateVotingValues };
