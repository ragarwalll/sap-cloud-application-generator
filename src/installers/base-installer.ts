import {
    type UserInputMetadata,
    type Boilerplate,
    type AvailablePackagesType,
} from '@ragarwal06/sap-cloud-application-generator-types';
import { type PackageManager } from '@/utils/consumer-details.js';
import { type MTAModule } from '@/installers/mta/schema.js';
import { type MetalsmithScaffold } from '@/utils/handlerbar/build.js';
import { type MessageSenderEvent } from '@/scaffold/message-sender.js';
import { generateProjectNameAndPath } from '@/utils/project-path.js';

export interface Package {
    readonly type: PackageType;
    readonly displayName: string;
    name: string;
    packageName: AvailablePackagesType;
    namespace: string;
    options: PackageOptions;
    boilerplate: Boilerplate;
    scaffold: (data?: MetalsmithScaffold) => Promise<boolean>;
    mtaEntry: (boilerplate: Boilerplate) => MTAModule;
    installDependencies: (
        eventMapper: Map<MessageSenderEvent, (data: string) => void>,
    ) => Promise<void>;
    metadata: Record<string, UserInputMetadata>;
}

export interface PackageUIDependents {
    name: string;
    displayName: string;
    boilerplate: Boilerplate;
    options: PackageOptions;
    scaffold: (data?: MetalsmithScaffold) => Promise<boolean>;
    mtaEntry: (
        boilerplate: Boilerplate,
        packageInstallerMap: Package[],
    ) => MTAModule;
    installDependencies: (
        eventMapper: Map<MessageSenderEvent, (data: string) => void>,
    ) => Promise<void>;
}

export const packageType = ['frontend', 'backend', 'unknown'] as const;
export type PackageType = (typeof packageType)[number];

export interface PackageOptions {
    dir: string;
    noInstall: boolean;
    packageManager: PackageManager;
    packageRoot: string;
}

export const defaultPackageOptions: PackageOptions = {
    dir: '',
    noInstall: false,
    packageManager: 'npm',
    packageRoot: '',
};

export type PackageArgs = Pick<Package, 'metadata' | 'options' | 'boilerplate'>;

export const parseMetadata = (metadata: Record<string, UserInputMetadata>) => {
    return {
        name:
            generateProjectNameAndPath(metadata?.name?.value ?? '').appName ??
            '',
        namespace: metadata?.namespace?.value ?? '',
    };
};
