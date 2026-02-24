/* eslint-env commonjs */

// @ts-ignore
import hammerExt from '@ytsaurus/interface-helpers/lib/hammer';

import format from './format';

export const hammer = Object.assign({}, hammerExt, {
    format,
});
