export enum likeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}
export enum token {
  accessToken = 'accessToken',
  refreshToken = 'refreshToken',
}

export enum playerStatic {
  'sumScore' = 'scores',
  'avgScores' = 'avgScores',
  'gamesCount' = 'games',
  'winsCount' = 'wins',
  'lossesCount' = 'losses',
  'drawsCount' = 'draws',
}

export enum BanStatusForAdminPagination {
  'all' = 'all',
  'banned' = 'banned',
  'notBanned' = 'notBanned',
}

export enum SettingsImageBackgroundWallpaperForBlog {
  size = 102400, //100kb
  width = 1028,
  height = 312,
}
export enum ImageFormatBackgroundWallpaperForBlog {
  png = 'png',
  jpeg = 'jpeg',
  jpg = 'jpg',
}
export enum SettingsImageMainForBlog {
  size = 102400, //100kb
  width = 156,
  height = 156,
}
export enum ImageFormatMainForBlog {
  png = 'png',
  jpeg = 'jpeg',
  jpg = 'jpg',
}
export enum SettingsImageMainForPost {
  size = 102400, //100kb
  width = 940,
  height = 432,
}
export enum ImageFormatMainForPost {
  png = 'png',
  jpeg = 'jpeg',
  jpg = 'jpg',
}
export enum ImageFormat {
  png = 'png',
  jpeg = 'jpeg',
  jpg = 'jpg',
}
export enum ImagePurpose {
  wallpaper = 'wallpaper',
  main = 'main',
}
//	[
// nullable: true
// Must contain original photo size (940x432) and middle photo (300x180) and small (149x96)
export enum SettingsExamplarImageMainForPost {
  middleWidth = 300,
  middleHeight = 180,
  smallWidth = 149,
  smallHeight = 96,
}
//Todo звчем инжект сделан ввообще и почему класс
export class CustomUploadImageValidatorOptionsType {
  fileType: string[];
  imageSize: number;
  imageWidth: number;
  imageHeight: number;
}
