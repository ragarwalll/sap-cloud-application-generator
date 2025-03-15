import {
    defaultPackageOptions,
    type PackageArgs,
    parseMetadata,
    type Package,
} from '@/installers/base-installer.js';
import { type MTAModule } from '@/installers/mta/schema.js';
import {
    MODULE_TYPE,
    XSUAA_INSTANCE_NAME,
} from '@/installers/mta/mta-constants.js';
import {
    type Boilerplate,
    type AvailablePackagesMap,
    type PackageMetadata,
} from '@ragarwal06/sap-cloud-application-generator-types';
import {
    type MetalsmithScaffold,
    scaffoldModulesUsingMS,
} from '@/utils/handlerbar/build.js';
import path from 'path';
import { runNodePackageManager } from '@/flags-manager/package-installer.js';
import { type MessageSenderEvent } from '@/scaffold/message-sender.js';
import { generateProjectNameAndPath } from '@/utils/project-path.js';

export class BasePackage implements Package {
    name;
    packageName;
    type;
    displayName;
    namespace;
    options;
    boilerplate;
    metadata = {};

    constructor(
        {
            metadata = {},
            options = defaultPackageOptions,
            boilerplate,
        }: PackageArgs,
        defaults: PackageMetadata,
    ) {
        this.options = options;
        this.metadata = metadata;
        this.boilerplate = boilerplate;
        this.type = defaults.type;
        this.displayName = defaults.displayName;
        const { name, namespace } = parseMetadata(metadata);
        this.name = name;
        this.namespace = namespace;
        this.packageName = defaults.packageName;
    }

    public async scaffold(data?: MetalsmithScaffold): Promise<boolean> {
        return await scaffoldModulesUsingMS(this.name, data);
    }

    public mtaEntry(boilerplate: Boilerplate): MTAModule {
        const { appName } = generateProjectNameAndPath(boilerplate.appName);
        return {
            name: `${this.packageName}-${appName}`,
            path: this.type,
            type: MODULE_TYPE.HTML5,
            'build-parameters':
                this.type === 'frontend'
                    ? {
                          builder: 'custom',
                          commands: ['npm install', 'npm run build'],
                          'supported-platforms': [],
                      }
                    : {},
            requires: boilerplate.enableXSUAA
                ? [
                      {
                          name: XSUAA_INSTANCE_NAME.replace(
                              '{{appName}}',
                              appName,
                          ),
                      },
                  ]
                : [],
            provides:
                this.type === 'backend'
                    ? [
                          {
                              name: `${this.packageName}-destination`,
                              properties: {
                                  url: '${default-url}',
                              },
                          },
                      ]
                    : [],
        };
    }
    public async installDependencies(
        eventMapper: Map<MessageSenderEvent, (data: string) => void>,
    ): Promise<void> {
        await runNodePackageManager(
            path.resolve(this.options.dir, this.type),
            eventMapper,
        );
    }
}

export const generateUIDestinations = (boilerplate: Boilerplate) => {
    const destinations: unknown[] = [];
    let authenticationType = 'none';

    if (boilerplate.enableXSUAA) authenticationType = 'xsuaa';

    // get destinations
    Object.keys(boilerplate.packages).forEach((key) => {
        const pkg = boilerplate.packages[key as keyof AvailablePackagesMap];

        if (pkg?.type === 'backend') {
            destinations.push({
                packageName: key,
                authenticationType,
            });
        }
    });

    return {
        destinations,
        authenticationType,
    };
};
