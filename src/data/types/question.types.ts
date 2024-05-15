import { AnswerOption } from './answer.option.types';

type Question = {
  _id: string;
  question: string;
  timeout: number;
  order: number;
  answerOptions: Array<AnswerOption>;
};

export type { Question };
