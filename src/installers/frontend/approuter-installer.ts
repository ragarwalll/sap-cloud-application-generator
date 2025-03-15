import {
    type AvailablePackagesMap,
    type Boilerplate,
} from '@ragarwal06/sap-cloud-application-generator-types';
import { generatePackageTemplatePath } from '@/utils/packages/packages.js';
import path from 'path';
import { type MTAModule } from '@/installers/mta/schema.js';
import {
    MODULE_TYPE,
    UI_REPO_RUNTIME,
    XSUAA_INSTANCE_NAME,
} from '@/installers/mta/mta-constants.js';
import {
    type Package,
    type PackageOptions,
    type PackageUIDependents,
} from '@/installers/base-installer.js';
import { scaffoldModulesUsingMS } from '@/utils/handlerbar/build.js';
import { generateProjectId } from '@/utils/packages/frontend-packages.js';
import { runNodePackageManager } from '@/flags-manager/package-installer.js';
import { type MessageSenderEvent } from '@/scaffold/message-sender.js';
import { generateProjectNameAndPath } from '@/utils/project-path.js';
export class ApprouterPackage implements PackageUIDependents {
    name;
    boilerplate;
    options;
    displayName;
    constructor(boilerplate: Boilerplate, options: PackageOptions) {
        const { appName } = generateProjectNameAndPath(boilerplate.appName);
        this.name = `${appName}-approuter`;
        this.boilerplate = boilerplate;
        this.options = options;
        this.displayName = 'Approuter';
    }

    public async scaffold() {
        const templateSource = generatePackageTemplatePath({
            packageName: 'approuter',
            packageType: 'frontend',
            packageRoot: this.options.packageRoot,
        });
        let metalsmithData = {
            projectName: this.name,
            projectVersion: '0.0.1',
            uiProjectId: getUIMetadata(this.boilerplate),
        };
        let authenticationType = 'none';
        const destinations: unknown[] = [];

        if (this.boilerplate.enableXSUAA) {
            authenticationType = 'xsuaa';
            metalsmithData = Object.assign(
                {
                    xsuaa: true,
                },
                metalsmithData,
            );
        }

        Object.keys(this.boilerplate.packages).forEach((key) => {
            const pkg =
                this.boilerplate.packages[key as keyof AvailablePackagesMap];

            if (pkg?.type === 'backend') {
                destinations.push({
                    packageName: key,
                    authenticationType,
                });
            }
        });

        metalsmithData = Object.assign(
            {
                destinations,
                authenticationType,
            },
            metalsmithData,
        );

        await scaffoldModulesUsingMS(this.name, {
            metadata: metalsmithData,
            destination: path.resolve(
                this.options.dir,
                'frontend',
                'approuter',
            ),
            source: templateSource,
        });
        return Promise.resolve(true);
    }

    public mtaEntry(
        boilerplate: Boilerplate,
        packageInstallerMap: Package[],
    ): MTAModule {
        //filter backend modules
        const backendModules = packageInstallerMap.filter(
            (e) => e.type === 'backend',
        );

        const { appName } = generateProjectNameAndPath(boilerplate.appName);

        // approuter requires ui module
        const requires = [
            {
                name: UI_REPO_RUNTIME.replace('{{appName}}', appName),
            },
        ];

        // add xsuaa instance if enabled
        if (boilerplate.enableXSUAA) {
            requires.push({
                name: XSUAA_INSTANCE_NAME.replace('{{appName}}', appName),
            });
        }

        // add backend modules destinations
        const destinations = backendModules.map((e) => {
            return {
                name: `${e.packageName}-destination`,
                group: 'destinations',
                properties: {
                    name: `${e.packageName}-destination`,
                    url: '~{url}',
                    forwardAuthToken: boilerplate.enableXSUAA ? true : false,
                },
            };
        });

        return {
            name: `approuter-${appName}`,
            type: MODULE_TYPE.NODEJS,
            path: 'frontend/approuter',
            requires: [...requires, ...destinations],
        };
    }

    public async installDependencies(
        eventMapper: Map<MessageSenderEvent, (data: string) => void>,
    ): Promise<void> {
        await runNodePackageManager(
            path.resolve(this.options.dir, 'frontend', 'approuter'),
            eventMapper,
        );
    }
}

export const getUIMetadata = (boilerplate: Boilerplate) => {
    const { ui5, react } = boilerplate.packages;
    if (ui5) return generateProjectId(ui5.metadata, 'ui5');
    if (react) return generateProjectId(react.metadata, 'react');
    return '';
};
