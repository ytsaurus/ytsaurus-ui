import React from 'react';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {getPath} from '../../../../store/selectors/navigation';
import {makeFlowLink} from '../../../../utils/app-url';
import {getAppBrowserHistory} from '../../../../store/window-store';
import {filtersSlice} from '../../../../store/reducers/flow/filters';

export function FlowRedirect() {
    const dispatch = useDispatch();
    const path = useSelector(getPath);

    React.useMemo(() => {
        dispatch(filtersSlice.actions.updateFlowFilters({pipelinePath: path}));
        const url = makeFlowLink({path});
        getAppBrowserHistory().replace(url);
    }, [path, dispatch]);

    return null;
}
