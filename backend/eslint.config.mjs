import security from "eslint-plugin-security";

export default [
  {
    ignores: ["node_modules/**"],
  },
  {
    plugins: {
      security,
    },
    rules: {
      ...security.configs.recommended.rules,
    },
  },
];
