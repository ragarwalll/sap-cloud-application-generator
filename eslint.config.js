import { Linter } from "eslint";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";

/** @type {Linter.FlatConfig[]} */
export default [
    {
        ignores: ["node_modules/**", "dist", "templates"],
    },
    {
        files: ["src/**/*.ts", "src/**/*.tsx"], // Apply TypeScript parser only to TS files
        languageOptions: {
            parser: tsparser,
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
                project: [
                    "./tsconfig.json",
                    "./tsconfig.base.json",
                    "./tsconfig.eslint.json",
                ],
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            import: importPlugin,
            prettier: prettierPlugin,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...tseslint.configs["recommended-requiring-type-checking"].rules,
            ...prettierPlugin.configs.recommended.rules,
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" } // Ignore unused variables prefixed with "_"
            ],
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],
            "import/consistent-type-specifier-style": ["error", "prefer-inline"],
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unnecessary-type-assertion": "off",
        },
    },
];
