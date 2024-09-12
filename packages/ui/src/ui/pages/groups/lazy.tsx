import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

function importPage() {
    return import(/* webpackChunkName: "groups" */ './index');
}

export const GroupsPageLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).GroupsPage};
    }),
);
