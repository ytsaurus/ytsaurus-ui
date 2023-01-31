/* eslint-env commonjs */

import hammerExt from '@ytsaurus/interface-helpers/lib/hammer';

import {countValues, prepare} from './hammer/aggregation';
import filter from './hammer/filter';
import format from './hammer/format';
import guid from './hammer/guid';
import stat from './hammer/stat';
import storage from './hammer/storage';
import {tables} from './hammer/tables';
import * as treeList from './hammer/tree-list';
import {utils} from './hammer/utils';
import * as predicate from './hammer/predicate';

const hammer = Object.assign({}, hammerExt, {
    aggregation: {countValues, prepare},
    filter,
    format,
    guid,
    stat,
    storage,
    tables,
    treeList,
    utils,
    predicate,
});

export default hammer;
