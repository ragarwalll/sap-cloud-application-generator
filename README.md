# SAP Cloud Application Generator Core

[![NPM Version](https://img.shields.io/npm/v/@ragarwal06/sap-cloud-application-generator)](https://www.npmjs.com/package/@ragarwal06/sap-cloud-application-generator) [![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

The core engine powering both the CLI and VS Code extension generators for SAP Cloud applications. Orchestrates template rendering, file system operations, and configuration stitching to produce a complete boilerplate project.

---

## 🚀 Features

- Template-driven scaffolding using [Handlebars](https://handlebarsjs.com/)  
- Dynamic rendering of frontend, backend, and service modules  
- Extensible template registry & hook system  
- Built-in support for UI5, React, Node.js, and Spring Boot stacks  
- Automatic generation of:
  - `package.json` / `pom.xml`
  - Deployment descriptors (`mta.yaml`, `xs-app.json`, `manifest.yml`)
- Pluggable file transformers and post-generation hooks

## 🎯 Installation

```bash
npm install @ragarwal06/sap-cloud-application-generator-core
# or
yarn add @ragarwal06/sap-cloud-application-generator-core
```

## 📄 License

ISC License. See [LICENSE](LICENSE) for details.
