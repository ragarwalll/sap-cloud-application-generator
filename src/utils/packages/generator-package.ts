import {
    type PackageArgs,
    type PackageOptions,
    type Package,
} from '@/installers/base-installer.js';
import { UI5Package } from '@/installers/frontend/ui5-installer.js';
import { NodeJSPackage } from '@/installers/backend/nodejs-installer.js';
import { ReactPackage } from '@/installers/frontend/react-installer.js';
import { SpringBootPackage } from '@/installers/backend/springboot-installer.js';
import { PythonPackage } from '@/installers/backend/python-installer.js';
import {
    type Boilerplate,
    type PackageMetadata,
    type AvailablePackagesType,
} from '@ragarwal06/sap-cloud-application-generator-types';

export const generatePackageInstallerMap = (
    options: PackageOptions,
    boilerplate: Boilerplate,
): Package[] => {
    const objects: Package[] = [];
    Object.keys(boilerplate.packages).forEach((e) => {
        const data = e as AvailablePackagesType;
        switch (data) {
            case 'ui5':
                objects.push(
                    new UI5Package(
                        converPackageToPackageArgs(
                            boilerplate.packages.ui5,
                            options,
                            boilerplate,
                        ),
                    ),
                );
                break;
            case 'react':
                objects.push(
                    new ReactPackage(
                        converPackageToPackageArgs(
                            boilerplate.packages.react,
                            options,
                            boilerplate,
                        ),
                    ),
                );
                break;
            case 'springboot':
                objects.push(
                    new SpringBootPackage(
                        converPackageToPackageArgs(
                            boilerplate.packages.springboot,
                            options,
                            boilerplate,
                        ),
                    ),
                );
                break;
            case 'nodejs':
                objects.push(
                    new NodeJSPackage(
                        converPackageToPackageArgs(
                            boilerplate.packages.nodejs,
                            options,
                            boilerplate,
                        ),
                    ),
                );
                break;
            case 'python':
                objects.push(
                    new PythonPackage(
                        converPackageToPackageArgs(
                            boilerplate.packages.python,
                            options,
                            boilerplate,
                        ),
                    ),
                );
                break;
        }
    });
    return objects;
};

export const converPackageToPackageArgs = (
    packages: PackageMetadata | undefined,
    options: PackageOptions,
    boilerplate: Boilerplate,
): PackageArgs => {
    if (packages == undefined) throw new Error();
    return {
        metadata: packages.metadata,
        options: options,
        boilerplate,
    };
};
