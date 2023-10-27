import createActionTypes from './utils';

export const CHYT_LIST = createActionTypes('CHYT_LIST');

export const CHYT_CLIQUE = createActionTypes('CHYT_CLIQUE');

export const CHYT_LIST_FILTERS = 'CHYT_LIST_FILTERS';

export const ChytCliquePageTab = {
    MONITORING: 'monitoring',
    SPECLET: 'speclet',
    ACL: 'acl',
};
