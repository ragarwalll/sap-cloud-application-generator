import {
    type Boilerplate,
    availableBackendPackages,
} from '@ragarwal06/sap-cloud-application-generator-types';
import { type PackageArgs } from '@/installers/base-installer.js';
import path from 'path';
import { BasePackage } from '@/installers/base-package.js';
import { type MTAModule } from '@/installers/mta/schema.js';
import { MODULE_TYPE } from '@/installers/mta/mta-constants.js';
import { generatePackageTemplatePath } from '@/utils/packages/packages.js';

const { nodejs } = availableBackendPackages;

export class NodeJSPackage extends BasePackage {
    constructor(packageArgs: PackageArgs) {
        super(packageArgs, nodejs);
    }

    public override async scaffold() {
        const templateSource = generatePackageTemplatePath({
            packageName: 'nodejs',
            packageType: 'backend',
            packageRoot: this.options.packageRoot,
        });
        let metalsmithData = {
            projectName: this.name,
            projectVersion: '0.0.1',
        };

        if (this.boilerplate.enableXSUAA)
            metalsmithData = Object.assign(
                {
                    xsuaaAuth: 'xsuaa-auth.ts',
                    xsuaaRole: 'xsuaa-role.ts',
                    xssecDeclaration: 'sap__xssec.d.ts',
                    xsuaa: true,
                },
                metalsmithData,
            );

        await super.scaffold({
            metadata: metalsmithData,
            destination: path.resolve(this.options.dir, 'backend'),
            source: templateSource,
        });
        return Promise.resolve(true);
    }

    public override mtaEntry(boilerplate: Boilerplate): MTAModule {
        return Object.assign(super.mtaEntry(boilerplate), {
            type: MODULE_TYPE.NODEJS,
            'build-parameters': {
                ignore: [
                    'node_modules/',
                    'tests/',
                    '.env',
                    '.editorconfig',
                    '.eslintignore',
                    '.eslintrc.json',
                    '.gitattributes',
                    '.gitignore',
                    '.lintstagedrc.json',
                    '.prettierignore',
                    '.prettierrc.json',
                    'jest.config.ts',
                    'src/',
                ],
                builder: 'custom',
                commands: ['npm install', 'npm run build'],
            },
        });
    }
}
