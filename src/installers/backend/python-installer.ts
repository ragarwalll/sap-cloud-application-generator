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
import { runPythonPackageManager } from '@/flags-manager/package-installer.js';
import { type MessageSenderEvent } from '@/scaffold/message-sender.js';

const { python } = availableBackendPackages;

export class PythonPackage extends BasePackage {
    constructor(packageArgs: PackageArgs) {
        super(packageArgs, python);
    }

    public override async scaffold() {
        const templateSource = generatePackageTemplatePath({
            packageName: 'python',
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
                    xsuaaCheck: 'xsuaa_check.py',
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
            type: MODULE_TYPE.PYTHON,
        });
    }

    public override async installDependencies(
        eventMapper: Map<MessageSenderEvent, (data: string) => void>,
    ): Promise<void> {
        await runPythonPackageManager(
            path.resolve(this.options.dir, this.type),
            eventMapper,
        );
    }
}
