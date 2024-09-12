import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

export const BanPageLazy = withLazyLoading(
    React.lazy(() => import(/* webpackChunkName: "ban-page" */ './BanPage')),
);
