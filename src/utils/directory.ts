import fs from 'fs-extra';

export const checkIfDirExists = (dir: string) => fs.existsSync(dir);

export const checkIfIsEmpty = (dir: string) =>
    checkIfDirExists(dir) && fs.readdirSync(dir).length === 0;

export const clearDir = (dir: string) => fs.emptyDirSync(dir);
