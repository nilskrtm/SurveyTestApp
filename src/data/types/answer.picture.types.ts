type AnswerPicture = {
  _id: string;
  name: string;
  fileName: string;
  owner: string;
  created: string;
  edited: string;
  // not given by response
  url?: string;
};

type AnswerPictureUrls = { [fileName: string]: string };

type AnswerPicturePaths = { [answerPictureId: string]: { path: string } };

export type { AnswerPicture, AnswerPictureUrls, AnswerPicturePaths };
