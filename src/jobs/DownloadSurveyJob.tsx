import {AxiosInstance} from 'axios';
import NetInfo from '@react-native-community/netinfo';
import FileUtil from '../util/FileUtil';
import VotingSyncQueue from '../votings/VotingSyncQueue';

export const pictureDirectory = '/pictures';

class DownloadSurveyJob {
  surveyId: string;
  survey: any = null;
  answerPicturePaths: any = {};

  authInstance: AxiosInstance;

  stepCallback: (message: string) => void = () => {};

  constructor(surveyId: string, authInstance: AxiosInstance) {
    this.surveyId = surveyId;
    this.authInstance = authInstance;
  }

  onStepStart(callback: (message: string) => void) {
    this.stepCallback = callback;
  }

  start() {
    return new Promise(async (resolve, reject) => {
      this.stepCallback('Überprüfung der Internetverbindung ...');

      try {
        await this._checkInternetConnection();
      } catch (err) {
        reject({
          message: 'Es besteht keine Verbindung zum Internet!',
          oldRestorable: true,
        });

        return;
      }

      this.stepCallback('Umfrage wird heruntergeladen ...');

      try {
        await this._getSurvey();
      } catch (err) {
        reject({
          message: 'Fehler beim Laden der Umfrage!',
          oldRestorable: true,
        });

        return;
      }

      this.stepCallback('Bilder-Download wird vorbereitet ...');

      try {
        await this._preparePictureDirectory();
      } catch (err) {
        reject({
          message: 'Fehler beim Vorbereiten des Download-Ordners!',
          oldRestorable: false,
        });

        return;
      }

      this.stepCallback('Bilder werden heruntergeladen ...');

      const alreadyAdded: string[] = [];
      const tempAnswerPictures: any[] = [];

      this.survey.questions.forEach((questionObject: any) => {
        questionObject.answerOptions.forEach((answerPictureObject: any) => {
          if (!alreadyAdded.includes(answerPictureObject.picture._id)) {
            tempAnswerPictures.push(answerPictureObject.picture);
            alreadyAdded.push(answerPictureObject.picture._id);
          }
        });
      });

      for (let i in tempAnswerPictures) {
        let downloadNumber = parseInt(i, 10) + 1;

        this.stepCallback(
          'Bilder werden heruntergeladen ... (' +
            parseInt(String(downloadNumber), 10).toString() +
            '/' +
            tempAnswerPictures.length +
            ')',
        );

        try {
          await this._downloadPicture(tempAnswerPictures[i]);
        } catch (err) {
          reject({
            message: 'Fehler beim Laden eines Bildes!',
            oldRestorable: false,
          });

          return;
        }
      }

      this.stepCallback('Alte Abstimmungen werden gelöscht ...');

      try {
        await this._deleteOldVotings();
      } catch (err) {
        reject({
          message: 'Fehler beim Löschen der alten Abstimmungen!',
          oldRestorable: false,
        });

        return;
      }

      resolve({
        surveyId: this.surveyId,
        survey: this.survey,
        answerPicturePaths: this.answerPicturePaths,
      });
    });
  }

  _checkInternetConnection() {
    return new Promise((resolve, reject) => {
      NetInfo.fetch().then(state => {
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

  _getSurvey() {
    return new Promise((resolve, reject) => {
      this.authInstance
        .get(`/surveys/${this.surveyId}`)
        .then(response => {
          this.survey = response.data.survey;

          resolve({});
        })
        .catch(() => {
          reject();
        });
    });
  }

  _preparePictureDirectory() {
    return new Promise((resolve, reject) => {
      const clearDirectory = () => {
        FileUtil.readDirectory(pictureDirectory)
          .then(files => {
            if (files.length === 0) {
              resolve({});
            } else {
              let deletionPromises = [];

              for (let file of files) {
                deletionPromises.push(
                  FileUtil.deletePath(pictureDirectory + '/' + file),
                );
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

      FileUtil.pathExists(pictureDirectory)
        .then(exists => {
          if (exists) {
            clearDirectory();
          } else {
            FileUtil.createDirectory(pictureDirectory)
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

  _downloadPicture(answerPicture: any) {
    return new Promise((resolve, reject) => {
      this.authInstance
        .get('/answer-pictures/' + answerPicture._id)
        .then(response => {
          FileUtil.downloadFile(
            response.data.answerPicture.url,
            pictureDirectory + '/' + answerPicture.fileName,
          ).promise.then(downloadResult => {
            if (downloadResult.statusCode === 200) {
              this.answerPicturePaths[answerPicture._id] = {
                path: pictureDirectory + '/' + answerPicture.fileName,
              };

              resolve({});
            } else {
              reject();
            }
          });
        })
        .catch(() => {
          reject();
        });
    });
  }

  _deleteOldVotings() {
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
