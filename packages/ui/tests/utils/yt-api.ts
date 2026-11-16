// @ts-expect-error The wrapper does not provide TypeScript declarations.
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {BASE_URL, CLUSTER} from './index';

const proxy = new URL(`${BASE_URL}/api/yt/${CLUSTER}`);

yt.setup.setGlobalOption('proxy', `${proxy.host}${proxy.pathname}`);
yt.setup.setGlobalOption('secure', proxy.protocol === 'https:');
// Requests go through the UI API, which handles proxy selection.
yt.setup.setGlobalOption('useHeavyProxy', false);
// Node's Buffer encodes UTF-8 directly; the wrapper's browser encoder encodes it twice.
yt.setup.setGlobalOption('encodedParametersSettings', {
    encoder: (value: string) => Buffer.from(value, 'utf8').toString('base64'),
});

export const ytApi = yt.v3;
