import DataTable, {type Settings} from '@gravity-ui/react-data-table';
import {
    STICKY_DOUBLE_TOOLBAR_BOTTOM,
    STICKY_TOOLBAR_BOTTOM,
} from '../../../../../components/WithStickyToolbar/WithStickyToolbar';

import {block} from './utils';

export const ROW_CLASS_NAME = block('row');

export const UPDATE_TIMEOUT = 600000;

export const TABLE_SETTINGS: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyFooter: DataTable.MOVING,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
    stickyBottom: 0,
    syncHeadOnResize: true,
};

export const TABLE_SETTINGS_DOUBLE_TOOLBAR: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyFooter: DataTable.MOVING,
    stickyTop: STICKY_DOUBLE_TOOLBAR_BOTTOM,
    stickyBottom: 0,
    syncHeadOnResize: true,
};
