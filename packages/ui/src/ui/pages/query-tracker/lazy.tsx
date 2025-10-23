import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';
import {withDisableMaxContentWidth} from '../../containers/MaxContentWidth';

function importQT() {
    return import(/* webpackChunkName: "query-tracker" */ './index');
}

export const QueryTrackerLazy = withDisableMaxContentWidth(
    withLazyLoading(
        React.lazy(async () => {
            return {default: (await importQT()).QueryTracker};
        }),
    ),
);

export const QueryTrackerTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importQT()).QueryTrackerTopRow};
    }),
    '',
    {inline: true},
);
