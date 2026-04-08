/** @type {import('jest').Config} */
module.exports = {
    verbose: true,
    testEnvironment: 'node',
    preset: 'ts-jest',
    setupFilesAfterEnv: ['jest-extended'],
    testMatch: ['<rootDir>/src/**/?(*.)spec.{js,jsx,ts,tsx}'],
    modulePathIgnorePatterns: ['build'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                diagnostics: false,
            },
        ],
    },
};
