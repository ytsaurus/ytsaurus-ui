const process = require('node:process');
const fs = require('node:path');

const [_x, script, action, file] = process.argv;

if (action !== 'check' && action !== 'fix') {
    console.error(`Unexpecte action: ${action}`);
    showHelpAndExit(1);
}

const {PWD} = process.env;

function showHelpAndExit(exitCode) {
    console.log('\nUsage:');
    console.log('\t', process.argv0, fs.relative(PWD, script), 'check', file);
    showFixHelp(exitCode);
}

function showFixHelp(exitCode) {
    console.log('\t', process.argv0, fs.relative(PWD, script), 'fix', file);
    console.log('');
    process.exit(exitCode);
}

const packageJson = require(file.startsWith('/') ? file : PWD + '/' + file);

const {dependencies: deps, devDependencies: dev, peerDependencies: peer} = packageJson;
let needFix = false;
let fixed = false;
Object.keys(peer).forEach((key) => {
    const v = deps[key] ?? dev[key];
    if (key.startsWith('@') && peer[key] !== v) {
        switch (action) {
            case 'check': {
                needFix = true;
                console.error('Peer dependency', key, 'is not synced:', v, '!=', peer[key]);
                break;
            }
            case 'fix': {
                peer[key] = v;
                fixed = true;
            }
        }
    }
});

if (needFix) {
    console.error('\nYou have to fix your peerDependencies');
    process.exit(1);
}

if (fixed) {
    require('node:fs').writeFile(file, JSON.stringify(packageJson, null, 2), () => {});
}
