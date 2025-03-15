import { availableFrontendPackages } from '@ragarwal06/sap-cloud-application-generator-types';

import { generateProjectId } from '@/utils/packages/frontend-packages.js';
import { type PackageArgs } from '@/installers/base-installer.js';
import { generatePackageTemplatePath } from '@/utils/packages/packages.js';
import path from 'path';
import {
    BasePackage,
    generateUIDestinations,
} from '@/installers/base-package.js';

const { react } = availableFrontendPackages;

export class ReactPackage extends BasePackage {
    constructor(packageArgs: PackageArgs) {
        super(packageArgs, react);
    }

    public override async scaffold() {
        const templateSource = generatePackageTemplatePath({
            packageName: 'react',
            packageType: 'frontend',
            packageRoot: this.options.packageRoot,
        });
        let metalsmithData = {
            projectName: this.name,
            projectVersion: '0.0.1',
            projectId: generateProjectId(this.metadata, 'react'),
            manifest: 'manifest.json',
            authenticationType: 'none',
        };

        if (this.boilerplate.enableXSUAA) {
            metalsmithData = Object.assign(
                {
                    xsuaa: true,
                    authenticationType: 'xsuaa',
                },
                metalsmithData,
            );
        }

        metalsmithData = Object.assign(
            generateUIDestinations(this.boilerplate),
            metalsmithData,
        );

        await super.scaffold({
            metadata: metalsmithData,
            destination: path.resolve(this.options.dir, 'frontend'),
            source: templateSource,
        });
        return Promise.resolve(true);
    }
}
