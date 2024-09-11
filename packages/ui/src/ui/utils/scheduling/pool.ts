import {ROOT_POOL_NAME} from '../../constants/scheduling';
import type {PoolInfo} from '../../store/selectors/scheduling/scheduling-pools';

export function isAbcPoolName(name?: string) {
    return name?.startsWith('abc:');
}

export function isTopLevelPool(pool?: PoolInfo) {
    const {parent} = pool || {};

    return parent === ROOT_POOL_NAME;
}
