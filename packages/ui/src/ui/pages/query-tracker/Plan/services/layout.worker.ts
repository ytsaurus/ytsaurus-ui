import {expose} from '../utils/promisified-worker';

import {layoutGraph} from './layout';

const workerFunctions = {layoutGraph};

expose(workerFunctions);

export type LayoutWorkerFunctions = typeof workerFunctions;
