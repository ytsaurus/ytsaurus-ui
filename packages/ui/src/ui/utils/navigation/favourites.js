import {Favourites} from '../../utils/favourites';
import {
    getClusterNS,
    getLastVisited as getLastVisitedSelector,
} from '../../store/selectors/settings';
import {setSetting} from '../../store/actions/settings';
import {SettingName} from '../../../shared/constants/settings';

const LAST_VISITED_BUFFER_SIZE = 15;
const store = window.store;

const favourites = new Favourites(getClusterNS);

export function trackVisit(path) {
    const state = store.getState();
    const current = getLastVisitedSelector(state);
    const currentPathItem = {path: path, count: 1};

    return store.dispatch(
        setSetting(
            SettingName.LOCAL.LAST_VISITED,
            getClusterNS(state),
            current
                .reduce(
                    (updated, item) => {
                        if (item.path === path) {
                            currentPathItem.count += item.count;
                        } else {
                            updated.push(item);
                        }

                        return updated;
                    },
                    [currentPathItem],
                )
                .slice(0, LAST_VISITED_BUFFER_SIZE),
        ),
    );
}

export const toggleFavourites = favourites.toggle.bind(favourites);
export const getFavourites = favourites.get.bind(favourites);
export const inFavourites = favourites.has.bind(favourites);
