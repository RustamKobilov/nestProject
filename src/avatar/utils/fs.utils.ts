import fs from 'node:fs';

export const readTextFileAsync = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf-8' }, (error, content) => {
      if (error) {
        console.log('error');
        reject(error);
      }
      resolve(content);
    });
  });
};
