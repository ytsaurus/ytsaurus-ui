import createActionTypes, {createPrefix} from '../utils';
import {Page} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION);

export const FETCH_SUGGESTIONS = createActionTypes(PREFIX + 'FETCH_SUGGESTIONS');
