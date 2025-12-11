import React from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';

function importFlow() {
    return import(/* webpackChunkName: "navigation-flow" */ './Flow');
}

export const Flow = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importFlow()).Flow};
    }),
);
