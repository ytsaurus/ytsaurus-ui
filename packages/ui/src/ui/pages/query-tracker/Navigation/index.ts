import {lazy} from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';

function importVcs() {
    return import(/* webpackChunkName: "query-navigation" */ './Navigation');
}

export const Navigation = withLazyLoading(
    lazy(async () => {
        return {default: (await importVcs()).Navigation};
    }),
);
