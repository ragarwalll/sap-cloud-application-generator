import {
    type Boilerplate,
    availableBackendPackages,
} from '@ragarwal06/sap-cloud-application-generator-types';
import { type PackageArgs } from '@/installers/base-installer.js';
import { generatePackageTemplatePath } from '@/utils/packages/packages.js';
import path from 'path';
import { BasePackage } from '@/installers/base-package.js';
import { type MTAModule } from '@/installers/mta/schema.js';
import { MODULE_TYPE } from '@/installers/mta/mta-constants.js';
import { runJavaPackageManager } from '@/flags-manager/package-installer.js';
import { type MessageSenderEvent } from '@/scaffold/message-sender.js';

const { springboot } = availableBackendPackages;

export class SpringBootPackage extends BasePackage {
    constructor(packageArgs: PackageArgs) {
        super(packageArgs, springboot);
    }

    public override async scaffold() {
        const templateSource = generatePackageTemplatePath({
            packageName: 'springboot',
            packageType: 'backend',
            packageRoot: this.options.packageRoot,
        });
        let metalsmithData = {
            projectName: this.name,
            projectNamespace: this.namespace,
            projectResourceRoots: `${this.namespace.split('.').join('\\')}\\${
                this.name
            }`,
        };

        if (this.boilerplate.enableXSUAA)
            metalsmithData = Object.assign(
                {
                    securityConfiguration: 'SecurityConfiguration',
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
            type: MODULE_TYPE.TOMCAT,
            'build-parameters': {
                'build-result': 'target/*.jar',
                builder: 'custom',
                commands: ['mvn clean package'],
            },
        });
    }

    public override async installDependencies(
        eventMapper: Map<MessageSenderEvent, (data: string) => void>,
    ): Promise<void> {
        await runJavaPackageManager(
            path.resolve(this.options.dir, this.type),
            eventMapper,
        );
    }
}
