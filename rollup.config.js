import dts from 'rollup-plugin-dts';
import copy from 'rollup-plugin-copy';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

const pathAliases = { '@/*': ['./src/*'] };

const jsConfig = {
    input: 'src/index.ts',
    output: [
        { file: 'dist/cjs/index.js', format: 'cjs', sourcemap: true },
        { file: 'dist/esm/index.js', format: 'esm', sourcemap: true },
    ],
    plugins: [
        json(),
        alias({
            entries: Object.entries(pathAliases).map(([find, rep]) => ({
                find,
                replacement: path.resolve(
                    path.dirname(new URL(import.meta.url).pathname),
                    ...rep
                ),
            }))
        }),
        commonjs(),           // <-- convert CJS deps to CJS
        typescript({          // <-- emits TS → JS, respects format: 'cjs' above
            tsconfig: './tsconfig.json',
            declaration: false,
            sourceMap: true
        }),
        // copy only templates and root package.json
        copy({
            targets: [
                { src: 'templates', dest: 'dist', copyOnce: true },
                { // copy root package.json → dist/package.json
                    src: 'package.json',
                    dest: 'dist',
                    transform: (contents) => {
                        // ensure it still has type:module+exports
                        return contents
                            .toString()
                        // maybe tweak version or tags here if needed
                    }
                }
            ]
        })
    ],
};

const dtsConfig = {
    input: 'src/index.ts',
    plugins: [
        alias({
            entries: Object.entries(pathAliases).map(([find, rep]) => ({
                find,
                replacement: path.resolve(
                    path.dirname(new URL(import.meta.url).pathname),
                    ...rep
                ),
            }))
        }),
        dts({ tsconfig: './tsconfig.json' }),
    ],
    output: {
        format: 'es',
        file: 'dist/index.d.ts',
    },
};

export default [jsConfig, dtsConfig];
