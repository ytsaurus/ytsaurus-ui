// @ts-expect-error The wrapper does not provide TypeScript declarations.
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {BASE_URL, CLUSTER} from './index';

const proxy = new URL(`${BASE_URL}/api/yt/${CLUSTER}`);

yt.setup.setGlobalOption('proxy', `${proxy.host}${proxy.pathname}`);
yt.setup.setGlobalOption('secure', proxy.protocol === 'https:');

export const ytApi = yt.v3;
