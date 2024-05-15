import API from '../api';
import { AnswerPicture } from '../types/answer.picture.types';
import { APIPaging } from '../types/common.types';
import { AnswerPictureUrls } from '../types/answer.picture.types';

const getAnswerPictures = (
  page: number,
  perPage: number,
  filter?: { [key: string]: string | number | boolean }
) => {
  return API.get<{ answerPictures: Array<AnswerPicture>; paging: APIPaging }>('/answer-pictures', {
    params: { page: page, perPage: perPage, ...filter }
  });
};

const getAnswerPicture = (id: string) => {
  return API.get<{ answerPicture: AnswerPicture & { url: string } }>('/answer-pictures/' + id);
};

const getAnswerPictureUrls = (fileNames: string | Array<string>) => {
  const finalFileNames: Array<string> = Array.isArray(fileNames)
    ? fileNames
    : [fileNames as string];
  const queryFileNames = finalFileNames.join('&fileNames=');

  return API.get<{ urls: AnswerPictureUrls }>('/answer-pictures/urls?fileNames=' + queryFileNames);
};

export default {
  getAnswerPictures,
  getAnswerPicture,
  getAnswerPictureUrls
};
