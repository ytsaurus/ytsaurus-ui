import produce from 'immer';
import {RootState} from '../../../../../store/reducers';
import {updateIfChanged} from '../../../../../utils/utils';
import {initialState} from './tablets';

export const tabletsParams = {
    histogramCollapsed: {
        stateKey: 'navigation.tabs.tablets.histogramCollapsed',
        initialState: initialState.histogramCollapsed,
        type: 'bool',
    },
    histogramType: {
        stateKey: 'navigation.tabs.tablets.histogramType',
        initialState: initialState.histogramType,
    },
    tabletsFilter: {
        stateKey: 'navigation.tabs.tablets.tabletsFilter',
        initialState: initialState.tabletsFilter,
    },
    tabletsMode: {
        stateKey: 'navigation.tabs.tablets.tabletsMode',
        initialState: initialState.tabletsMode,
    },
};

export function getNavigationTabletsPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        const draftTablets = draft.navigation.tabs.tablets;
        const queryTablets = query.navigation.tabs.tablets;

        updateIfChanged(draftTablets, 'histogramCollapsed', queryTablets.histogramCollapsed);
        updateIfChanged(draftTablets, 'histogramType', queryTablets.histogramType);
        updateIfChanged(draftTablets, 'tabletsFilter', queryTablets.tabletsFilter);
        updateIfChanged(draftTablets, 'tabletsMode', queryTablets.tabletsMode);
    });
}
