import { parseMetadata } from '@/installers/base-installer.js';
import {
    type FrontendPackageDefaultsMap,
    type UserInputMetadata,
} from '@ragarwal06/sap-cloud-application-generator-types';

export const generateProjectId = (
    metadata: Record<string, UserInputMetadata>,
    pkg: FrontendPackageDefaultsMap,
) => {
    const { name, namespace } = parseMetadata(metadata);
    switch (pkg) {
        case 'ui5':
            return `${namespace.split('.').join('')}${name}`;
        case 'react':
            return name;
        default:
            return '';
    }
};
