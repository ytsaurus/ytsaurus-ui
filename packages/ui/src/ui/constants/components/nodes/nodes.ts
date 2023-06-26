import _ from 'lodash';

import createActionTypes, {createPrefix} from '../../../constants/utils';
import {makeRadioButtonProps, makeRadioButtonPropsByKey} from '../../../utils';
import {Tab} from '../../../constants/components/main';
import {Page} from '../../../constants/index';
import {NODE_TYPE} from '../../../../shared/constants/system';

const PREFIX = createPrefix(Page.COMPONENTS, Tab.NODES);

export const CHANGE_CONTENT_MODE = `${PREFIX}CHANGE_CONTENT_MODE` as const;
export const GET_NODES = createActionTypes(`${PREFIX}GET_NODES`);
export const GET_NODES_TAGS = createActionTypes(`${PREFIX}GET_NODES_TAGS`);
export const CHANGE_HOST_FILTER = `${PREFIX}CHANGE_HOST_FILTER` as const;
export const CHANGE_NODE_TYPE = `${PREFIX}CHANGE_NODE_TYPE` as const;
export const APPLY_SETUP = 'COMPONENTS_NODES_APPLY_SETUP';

export const COMPONENTS_NODES_UPDATE_NODE = 'COMPONENTS_NODES_UPDATE_NODE';

export const SPLIT_TYPE = 'node-card';
export const COMPONENTS_NODES_TABLE_ID = 'components/nodes';
export const COMPONENTS_NODES_NODE_TABLE_ID = 'components/nodes/node';
export const CONTENT_MODE = {
    DEFAULT: 'default',
    STORAGE: 'storage',
    CPU_AND_MEMORY: 'cpu_and_memory',
    RESOURCES: 'resources',
    TABLETS: 'tablets',
    TABLET_SLOTS: 'tablet_slots',
    CHAOS_SLOTS: 'chaos_slots',
    CUSTOM: 'custom',
} as const;
export const FLAG_STATE = {
    ENABLED: 'enabled',
    DISABLED: 'disabled',
    ALL: 'all',
};

export const CONTENT_MODE_OPTIONS = _.values(CONTENT_MODE);
export const CONTENT_MODE_ITEMS = makeRadioButtonProps(CONTENT_MODE_OPTIONS);
export const POLLING_INTERVAL = 30 * 1000;

export const MEDIUM_COLS_PREFIX = 'medium_';

export const NODE_TYPE_OPTIONS = _.values(NODE_TYPE);
export const NODE_TYPE_ITEMS = makeRadioButtonPropsByKey(NODE_TYPE);
