import React from 'react';
import {Provider, useStore} from 'react-redux';
import {Router, useLocation} from 'react-router';
import type {Store} from 'redux';

import {type FlowStoryRouting, startFlowStoryRouting} from '../../../store/flow-story-routing';

export type FlowRoutedStoryHarnessProps = {
    children: React.ReactNode;
    initialEntries?: Array<string>;
    urlSync?: boolean;
};

export function FlowRoutedStoryHarness({
    children,
    initialEntries,
    urlSync = false,
}: FlowRoutedStoryHarnessProps) {
    const outerStore = useStore() as Store;
    const [mountInitialEntries] = React.useState(initialEntries);
    const [routing, setRouting] = React.useState<FlowStoryRouting>();

    React.useEffect(() => {
        const {routing: startedRouting, stop} = startFlowStoryRouting({
            initialEntries: mountInitialEntries,
            outerStore,
            urlSync,
        });
        setRouting(startedRouting);
        return stop;
    }, [mountInitialEntries, outerStore, urlSync]);

    if (!routing) {
        return null;
    }
    const routed = <Router history={routing.history}>{children}</Router>;
    return routing.store === outerStore ? (
        routed
    ) : (
        <Provider store={routing.store}>{routed}</Provider>
    );
}

export function FlowRoutedLocationProbe() {
    const {pathname, search} = useLocation();
    return <output data-qa="flow-routed-location">{`${pathname}${search}`}</output>;
}
