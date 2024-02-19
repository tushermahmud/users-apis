import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/**/*.test.ts"],
  setupFiles: ['dotenv/config'],
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  verbose: true,
  forceExit: true,
};

export default config;
