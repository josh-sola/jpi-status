import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      // These patterns strip ANSI escape codes to compare rendered footer text;
      // the control characters they match are the point, not an oversight.
      "eslint/no-control-regex": "off",
      // pi.on/registerCommand take these methods as plain closures with no `this`.
      "typescript/unbound-method": "off",
    },
    options: { typeAware: true, typeCheck: true },
  },
});
