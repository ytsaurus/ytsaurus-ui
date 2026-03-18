import DataTable, {Settings} from '@gravity-ui/react-data-table';

import {HEADER_HEIGHT} from '../../constants';
import {TOOLBAR_COMPONENT_HEIGHT} from '../WithStickyToolbar/Toolbar/Toolbar';

export {HEADER_HEIGHT, TOOLBAR_COMPONENT_HEIGHT};

export const STICKY_TOOLBAR_BOTTOM = HEADER_HEIGHT + TOOLBAR_COMPONENT_HEIGHT;
export const STICKY_DOUBLE_TOOLBAR_BOTTOM = HEADER_HEIGHT + TOOLBAR_COMPONENT_HEIGHT * 2;

export const DATA_TABLE_YT_SETTINGS: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyFooter: DataTable.MOVING,
    stickyTop: HEADER_HEIGHT,
    stickyBottom: 0,
    syncHeadOnResize: true,
    dynamicRender: true,
    sortable: false,
    externalSort: true,
    dynamicRenderScrollParentGetter: () => window as any,
};

export const DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR: Settings = {
    ...DATA_TABLE_YT_SETTINGS,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
};

export const DATA_TABLE_YT_SETTINGS_UNDER_TOOLBAR_DOUBLE_HEIGHT: Settings = {
    ...DATA_TABLE_YT_SETTINGS,
    stickyTop: STICKY_DOUBLE_TOOLBAR_BOTTOM,
};
