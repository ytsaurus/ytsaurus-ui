import {lazy} from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';

function importVcs() {
    return import(/* webpackChunkName: "vcs" */ './Vcs');
}

export const Vcs = withLazyLoading(
    lazy(async () => {
        return {default: (await importVcs()).Vcs};
    }),
);
