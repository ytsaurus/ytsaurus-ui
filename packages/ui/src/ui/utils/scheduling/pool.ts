import {ROOT_POOL_NAME} from '../../constants/scheduling';

export function isAbcPoolName(name?: string) {
    return name?.startsWith('abc:');
}

export function isTopLevelPool(pool?: {parent?: string}) {
    const {parent} = pool || {};

    return parent === ROOT_POOL_NAME;
}
