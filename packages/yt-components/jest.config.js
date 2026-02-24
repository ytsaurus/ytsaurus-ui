module.exports = {
    verbose: true,
    testEnvironment: 'node',
    preset: 'ts-jest',
    setupFilesAfterEnv: ['jest-extended'],
    testMatch: ['<rootDir>/src/**/?(*.)spec.{js,jsx,ts,tsx}'],
    modulePathIgnorePatterns: ['build'],
};
