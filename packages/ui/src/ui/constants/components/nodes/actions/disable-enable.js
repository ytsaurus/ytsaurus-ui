import {Tab} from '../../../../constants/components/main';
import createActionTypes, {createPrefix} from '../../../../constants/utils';
import {Page} from '../../../../constants/index';

const PREFIX = createPrefix(Page.COMPONENTS, Tab.NODES);

export const OPEN_DISABLE_MODAL = PREFIX + 'OPEN_DISABLE_MODAL';
export const CLOSE_DISABLE_MODAL = PREFIX + 'CLOSE_DISABLE_MODAL';

export const DISABLE_WRITE_SESSION = createActionTypes(PREFIX + 'DISABLE_WRITE_SESSION');
export const ENABLE_WRITE_SESSION = createActionTypes(PREFIX + 'ENABLE_WRITE_SESSION');

export const DISABLE_TABLET_CELLS = createActionTypes(PREFIX + 'DISABLE_TABLET_CELLS');
export const ENABLE_TABLET_CELLS = createActionTypes(PREFIX + 'ENABLE_TABLET_CELLS');

export const DISABLE_JOBS = createActionTypes(PREFIX + 'DISABLE_JOBS');
export const ENABLE_JOBS = createActionTypes(PREFIX + 'ENABLE_JOBS');

export const WRITE_SESSION = 'write session';
export const TABLET_CELLS = 'tablet cells';
export const JOBS = 'jobs';
