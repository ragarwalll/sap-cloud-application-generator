import {
    type PackageUIDependents,
    type Package,
} from '@/installers/base-installer.js';
import { type MessageSenderEvent } from '@/scaffold/message-sender.js';
import {
    getConsumerPackageManager,
    isMavenInstalled,
    isPipInstalled,
    // type PackageManager,
} from '@/utils/consumer-details.js';

interface InstallDependenciesArgs {
    packageInstallerMap: Package[];
    uiDependentPackages: PackageUIDependents[];
}

export const installDependencies = async (
    { packageInstallerMap, uiDependentPackages }: InstallDependenciesArgs,
    eventMapper: Map<MessageSenderEvent, (data: string) => void>,
) => {
    // generate mta module for each package
    for (const pkg of packageInstallerMap) {
        eventMapper.get('msg')?.(`Installing dependencies for ${pkg.name}`);
        await pkg.installDependencies(eventMapper);
    }

    // generate mta module for ui dependent module
    for (const pkg of uiDependentPackages) {
        eventMapper.get('msg')?.(`Installing dependencies for ${pkg.name}`);
        await pkg.installDependencies(eventMapper);
    }
};

export const runNodePackageManager = async (
    dir: string,
    eventMapper: Map<MessageSenderEvent, (data: string) => void>,
) => {
    try {
        await runExeca(
            getConsumerPackageManager(),
            ['install'],
            dir,
            eventMapper,
        );
    } catch (e) {
        console.log(e);
    }
};

export const runPythonPackageManager = async (
    dir: string,
    eventMapper: Map<MessageSenderEvent, (data: string) => void>,
) => {
    // check if pip is installed
    try {
        if (!isPipInstalled(dir))
            eventMapper.get('msg')?.('Skipping! PIP is not installed...');
        await runExeca(
            'pip',
            ['install', '-r', 'requirements.txt'],
            dir,
            eventMapper,
        );
    } catch (e) {
        console.log(e);
    }
};

export const runJavaPackageManager = async (
    dir: string,
    eventMapper: Map<MessageSenderEvent, (data: string) => void>,
) => {
    try {
        if (!isMavenInstalled(dir))
            eventMapper.get('msg')?.('Skipping! Maven is not installed...');
        await runExeca('mvn', ['install'], dir, eventMapper);
    } catch (e) {
        console.log(e);
    }
};

export const runExeca = async (
    cmdName: string,
    args: string[],
    dir: string,
    eventMapper: Map<MessageSenderEvent, (data: string) => void>,
) => {
    try {
        const { execa } = await import('execa');
        const subProcess = execa(cmdName, args, {
            cwd: dir,
            stdout: 'pipe',
        });
        await new Promise<void>((resolve, reject) => {
            subProcess.stdout?.on('data', (data: Buffer) => {
                eventMapper.get('msg')?.(data.toString());
            });
            subProcess.on('err', (err: Error) => {
                reject(err);
            });
            subProcess
                .on('close', () => {
                    resolve();
                })
                .on('err', (err: Error) => {
                    reject(err);
                });
        });
    } catch (_e) {
        console.log(_e);
    }
};
