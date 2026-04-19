import type { Config } from "jest";

const config: Config = {
  // Use ts-jest to handle TypeScript
  preset: "ts-jest",

  // Simulate a browser-like environment
  testEnvironment: "jest-environment-jsdom",

  // Run @testing-library/jest-dom matchers before every test file
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Resolve @/ path alias to match tsconfig.json
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Stub out CSS / SCSS imports
    "\\.(css|scss|sass|less)$": "<rootDir>/__mocks__/styleMock.js",
    // Stub out image / font imports
    "\\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$":
      "<rootDir>/__mocks__/fileMock.js",
  },

  // Where Jest looks for test files
  testMatch: [
    "<rootDir>/__tests__/**/*.test.ts",
    "<rootDir>/__tests__/**/*.test.tsx",
    "<rootDir>/src/**/*.test.ts",
    "<rootDir>/src/**/*.test.tsx",
  ],

  // Collect coverage from non-UI components only
  collectCoverageFrom: [
    "src/components/*.{ts,tsx}",
    "src/components/ui/*.{ts,tsx}",
    "!src/**/*.d.ts",
  ],

  // ts-jest TypeScript options
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          // Relax strict checks just for tests
          strict: false,
        },
      },
    ],
  },

  // Some packages ship ESM and need to be transformed
  transformIgnorePatterns: [
    "/node_modules/(?!(swiper|ssr-window|dom7|lucide-react)/)",
  ],
};

export default config;
