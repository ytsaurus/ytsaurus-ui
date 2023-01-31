import {ThunkAction} from 'redux-thunk';
import _ from 'lodash';

import {RootState} from '../../../store/reducers';
import {TabletCellBundlesSuggestAction} from '../../../store/reducers/suggests/tablet-cell-bundless';
import {
    SUGGEST_TABLET_CELL_BUNDLES_ERROR,
    SUGGEST_TABLET_CELL_BUNDLES_REQUEST,
    SUGGEST_TABLET_CELL_BUNDLES_SUCCESS,
} from '../../../constants/suggests';
import {getCurrentUserName} from '../../selectors/global';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';

type TabletCellBundlesSuggestThunkAction = ThunkAction<
    any,
    RootState,
    any,
    TabletCellBundlesSuggestAction
>;

export function loadUsableTabletCellBundlesSuggests(): TabletCellBundlesSuggestThunkAction {
    return (dispatch, getState) => {
        dispatch({type: SUGGEST_TABLET_CELL_BUNDLES_REQUEST});

        const username = getCurrentUserName(getState());

        return ytApiV3Id
            .get(YTApiId.getUsableBundles, {
                path: `//sys/users/${username}/@usable_tablet_cell_bundles`,
            })
            .then((items: Array<string>) => {
                dispatch({
                    type: SUGGEST_TABLET_CELL_BUNDLES_SUCCESS,
                    data: {items},
                });
            })
            .catch((e: any) => {
                dispatch({type: SUGGEST_TABLET_CELL_BUNDLES_ERROR, data: e});
            });
    };
}
