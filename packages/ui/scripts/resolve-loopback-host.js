/* eslint-env node */

const {lookup} = require('node:dns/promises');
const {isIP} = require('node:net');

function isLoopback({address}) {
    return address === '::1' || (isIP(address) === 4 && address.startsWith('127.'));
}

async function resolveLoopbackHost() {
    const url = new URL(process.env.BASE_URL);
    const urlHostname = url.hostname.replace(/^\[|\]$/g, '');
    if (isIP(urlHostname)) {
        return;
    }

    const addresses = await lookup(urlHostname, {all: true});
    if (!addresses.some(isLoopback)) {
        return;
    }

    process.stdout.write(`${urlHostname}\n`);
}

resolveLoopbackHost().catch((error) => {
    process.stderr.write(`Cannot resolve BASE_URL: ${error.message}\n`);
    process.exitCode = 1;
});
