import {expose} from './promisified-worker';
import {parseAccountData} from '../utils/accounts/accounts-selector';

import map_ from 'lodash/map';

function parseAccounts(data: Array<unknown>) {
    return map_(data, (item) => parseAccountData(item));
}

const workerFunctions = {parseAccounts};

expose(workerFunctions);

export type ParseAccountsFunctions = typeof workerFunctions;
