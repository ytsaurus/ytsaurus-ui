import {expose} from './promisified-worker';
import {parseAccountData} from '../utils/accounts/accounts-selector';
import _ from 'lodash';

function parseAccounts(data: Array<unknown>) {
    return _.map(data, (item) => parseAccountData(item));
}

const workerFunctions = {parseAccounts};

expose(workerFunctions);

export type ParseAccountsFunctions = typeof workerFunctions;
