import React from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';

function importComponents() {
    return import(/* webpackChunkName: "yt-queries-list" */ './index');
}

export const LazyQueriesList = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importComponents()).QueriesList};
    }),
);
