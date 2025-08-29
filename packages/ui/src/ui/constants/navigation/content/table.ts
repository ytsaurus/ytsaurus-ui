import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION, Tab.CONTENT, 'TABLE');

export const GET_TABLE_DATA = createActionTypes(`${PREFIX}GET_TABLE_DATA`);
export const SET_SUPPORTED_CLUSTERS = `${PREFIX}SET_SUPPORTED_CLUSTERS`;
export const SET_COLUMNS = `${PREFIX}SET_COLUMNS`;
export const SET_COLUMNS_ORDER = `${PREFIX}SET_COLUMNS_ORDER`;
export const SET_OFFSET = `${PREFIX}SET_OFFSET`;
export const MOVE_OFFSET = `${PREFIX}MOVE_OFFSET`;
export const OPEN_OFFSET_SELECTOR_MODAL = `${PREFIX}OPEN_OFFSET_SELECTOR_MODAL`;
export const CLOSE_OFFSET_SELECTOR_MODAL = `${PREFIX}CLOSE_OFFSET_SELECTOR_MODAL`;
export const OPEN_COLUMN_SELECTOR_MODAL = `${PREFIX}OPEN_COLUMN_SELECTOR_MODAL`;
export const CLOSE_COLUMN_SELECTOR_MODAL = `${PREFIX}CLOSE_COLUMN_SELECTOR_MODAL`;
export const TOGGLE_FULL_SCREEN = `${PREFIX}TOGGLE_FULL_SCREEN`;
export const CHANGE_PAGE_SIZE = `${PREFIX}CHANGE_PAGE_SIZE`;
export const CHANGE_CELL_SIZE = `${PREFIX}CHANGE_CELL_SIZE`;

export const SET_TABLE_COLUMNS_PRESET = `${PREFIX}SET_TABLE_COLUMN_PRESETS`;
export const SET_TABLE_COLUMNS_PRESET_HASH = `${PREFIX}SET_TABLE_PRESET_HASH`;

export const OVERVIEW_HEIGHT = 48;

export const cellSizeRadioButtonItems = [
    {value: String(1024), text: '1 KiB'},
    {value: String(16 * 1024), text: '16 KiB'},
    {value: String(32 * 1024), text: '32 KiB'},
    {value: String(64 * 1024), text: '64 KiB'},
];
export const pageSizeRadioButtonItems = [
    {value: String(10), text: '10'},
    {value: String(50), text: '50'},
    {value: String(100), text: '100'},
    {value: String(200), text: '200'},
];

export const LOAD_TYPE = {
    PRELOAD: 'preload',
    UPDATE: 'update',
};

export const TABLE_MOUNT_CONFIG = createActionTypes('TABLE_MOUNT_CONFIG');
