/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'], // Match all .test.ts files under tests/unit
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  collectCoverage: true, // Enable test coverage
  coverageDirectory: '<rootDir>/coverage', // Directory for coverage reports
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/tests/'], // Exclude node_modules and test files from coverage
  verbose: true, // Display detailed test results
};