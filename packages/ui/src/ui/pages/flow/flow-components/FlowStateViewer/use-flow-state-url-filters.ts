import React from 'react';
import {useHistory} from 'react-router';

import {filtersSlice} from '../../../../store/reducers/flow/filters';
import {isFlowStatePathname} from '../../../../store/reducers/flow/url-mapping';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectFlowStateViewerUrlState} from '../../../../store/selectors/flow/filters';

import {
    EMPTY_STATE_VIEWER_URL_STATE,
    type FlowStateUrlRestore,
    restoreStateViewerUrlState,
    serializeStateViewerUrlState,
    toStateViewerUrlState,
} from './state-url-filters';
import type {
    FlowHeavyHitterStateSeed,
    FlowStateFiltersValue,
    FlowStatePersistedFilters,
} from './types';

export type FlowStateUrlFilters = {
    restoredFilters: Partial<FlowStateFiltersValue> | undefined;
    restoredUrlMalformed: boolean;
    heavyHitterSeed: FlowHeavyHitterStateSeed | undefined;
    restoreEpoch: number;
    onFiltersChange: (persisted: FlowStatePersistedFilters) => void;
};

type RestoreSync = {
    mirrored: string;
    restoreEpoch: number;
    restore: FlowStateUrlRestore;
};

export function useFlowStateUrlFilters({
    fixedComputationId,
}: {
    fixedComputationId?: string;
}): FlowStateUrlFilters {
    const dispatch = useDispatch();
    const history = useHistory();
    const urlState = useSelector(selectFlowStateViewerUrlState);
    const withSeed = Boolean(fixedComputationId);
    const urlKey = serializeStateViewerUrlState(urlState, {withSeed});
    const [sync, setSync] = React.useState<RestoreSync>(() => ({
        mirrored: urlKey,
        restoreEpoch: 0,
        restore: restoreStateViewerUrlState(urlState, {withSeed}),
    }));
    if (sync.mirrored !== urlKey) {
        setSync({
            mirrored: urlKey,
            restoreEpoch: sync.restoreEpoch + 1,
            restore: restoreStateViewerUrlState(urlState, {withSeed}),
        });
    }

    const seedText = urlState.stateViewerHeavyHitterSeed;
    const seedParsed = sync.restore.heavyHitterSeed !== undefined;
    const onFiltersChange = React.useCallback(
        (persisted: FlowStatePersistedFilters) => {
            const hasHeavyHitterSeed = withSeed && seedParsed;
            const next = {
                ...toStateViewerUrlState(persisted, {fixedComputationId, hasHeavyHitterSeed}),
                stateViewerHeavyHitterSeed: hasHeavyHitterSeed ? seedText : '',
            };
            setSync((current) => ({
                ...current,
                mirrored: serializeStateViewerUrlState(next, {withSeed}),
                restore: restoreStateViewerUrlState(next, {withSeed}),
            }));
            dispatch(filtersSlice.actions.updateFlowFilters(next));
        },
        [dispatch, fixedComputationId, seedParsed, seedText, withSeed],
    );

    React.useEffect(() => {
        const {pathname} = history.location;
        return () => {
            const nextPathname = history.location.pathname;
            if (nextPathname === pathname) {
                return;
            }
            const nextRoute = isFlowStatePathname(nextPathname);
            if (nextRoute === undefined) {
                dispatch(filtersSlice.actions.updateFlowFilters(EMPTY_STATE_VIEWER_URL_STATE));
            } else if (nextRoute === 'pipeline') {
                dispatch(filtersSlice.actions.updateFlowFilters({stateViewerHeavyHitterSeed: ''}));
            }
        };
    }, [dispatch, history]);

    return {
        restoredFilters: sync.restore.filters,
        restoredUrlMalformed: sync.restore.malformed,
        heavyHitterSeed: sync.restore.heavyHitterSeed,
        restoreEpoch: sync.restoreEpoch,
        onFiltersChange,
    };
}
