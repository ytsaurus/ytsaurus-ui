import React, {useEffect, useState} from 'react';
import {createMemoryHistory} from 'history';
import {useStore} from 'react-redux';
import {Router} from 'react-router';
import type {Store} from 'redux';

import {
    type FlowStateFiltersValue,
    filtersSlice,
    initialState,
} from '../../../../store/reducers/flow/filters';
import {setWindowStoreAndHistory} from '../../../../store/window-store';

export function FlowRoutedStoryHarness({
    children,
    stateFilters,
}: {
    children: React.ReactNode;
    stateFilters?: Partial<FlowStateFiltersValue>;
}) {
    const store = useStore() as Store;
    const [history] = useState(createMemoryHistory);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setWindowStoreAndHistory(store, history);
        if (stateFilters) {
            store.dispatch(
                filtersSlice.actions.updateFlowFilters({
                    stateViewer: {...initialState.stateViewer, ...stateFilters},
                }),
            );
        }
        setReady(true);
    }, [history, stateFilters, store]);

    return ready ? <Router history={history}>{children}</Router> : null;
}
