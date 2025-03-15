import { type GeneratePackageTemplateArgs } from '@ragarwal06/sap-cloud-application-generator-types';
import path from 'path';

export const generatePackageTemplatePath = ({
    packageName,
    packageRoot,
    packageType,
}: GeneratePackageTemplateArgs) =>
    path.join(packageRoot, `templates/base/${packageType}/${packageName}`);
