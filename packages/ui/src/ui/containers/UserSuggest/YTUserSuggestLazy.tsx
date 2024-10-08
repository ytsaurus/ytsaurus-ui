import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

export const YTUserSuggestLazy = withLazyLoading(
    React.lazy(async () => {
        return {
            default: (await import(/* webpackChunkName: "yt-user-suggest" */ './YTUserSuggest'))
                .YTUserSuggest,
        };
    }),
);
