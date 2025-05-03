import dts from 'rollup-plugin-dts';
import copy from 'rollup-plugin-copy';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const pathAliases = {
    '@/*': ['./src/*'],
};

const createCommonJsPackage = () => {
    const pkg = { type: 'commonjs' };
    return {
        name: 'cjs-package',
        buildEnd: async () => {
            await mkdir('./dist/cjs', { recursive: true });
            await writeFile(
                './dist/cjs/package.json',
                JSON.stringify(pkg, null, 2),
            );
        },
    };
};

const jsConfig = {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/cjs/index.js',
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: 'dist/esm/index.js',
            format: 'esm',
            sourcemap: true,
        },
    ],
    plugins: [
        json(),
        alias({
            entries: Object.entries(pathAliases).map(([find, replacement]) => ({
                find,
                replacement: path.resolve(
                    path.dirname(new URL(import.meta.url).pathname),
                    ...replacement,
                ),
            })),
        }),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: false,
            declarationMap: false,
            sourceMap: true
        }),
        copy({
            targets: [
                {
                    src: './package.json',
                    dest: 'dist',
                    transform: (contents, _) =>
                        contents.toString().replace(':release', ':r'),
                },
            ],
        }),
        createCommonJsPackage(),
        copy({
            targets: [{ src: 'templates', dest: 'dist', copyOnce: true }],
        }),
    ],
};

const dtsConfig = {
    input: './src/index.ts',
    plugins: [
        alias({
            entries: Object.entries(pathAliases).map(([find, replacement]) => ({
                find,
                replacement: path.resolve(
                    path.dirname(new URL(import.meta.url).pathname),
                    ...replacement,
                ),
            })),
        }),
        dts({
            tsconfig: './tsconfig.json',
        }),
    ],
    output: {
        format: 'es',
        file: './dist/index.d.ts',
    },
};

export default [jsConfig, dtsConfig];
