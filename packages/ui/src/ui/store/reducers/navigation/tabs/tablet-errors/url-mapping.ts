import {produce} from 'immer';

import type {RootState} from '../../../../../store/reducers';
import {initialState} from '../../../../../store/reducers/navigation/tabs/tablet-errors/tablet-errors-background';
import {updateIfChanged} from '../../../../../utils/utils';
import {LocationParameters} from '../../../../../store/location';

export const navigationTabletErrorsParams: LocationParameters = {
    teMode: {
        stateKey: 'navigation.tabs.tabletErrorsBackground.viewMode',
        initialState: initialState.viewMode,
    },
};

export function getNavigationTabletErrorsPreparedState(
    state: RootState,
    {query}: {query: RootState},
) {
    return produce(state, (draft) => {
        updateIfChanged(
            draft.navigation.tabs.tabletErrorsBackground,
            'viewMode',
            query.navigation.tabs.tabletErrorsBackground.viewMode,
        );
    });
}
