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
    try {
        // ESM-safe
        // @ts-expect-error import.meta is not defined in CJS
        const isESM = typeof import.meta !== 'undefined';

        // @ts-expect-error import.meta is not defined in CJS
        if (isESM && import.meta.url) {
            return path.resolve(
                // @ts-expect-error import.meta is not defined in CJS
                path.dirname(fileURLToPath(import.meta.url)),
                '../',
            );
        }
    } catch {
        // Fallback for CJS
        if (typeof __dirname !== 'undefined') {
            return path.resolve(__dirname, '../');
        }
    }

    // Final fallback
    return process.cwd();
};

export const PACKAGE_ROOT = getPackageRoot();
