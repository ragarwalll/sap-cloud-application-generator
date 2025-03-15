import { availableFrontendPackages } from '@ragarwal06/sap-cloud-application-generator-types';
import { generateProjectId } from '@/utils/packages/frontend-packages.js';
import { type PackageArgs } from '@/installers/base-installer.js';
import { generatePackageTemplatePath } from '@/utils/packages/packages.js';
import path from 'path';
import {
    BasePackage,
    generateUIDestinations,
} from '@/installers/base-package.js';

const { ui5 } = availableFrontendPackages;

export class UI5Package extends BasePackage {
    constructor(packageArgs: PackageArgs) {
        super(packageArgs, ui5);
    }

    public override async scaffold() {
        const templateSource = generatePackageTemplatePath({
            packageName: 'ui5',
            packageType: 'frontend',
            packageRoot: this.options.packageRoot,
        });
        let metalsmithData = {
            projectName: this.name,
            projectNamespace: this.namespace,
            projectVersion: '0.0.1',
            projectResourceRoots: `${this.namespace.split('.').join('/')}/${
                this.name
            }`,
            projectId: generateProjectId(this.metadata, 'ui5'),
        };

        if (this.boilerplate.enableXSUAA)
            metalsmithData = Object.assign(
                {
                    defaultEnv: 'default-env.json',
                    xsuaa: true,
                },
                metalsmithData,
            );

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
