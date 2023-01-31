import {createPrefix} from '../utils';

const DASHBOARD_PREFIX = createPrefix('DASHBOARD');

export const CHANGE_ACTIVE_TAB = DASHBOARD_PREFIX + 'CHANGE_ACTIVE_TAB';

export const LinksTab = {
    LAST_VISITED: 'lastVisited',
    POPULAR: 'popular',
    FAVOURITES: 'favourites',
};
