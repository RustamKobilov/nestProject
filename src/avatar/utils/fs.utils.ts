import fs from 'node:fs';
import path from 'node:path';

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
