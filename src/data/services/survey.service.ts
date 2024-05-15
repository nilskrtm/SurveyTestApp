import { Survey } from '../types/survey.types';
import { APIPaging } from '../types/common.types';
import API from '../api';

const getSurveys = (
  page: number,
  perPage: number,
  filter?: { [key: string]: string | number | boolean }
) => {
  return API.get<{ surveys: Array<Survey>; paging: APIPaging }>('/surveys', {
    params: { page: page, perPage: perPage, ...filter }
  });
};

const getSurvey = (id: string) => {
  return API.get<{ survey: Survey }>('/surveys/' + id);
};

export default { getSurveys, getSurvey };
