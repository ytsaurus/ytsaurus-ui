import React from 'react';
import {createMemoryHistory} from 'history';
import {useStore} from 'react-redux';
import {Router} from 'react-router';
import type {Store} from 'redux';

import {setWindowStoreAndHistory} from '../../../store/window-store';

export function FlowRoutedStoryHarness({children}: {children: React.ReactNode}) {
    const store = useStore() as Store;
    const [history] = React.useState(createMemoryHistory);
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
        setWindowStoreAndHistory(store, history);
        setReady(true);
    }, [history, store]);

    return ready ? <Router history={history}>{children}</Router> : null;
}
