/**
 * Jest config for the storefront.
 *
 * Scope (current): unit tests for pure logic in `src/lib/util` and other
 * framework-agnostic helpers. These run in a plain Node environment and need
 * no running backend.
 *
 * Future: component tests (React Testing Library) will require
 * `jest-environment-jsdom` + `@testing-library/*`; end-to-end tests belong in
 * `test/e2e` (Playwright) and are intentionally out of this config.
 */
module.exports = {
  rootDir: ".",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transform: {
    "^.+\\.[jt]sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", tsx: true },
          transform: { react: { runtime: "automatic" } },
        },
      },
    ],
  },
  // Mirror the tsconfig `@/*` -> `./src/*` path alias.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.spec.[jt]s?(x)",
    "<rootDir>/test/**/*.spec.[jt]s?(x)",
  ],
};
