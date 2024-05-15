import NetInfo from '@react-native-community/netinfo';
import FileUtil from '../util/FileUtil';
import VotingSyncQueue from '../votings/VotingSyncQueue';
import { Survey } from '../data/types/survey.types.ts';
import { AnswerPicture, AnswerPicturePaths } from '../data/types/answer.picture.types.ts';
import SurveyService from '../data/services/survey.service.ts';
import AnswerPictureService from '../data/services/answer.picture.service.ts';

export type DownloadSurveyJobSuccessPayload = {
  surveyId: string;
  survey: Survey;
  answerPicturePaths: AnswerPicturePaths;
};

export type DownloadSurveyJobErrorPayload = {
  message: string;
  oldRecoverable: boolean;
};

export const PICTURE_DIRECTORY = '/pictures';

class DownloadSurveyJob {
  surveyId: string;
  survey?: Survey;
  answerPicturePaths: AnswerPicturePaths = {};

  stepCallback: (message: string) => void = () => {};

  constructor(surveyId: string) {
    this.surveyId = surveyId;
    this.survey = undefined;
    this.answerPicturePaths = {};
  }

  onStepStart(callback: (message: string) => void) {
    this.stepCallback = callback;
  }

  async start(): Promise<DownloadSurveyJobSuccessPayload | DownloadSurveyJobErrorPayload> {
    return new Promise<DownloadSurveyJobSuccessPayload | DownloadSurveyJobErrorPayload>(
      async (resolve, reject) => {
        this.stepCallback('Überprüfung der Internetverbindung ...');

        try {
          await this._checkInternetConnection();
        } catch (error) {
          reject({
            message: 'Es besteht keine Verbindung zum Internet!',
            oldRecoverable: true
          } as DownloadSurveyJobErrorPayload);

          return;
        }

        this.stepCallback('Umfrage wird heruntergeladen ...');

        try {
          await this._getSurvey();
        } catch (error) {
          reject({
            message: 'Fehler beim Laden der Umfrage!',
            oldRecoverable: true
          } as DownloadSurveyJobErrorPayload);

          return;
        }

        this.stepCallback('Bilder-Download wird vorbereitet ...');

        try {
          await this._preparePictureDirectory();
        } catch (err) {
          reject({
            message: 'Fehler beim Vorbereiten des Download-Ordners!',
            oldRecoverable: false
          } as DownloadSurveyJobErrorPayload);

          return;
        }

        this.stepCallback('Bilder werden heruntergeladen ...');

        if (!this.survey) {
          reject({
            message: 'Ein unbekannter Fehler ist aufgetreten!',
            oldRecoverable: false
          } as DownloadSurveyJobErrorPayload);

          return;
        }

        const alreadyExisting: Array<string> = [];
        const toDownload: Array<AnswerPicture> = [];

        this.survey.questions.forEach((question) => {
          question.answerOptions.forEach((answerOption) => {
            if (!alreadyExisting.includes(answerOption.picture._id)) {
              toDownload.push(answerOption.picture);
              alreadyExisting.push(answerOption.picture._id);
            }
          });
        });

        for (const i in toDownload) {
          const downloadNumber: number = parseInt(i, 10) + 1;

          this.stepCallback(
            'Bilder werden heruntergeladen ... (' +
              parseInt(String(downloadNumber), 10).toString() +
              '/' +
              toDownload.length +
              ')'
          );

          try {
            await this._downloadPicture(toDownload[i]);
          } catch (error) {
            reject({
              message: 'Fehler beim Laden eines Bildes!',
              oldRecoverable: false
            } as DownloadSurveyJobErrorPayload);

            return;
          }
        }

        this.stepCallback('Alte Abstimmungen werden gelöscht ...');

        try {
          await this._deleteOldVotings();
        } catch (error) {
          reject({
            message: 'Fehler beim Löschen der alten Abstimmungen!',
            oldRecoverable: false
          } as DownloadSurveyJobErrorPayload);

          return;
        }

        if (!this.survey) {
          reject({
            message: 'Ein unbekannter Fehler ist aufgetreten!',
            oldRecoverable: false
          } as DownloadSurveyJobErrorPayload);

          return;
        }

        resolve({
          surveyId: this.surveyId,
          survey: this.survey,
          answerPicturePaths: this.answerPicturePaths
        } as DownloadSurveyJobSuccessPayload);
      }
    );
  }

  _checkInternetConnection(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          if (state.isInternetReachable !== null) {
            if (state.isInternetReachable) {
              resolve({});
            } else {
              reject();
            }
          } else {
            resolve({});
          }
        } else {
          reject();
        }
      });
    });
  }

  _getSurvey(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      SurveyService.getSurvey(this.surveyId).then((response) => {
        if (response.success) {
          this.survey = response.data.survey;

          resolve({});
        } else {
          reject();
        }
      });
    });
  }

  _preparePictureDirectory(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const clearDirectory = () => {
        FileUtil.readDirectory(PICTURE_DIRECTORY)
          .then((files) => {
            if (files.length === 0) {
              resolve({});
            } else {
              const deletionPromises = [];

              for (const file of files) {
                deletionPromises.push(FileUtil.deletePath(PICTURE_DIRECTORY + '/' + file));
              }

              Promise.all(deletionPromises)
                .then(() => {
                  resolve({});
                })
                .catch(() => {
                  reject();
                });
            }
          })
          .catch(() => {
            reject();
          });
      };

      FileUtil.pathExists(PICTURE_DIRECTORY)
        .then((exists) => {
          if (exists) {
            clearDirectory();
          } else {
            FileUtil.createDirectory(PICTURE_DIRECTORY)
              .then(() => {
                clearDirectory();
              })
              .catch(() => {
                reject();
              });
          }
        })
        .catch(() => reject());
    });
  }

  _downloadPicture(answerPicture: AnswerPicture): Promise<unknown> {
    return new Promise((resolve, reject) => {
      AnswerPictureService.getAnswerPicture(answerPicture._id).then((response) => {
        if (response.success) {
          FileUtil.downloadFile(
            response.data.answerPicture.url,
            PICTURE_DIRECTORY + '/' + answerPicture.fileName
          ).promise.then((downloadResult) => {
            if (downloadResult.statusCode === 200) {
              this.answerPicturePaths[answerPicture._id] = {
                path: PICTURE_DIRECTORY + '/' + answerPicture.fileName
              };

              resolve({});
            } else {
              reject();
            }
          });
        } else {
          reject();
        }
      });
    });
  }

  _deleteOldVotings(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        VotingSyncQueue.getInstance().flushQueue();

        resolve({});
      } catch {
        reject();
      }
    });
  }
}

export default DownloadSurveyJob;
