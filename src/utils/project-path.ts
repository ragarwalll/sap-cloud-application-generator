import path from 'path';
import { fileURLToPath } from 'url';

export const generateProjectNameAndPath = (pathWithName: string) => {
    const splitted = pathWithName.split('/');
    let appName = splitted[splitted.length - 1] ?? '';

    // check if user wants to install at current directory
    if (appName === '.' || appName === './') {
        const fullDirectory = path.resolve(process.cwd());
        appName = path.basename(fullDirectory) ?? '';
    }

    // generate the path where the app will be created
    splitted.pop();
    let appDir = splitted.join('/');
    if (appDir.length === 0) appDir = appName;
    else appDir += `/${appName}`;

    return {
        appName,
        path: appDir,
    } as const;
};

export const getPackageRoot = () => {
    let currentModulePath;
    if (typeof __dirname !== 'undefined') {
        // CommonJS (CJS) environment
        currentModulePath = __dirname;
    } else if (
        typeof import.meta !== 'undefined' &&
        typeof import.meta.url !== 'undefined'
    ) {
        // ECMAScript modules (ESM) environment
        currentModulePath = path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            '../',
        );
    } else {
        throw new Error('Unsupported module system');
    }
    return currentModulePath;
};

export const PACKAGE_ROOT = getPackageRoot();
