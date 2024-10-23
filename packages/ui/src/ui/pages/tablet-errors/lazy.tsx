import React from 'react';

import withLazyLoading from '../../hocs/withLazyLoading';

function importPage() {
    return import(/* webpackChunkName: "tablet-errors-by-bundle" */ './TabletErrors');
}

export const TabletErrorsLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).TabletErrors};
    }),
);
