import fs from 'node:fs';
import path from 'node:path';
import { Schema } from 'mongoose';

export const readTextFileAsync = (relativePath: string) => {
  return new Promise((resolve, reject) => {
    //console.log(path.join(__dirname, '..'));
    const rootDirPath = path.join(__dirname, '..');
    //require.main.filename;
    //у димыча до диста, у меня просто на уровень выше
    console.log(rootDirPath, relativePath);
    const pathFinish = path.join(rootDirPath, relativePath);
    console.log(pathFinish);
    fs.readFile(pathFinish, { encoding: 'utf-8' }, (error, content) => {
      if (error) {
        console.log('error');
        reject(error);
      }
      resolve(content);
    });
  });
  ///s3 хранилище
  ///sdk clients3
};
export const saveFileAsync = (relativePath: string, data: Buffer) => {
  return new Promise<void>((resolve, reject) => {
    //console.log(path.join(__dirname, '..'));
    const rootDirPath = path.join(__dirname, '..');
    console.log(rootDirPath);
    //require.main.filename;
    //у димыча до диста, у меня просто на уровень выше
    console.log(rootDirPath, relativePath);
    const pathFinish = path.join(rootDirPath, relativePath);
    console.log(pathFinish);
    fs.writeFile(pathFinish, data, (error) => {
      if (error) {
        console.log('error');
        reject(error);
      }
      resolve();
    });
  });
  ///s3 хранилище
  ///sdk clients3
};

export const checkAndCreateDirectoryAsyncAsync = (relativePath: string) => {
  const rootDirPath = path.join(__dirname, '..');
  const pathFinish = path.join(rootDirPath, relativePath);
  return new Promise<void>((resolve, reject) => {
    if (!fs.existsSync(pathFinish)) {
      fs.mkdirSync(pathFinish, { recursive: true });
    }
    resolve();
  });
};
