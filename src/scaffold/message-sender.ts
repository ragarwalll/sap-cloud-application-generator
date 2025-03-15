import path from 'path';
import {
    generateProjectNameAndPath,
    PACKAGE_ROOT,
} from '@/utils/project-path.js';
import { generatePackageInstallerMap } from '@/utils/packages/generator-package.js';
import { getConsumerPackageManager } from '@/utils/consumer-details.js';
import { scaffoldMTA } from '@/installers/mta/mta-installer.js';
import { ApprouterPackage } from '@/installers/frontend/approuter-installer.js';
import { DeployerPackage } from '@/installers/frontend/deployer-installer.js';
import { generateWithMetalsmith } from '@/utils/handlerbar/build.js';
import {
    type PackageUIDependents,
    type PackageOptions,
} from '@/installers/base-installer.js';
import { type Boilerplate } from '@ragarwal06/sap-cloud-application-generator-types';
import { installDependencies } from '@/flags-manager/package-installer.js';

export type MessageSenderEvent = 'msg' | 'error' | 'end';

interface MessageSenderArgs {
    boilerplate: Boilerplate;
    projectDirectory: string;
    packageRoot: string;
    start: () => Promise<void>;
    on: (event: MessageSenderEvent, callback: (data: string) => void) => void;
}

export class Scaffold implements MessageSenderArgs {
    boilerplate;
    projectDirectory;
    packageRoot;
    eventMapper = new Map<MessageSenderEvent, (data: string) => void>();
    constructor(
        boilerplate: Boilerplate,
        projectDirectory = '',
        packageRoot = '',
    ) {
        this.boilerplate = boilerplate;
        this.projectDirectory = projectDirectory;
        this.packageRoot = packageRoot === '' ? PACKAGE_ROOT : packageRoot;

        const dummyFn = (_: string) => {
            console.log('');
        };

        // map the events
        this.eventMapper.set('msg', dummyFn);
        this.eventMapper.set('error', dummyFn);
        this.eventMapper.set('end', dummyFn);
    }
    public async start() {
        this.eventMapper.get('msg')?.('Preparing scaffolder...');
        try {
            const { path: projectDir, appName } = generateProjectNameAndPath(
                this.boilerplate.appName,
            );
            if (this.projectDirectory == '')
                this.projectDirectory = path.resolve(process.cwd(), projectDir);
            const packageManager = getConsumerPackageManager();
            const packageOptions: PackageOptions = {
                dir: this.projectDirectory,
                noInstall: true,
                packageManager,
                packageRoot: this.packageRoot,
            };
            const packageInstallerMap = generatePackageInstallerMap(
                packageOptions,
                this.boilerplate,
            );
            const uiDependentPackages: PackageUIDependents[] = [];

            // scaffold for approuter & deployer if ui modules are present
            if (
                packageInstallerMap.filter((e) => e.type === 'frontend')
                    .length > 0
            ) {
                uiDependentPackages.push(
                    new ApprouterPackage(this.boilerplate, packageOptions),
                );
                uiDependentPackages.push(
                    new DeployerPackage(this.boilerplate, packageOptions),
                );
            }
            // generate project directory for each package
            for (const pkg of packageInstallerMap) {
                this.eventMapper.get('msg')?.(
                    `Generating ${pkg.displayName}...`,
                );
                if (!(await pkg.scaffold()))
                    return this.eventMapper.get('error')?.(
                        `${pkg.displayName}: Error while scaffolding`,
                    );
            }

            // generate project directory for ui dependent module
            this.eventMapper.get('msg')?.('Generating approuter & deployer...');
            for (const pkg of uiDependentPackages) {
                if (!(await pkg.scaffold()))
                    return this.eventMapper.get('error')?.(
                        `${pkg.displayName}: Error while scaffolding`,
                    );
            }

            // scaffold the xs-security.json file
            if (this.boilerplate.enableXSUAA) {
                await generateWithMetalsmith({
                    metadata: {
                        projectName: appName,
                    },
                    destination: this.projectDirectory,
                    source: path.join(
                        this.packageRoot,
                        `templates/base/others`,
                    ),
                });
            }

            if (this.boilerplate.enableCloudMTASupport) {
                // Prepare the mta.yaml file
                this.eventMapper.get('msg')?.('Generating mtad.yaml...');
                scaffoldMTA({
                    boilerplate: this.boilerplate,
                    packageInstallerMap,
                    uiDependentPackages,
                    packageOptions,
                });
            }

            if (!this.boilerplate.flags.noInstall)
                await installDependencies(
                    {
                        packageInstallerMap,
                        uiDependentPackages,
                    },
                    this.eventMapper,
                );
            return this.eventMapper.get('end')?.('Scaffolding completed');
        } catch (e: unknown) {
            if (e instanceof Error)
                return this.eventMapper.get('error')?.(
                    `Error while scaffolding - ${e.message}}`,
                );
            return this.eventMapper.get('error')?.(
                `Error while scaffolding - ${JSON.stringify(e)}`,
            );
        }
    }

    public on(event: MessageSenderEvent, callback: (data: string) => void) {
        this.eventMapper.set(event, callback);
    }
}
