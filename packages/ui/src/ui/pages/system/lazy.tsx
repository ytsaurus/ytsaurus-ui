import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';
import {withDisableMaxContentWidth} from '../../containers/MaxContentWidth';

function importPage() {
    return import(/* webpackChunkName: "system" */ './index');
}

export const SystemLazy = withDisableMaxContentWidth(
    withLazyLoading(
        React.lazy(async () => {
            return {default: (await importPage()).System};
        }),
    ),
);

export const SystemTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).SystemTopRow};
    }),
    '',
);
