/* eslint-env node */

const {dependencies} = require('./package.json');
const uiPackage = require('../package.json');

for (const [name, version] of Object.entries(dependencies)) {
    const uiVersion = uiPackage.dependencies?.[name] ?? uiPackage.devDependencies?.[name];

    if (version !== uiVersion) {
        process.stderr.write(
            `${name}: statoscope/package.json has ${version}, UI package.json has ${uiVersion ?? 'no dependency'}\n`,
        );
        process.exitCode = 1;
    }
}
