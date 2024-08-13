import security from "eslint-plugin-security";

export default [
  {
    // Specifies files or directories to ignore during linting
    ignores: ["node_modules/**"], // Ignores all files within the node_modules directory
  },
  {
    // ESLint plugins to use
    plugins: {
      security, // Adds the "security" plugin to ESLint
    },
    rules: {
      // Applies recommended security rules from the "eslint-plugin-security" plugin
      ...security.configs.recommended.rules,
    },
  },
];
