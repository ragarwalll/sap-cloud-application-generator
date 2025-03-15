import {
    type Package,
    type PackageUIDependents,
    type PackageOptions,
} from '@/installers/base-installer.js';
import { type Boilerplate } from '@ragarwal06/sap-cloud-application-generator-types';
import {
    type MTAResource,
    type MTAModule,
    type MTASchema,
} from '@/installers/mta/schema.js';
import {
    RESOURCE_TYPE,
    SERVICE_NAME,
    SERVICE_PLAN,
    UI_REPO_HOST,
    UI_REPO_RUNTIME,
    XSUAA_INSTANCE_NAME,
} from './mta-constants.js';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { generateProjectNameAndPath } from '@/utils/project-path.js';

export interface ScaffoldMTAArgs {
    boilerplate: Boilerplate;
    packageInstallerMap: Package[];
    uiDependentPackages: PackageUIDependents[];
    packageOptions: PackageOptions;
}

export const scaffoldMTA = ({
    boilerplate,
    packageInstallerMap = [],
    uiDependentPackages = [],
    packageOptions,
}: ScaffoldMTAArgs) => {
    // generate appName
    const { appName } = generateProjectNameAndPath(boilerplate.appName);

    // generate mta module for each package
    const modules: MTAModule[] = [];

    // generate mta module for each package
    for (const pkg of packageInstallerMap)
        modules.push(pkg.mtaEntry(boilerplate));

    // generate mta module for ui dependent module
    for (const pkg of uiDependentPackages)
        modules.push(pkg.mtaEntry(boilerplate, packageInstallerMap));

    // generate resources for mta
    const resources: MTAResource[] = [];

    if (boilerplate.enableXSUAA)
        resources.push({
            name: XSUAA_INSTANCE_NAME.replace('{{appName}}', appName),
            type: RESOURCE_TYPE.MANAGED_SERVICE,
            parameters: {
                'service-plan': SERVICE_PLAN.APPLICATION,
                service: SERVICE_NAME.XSUAA,
                path: './xs-security.json',
            },
        });

    if (uiDependentPackages.length > 0) {
        // add ui repo runtime
        resources.push({
            name: UI_REPO_RUNTIME.replace('{{appName}}', appName),
            type: RESOURCE_TYPE.MANAGED_SERVICE,
            parameters: {
                'service-plan': SERVICE_PLAN.APP_RUNTIME,
                service: SERVICE_NAME.HTML5_APP_REPO,
            },
        });

        // add ui repo host
        resources.push({
            name: UI_REPO_HOST.replace('{{appName}}', appName),
            type: RESOURCE_TYPE.MANAGED_SERVICE,
            parameters: {
                'service-plan': SERVICE_PLAN.APP_HOST,
                service: SERVICE_NAME.HTML5_APP_REPO,
            },
        });
    }

    const mta: MTASchema = {
        ID: appName,
        '_schema-version': '3.1.0',
        version: '0.0.1',
        parameters: {
            'enable-parallel-deployments': true,
        },
        modules: modules,
        resources: resources,
    };

    // generate mta.yaml
    const destination = path.join(path.resolve(packageOptions.dir), 'mta.yaml');
    fs.writeFileSync(destination, yaml.dump(mta));
};
