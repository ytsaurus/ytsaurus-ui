import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

function importPage() {
    return import(/* webpackChunkName: "flow-page" */ './index');
}

export const FlowPageLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).FlowPage};
    }),
);

export const FlowPageTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).FlowPageTopRow};
    }),
    '',
);
