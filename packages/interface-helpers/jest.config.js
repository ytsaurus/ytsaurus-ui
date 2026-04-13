/* eslint-env node */
process.env.TZ = 'UTC';

module.exports = {
    moduleDirectories: ['node_modules', 'lib'],
    moduleFileExtensions: ['js'],
    testMatch: ['<rootDir>/lib/**/*.spec.js'],
    transform: {},
};
