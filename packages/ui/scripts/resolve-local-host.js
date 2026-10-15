/* eslint-env node */

const {lookup} = require('node:dns/promises');
const {isIP} = require('node:net');
const {hostname} = require('node:os');

function isLoopback({address}) {
    return address === '::1' || (isIP(address) === 4 && address.startsWith('127.'));
}

async function resolveLocalHost(address) {
    const url = new URL(address.includes('://') ? address : `http://${address}`);
    const urlHostname = url.hostname.replace(/^\[|\]$/g, '');

    if (isIP(urlHostname) || urlHostname === 'localhost' || urlHostname.endsWith('.localhost')) {
        return undefined;
    }

    if (urlHostname !== hostname().toLowerCase()) {
        let addresses;
        try {
            addresses = await lookup(urlHostname, {all: true});
        } catch (error) {
            if (error.code === 'ENOTFOUND') {
                // The container may resolve names unavailable on the host.
                return undefined;
            }
            throw error;
        }

        if (!addresses.some(isLoopback)) {
            return undefined;
        }
    }

    return urlHostname;
}

resolveLocalHost(process.argv[2])
    .then((urlHostname) => {
        if (urlHostname) {
            process.stdout.write(`${urlHostname}\n`);
        }
    })
    .catch((error) => {
        if (error.code === 'EAI_AGAIN') {
            process.stderr.write(
                `Warning: temporary DNS failure; skipping host mapping: ${error.message}\n`,
            );
            return;
        }

        process.stderr.write(`Cannot resolve address: ${error.message}\n`);
        process.exitCode = 1;
    });
