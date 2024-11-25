import {ThunkAction} from 'redux-thunk';

import findIndex_ from 'lodash/findIndex';
import isEqual_ from 'lodash/isEqual';
import map_ from 'lodash/map';

import {RootState} from '../reducers';
import {
    getSettingsPagesOrder,
    getSettingsPagesPinned,
} from '../../store/selectors/settings/settings-ts';
import {setSettingsPagesOrder, setSettingsPagesPinned} from '../../store/actions/settings/settings';
import {getPagesOrderedByUser} from '../../store/selectors/slideoutMenu';
import {moveArrayElement, toggleBooleanInPlace} from '../../utils/utils';
import {rumLogError} from '../../rum/rum-counter';
import {getCurrentUserName} from '../selectors/global';

export function togglePinnedPage(id: string): ThunkAction<any, RootState, any, any> {
    return (dispatch, getState) => {
        const state = getState();
        const pinned = {...getSettingsPagesPinned(state)};
        const orderedPages = getPagesOrderedByUser(state);

        const prevOrder = getSettingsPagesOrder(state);
        const newOrder = map_(orderedPages, 'id');

        const itemIndex = findIndex_(orderedPages, (item) => item.id === id);
        if (itemIndex === -1) {
            const login = getCurrentUserName(state);
            rumLogError({
                message: 'Previous index of pages element cannot be defined',
                additional: {
                    id,
                    login,
                },
            });
            return;
        }

        toggleBooleanInPlace(id, pinned);
        dispatch(setSettingsPagesPinned(pinned));

        const afterPinned = findIndex_(orderedPages, ({pinned}) => !pinned);

        if (itemIndex !== -1) {
            const newState = pinned[id];
            const tmp = afterPinned === -1 ? orderedPages.length : afterPinned;
            const newIndex = !newState ? Math.max(0, tmp - 1) : tmp;

            if (itemIndex !== newIndex) {
                moveArrayElement(newOrder, itemIndex, newIndex);
            }
        }

        if (!isEqual_(prevOrder, newOrder)) {
            dispatch(setSettingsPagesOrder(newOrder));
        }
    };
}

export function setPagesItemPosition(params: {
    oldIndex: number;
    newIndex: number;
}): ThunkAction<any, RootState, any, any> {
    return (dispatch, getState) => {
        const {oldIndex, newIndex} = params;
        if (oldIndex === newIndex) {
            return;
        }

        const state = getState();
        const orderedPages = [...getPagesOrderedByUser(state)];

        const [item] = moveArrayElement(orderedPages, oldIndex, newIndex);
        if (!item) {
            const login = getCurrentUserName(state);
            rumLogError({
                message: "Page's item position cannot be changed",
                additional: {
                    login,
                    oldIndex,
                    newIndex,
                    orderedPages,
                },
            });
            return;
        }

        const order = map_(orderedPages, 'id');
        dispatch(setSettingsPagesOrder(order));

        const prev = orderedPages[newIndex - 1];
        const next = orderedPages[newIndex + 1];

        if ((item.pinned && prev && !prev.pinned) || (!item.pinned && next && next.pinned)) {
            const pinned = {...getSettingsPagesPinned(state)};
            toggleBooleanInPlace(item.id, pinned);
            dispatch(setSettingsPagesPinned(pinned));
        }
    };
}
