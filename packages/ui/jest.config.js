module.exports = {
    verbose: true,
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['jest-extended', '<rootDir>/src/ui/test-utils/setup-tests.ts'],
    testMatch: ['<rootDir>/src/**/?(*.)spec.{js,jsx,ts,tsx}'],
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    coveragePathIgnorePatterns: [
        '<rootDir>/src/ui/constants/',
        '<rootDir>/src/ui/vendor/',
        '<rootDir>/node_modules/',
    ],
    moduleNameMapper: {
        '^.+\\.s?css$': 'identity-obj-proxy',
        '^yt$': '@ytsaurus/javascript-wrapper/lib/yt',
        '^.+\\.svg$': 'jest-svg-transformer',
    },
    modulePathIgnorePatterns: ['dist', 'build'],
    globals: {
        window: {
            YT: {
                cluster: 'Cluster',
                parameters: {
                    login: 'User',
                },
            },
        },
    },
};
