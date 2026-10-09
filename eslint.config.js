import js from "@eslint/js";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores(["node_modules/"]),
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                // Loaded from CDN in index.html
                L: "readonly",
                Localbase: "readonly",
            },
        },
    },
    {
        files: ["serviceWorker.js"],
        languageOptions: {
            globals: { ...globals.serviceworker },
        },
    },
    {
        files: ["eslint.config.js"],
        languageOptions: {
            globals: { ...globals.node },
        },
    },
]);
