module.exports = {
    verbose: true,
    testEnvironment: 'node',
    testURL: 'http://localhost/',
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

        // source data
        '^components(.*)$': '<rootDir>/src/ui/components$1',
        '^constants/(.*)$': '<rootDir>/src/ui/constants/$1',
        '^containers(.*)$': '<rootDir>/src/ui/containers$1',
        '^hocs(.*)$': '<rootDir>/src/ui/hocs$1',
        '^pages(.*)$': '<rootDir>/src/ui/pages$1',
        '^store(.*)$': '<rootDir>/src/ui/store$1',
        '^styles(.*)$': '<rootDir>/src/ui/styles$1',
        '^utils(.*)$': '<rootDir>/src/ui/utils$1',
        '^img(.*)$': '<rootDir>/src/ui/img$1',
        '^common(.*)$': '<rootDir>src/ui/common$1',
    },
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
