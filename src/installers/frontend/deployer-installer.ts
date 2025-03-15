import { type Boilerplate } from '@ragarwal06/sap-cloud-application-generator-types';
import { generatePackageTemplatePath } from '@/utils/packages/packages.js';
import path from 'path';
import { type MTAModule } from '@/installers/mta/schema.js';
import { MODULE_TYPE, UI_REPO_HOST } from '@/installers/mta/mta-constants.js';
import {
    type Package,
    type PackageOptions,
    type PackageUIDependents,
} from '@/installers/base-installer.js';
import { scaffoldModulesUsingMS } from '@/utils/handlerbar/build.js';
import { runNodePackageManager } from '@/flags-manager/package-installer.js';
import { type MessageSenderEvent } from '@/scaffold/message-sender.js';
import { generateProjectNameAndPath } from '@/utils/project-path.js';

export class DeployerPackage implements PackageUIDependents {
    name;
    boilerplate;
    options;
    displayName;
    constructor(boilerplate: Boilerplate, options: PackageOptions) {
        const { appName } = generateProjectNameAndPath(boilerplate.appName);
        this.name = `${appName}-deployer`;
        this.boilerplate = boilerplate;
        this.options = options;
        this.displayName = 'Deployer';
    }

    public async scaffold() {
        const templateSource = generatePackageTemplatePath({
            packageName: 'deployer',
            packageType: 'frontend',
            packageRoot: this.options.packageRoot,
        });
        const metalsmithData = {
            projectName: this.name,
            projectVersion: '0.0.1',
        };

        await scaffoldModulesUsingMS(this.name, {
            metadata: metalsmithData,
            destination: path.resolve(this.options.dir, 'frontend', 'deployer'),
            source: templateSource,
        });
        return Promise.resolve(true);
    }

    public mtaEntry(
        boilerplate: Boilerplate,
        packageInstallerMap: Package[],
    ): MTAModule {
        //filter backend modules
        const uiModules = packageInstallerMap.filter(
            (e) => e.type === 'frontend',
        );

        const { appName } = generateProjectNameAndPath(boilerplate.appName);

        return {
            name: `deployer-${appName}`,
            type: MODULE_TYPE.DEPLOYER,
            path: 'frontend/deployer',
            requires: [
                {
                    name: UI_REPO_HOST.replace('{{appName}}', appName),
                },
            ],
            'build-parameters': {
                requires: uiModules.map((e) => {
                    return {
                        name: `${e.packageName}-${appName}`,
                        artifacts: ['dist'],
                        'target-path': 'resources/',
                    };
                }),
            },
        };
    }
    public async installDependencies(
        eventMapper: Map<MessageSenderEvent, (data: string) => void>,
    ): Promise<void> {
        await runNodePackageManager(
            path.resolve(this.options.dir, 'frontend', 'deployer'),
            eventMapper,
        );
    }
}
