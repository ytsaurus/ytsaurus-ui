import React from 'react';

import {useSelector} from '../../../../store/redux-hooks';
import {getPath} from '../../../../store/selectors/navigation';
import {makeFlowLink} from '../../../../utils/app-url';
import {getAppBrowserHistory} from '../../../../store/window-store';

export function FlowRedirect() {
    const path = useSelector(getPath);

    React.useMemo(() => {
        const url = makeFlowLink({path});
        getAppBrowserHistory().replace(url);
        getAppBrowserHistory().push(url);
    }, [path]);

    return null;
}
