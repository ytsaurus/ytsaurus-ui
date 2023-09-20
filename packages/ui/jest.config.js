module.exports = {
    verbose: true,
    testEnvironment: 'node',
    setupFilesAfterEnv: ['jest-extended'],
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
