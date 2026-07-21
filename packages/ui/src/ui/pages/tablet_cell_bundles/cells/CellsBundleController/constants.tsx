import DataTable, {type Settings} from '@gravity-ui/react-data-table';
import {STICKY_TOOLBAR_BOTTOM} from '../../../../components/WithStickyToolbar/WithStickyToolbar';

export const TABLE_SETTINGS: Settings = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
    syncHeadOnResize: true,
    dynamicRender: true,
};
