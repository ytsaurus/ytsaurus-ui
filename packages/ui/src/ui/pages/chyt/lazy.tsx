import React from 'react';

import withLazyLoading from '../../hocs/withLazyLoading';

function importPage() {
    return import(/* webpackChunkName: "chyt" */ './index');
}

export const ChytPageLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).ChytPage};
    }),
);

export const ChytPageTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).ChytPageTopRow};
    }),
    '',
);
