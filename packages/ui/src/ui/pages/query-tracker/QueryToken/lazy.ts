import React from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';

function importComponents() {
    return import(/* webpackChunkName: "yt-query-token" */ './index');
}

export const LazyAddQueryTokenForm = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importComponents()).AddQueryTokenFormButton};
    }),
);

export const LazyQueryTokenList = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importComponents()).QueryTokenTable};
    }),
);

export const LazyQueryTokenButton = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importComponents()).QueryTokenButton};
    }),
);
