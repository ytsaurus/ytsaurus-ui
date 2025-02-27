import React from 'react';

import withLazyLoading from '../../hocs/withLazyLoading';
import {withDisableMaxContentWidth} from '../../containers/MaxContentWidth';

function importPage() {
    return import(/* webpackChunkName: "chyt" */ './index');
}

export const ChytPageLazy = withDisableMaxContentWidth(
    withLazyLoading(
        React.lazy(async () => {
            return {default: (await importPage()).ChytPage};
        }),
    ),
);

export const ChytPageTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).ChytPageTopRow};
    }),
    '',
);
