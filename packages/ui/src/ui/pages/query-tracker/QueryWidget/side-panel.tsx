import React from 'react';

import withLazyLoading from '../../../hocs/withLazyLoading';
import Loader from '../../../components/Loader/Loader';
import {useSidePanel} from '../../../hooks/use-side-panel';

export const QueryWidgetLazy = withLazyLoading(
    React.lazy(() => import(/* webpackChunkName: "query-widget" */ './index')),
    <Loader visible centered size="l" />,
);

export function useQueryWidgetSidePanel() {
    return useSidePanel('QueryWidget', {
        renderContent({onClose}) {
            return <QueryWidgetLazy onClose={onClose} />;
        },
    });
}
