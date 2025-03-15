export const MODULE_TYPE = {
    NODEJS: 'javascript.nodejs',
    TOMCAT: 'java.tomcat',
    PYTHON: 'python',
    HTML5: 'html5',
    DEPLOYER: 'com.sap.html5.application-content',
};

export const RESOURCE_TYPE = {
    MANAGED_SERVICE: 'org.cloudfoundry.managed-service',
};

export const SERVICE_NAME = {
    XSUAA: 'xsuaa',
    HTML5_APP_REPO: 'html5-apps-repo',
};
export const SERVICE_PLAN = {
    APPLICATION: 'application',
    APP_HOST: 'app-host',
    APP_RUNTIME: 'app-runtime',
};

export const XSUAA_INSTANCE_NAME = '{{appName}}-xsuaa';
export const UI_REPO_HOST = '{{appName}}-ui-repo-host';
export const UI_REPO_RUNTIME = '{{appName}}-ui-repo-runtime';
