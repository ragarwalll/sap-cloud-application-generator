import { PACKAGE_NAME } from '@ragarwal06/sap-cloud-application-generator-types';
import { execSync } from 'child_process';

export type PackageManager = 'npm' | 'pnpm' | 'yarn';

export const getConsumerPackageVersion = () => {
    try {
        return execSync(`npm view ${PACKAGE_NAME} version`).toString().trim();
    } catch {
        return null;
    }
};

export const getConsumerPackageManager = (): PackageManager => {
    const pkgManager = process.env.npm_config_user_agent ?? 'npm';

    if (pkgManager.startsWith('pnpm')) return 'pnpm';
    else if (pkgManager.startsWith('yarn')) return 'yarn';
    return 'npm';
};

export const getIsConsumerUsingShell = () => {
    return (
        process.env.SHELL?.toLowerCase().includes('git') &&
        process.env.SHELL?.includes('bash')
    );
};

export const isGitInstalled = (dir: string): boolean => {
    try {
        execSync('git --version', { cwd: dir });
        return true;
    } catch (_e) {
        console.log(_e);
        return false;
    }
};

export const isMavenInstalled = (dir: string): boolean => {
    try {
        execSync('mvn --version', { cwd: dir });
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};

export const isPipInstalled = (dir: string): boolean => {
    try {
        execSync('pip --version', { cwd: dir });
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};
