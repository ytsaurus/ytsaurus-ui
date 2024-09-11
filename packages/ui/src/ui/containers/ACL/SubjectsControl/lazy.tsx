import React from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';

export const YTSubjectSuggestLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await import('./YTSubjectSuggest')).YTSubjectSuggest};
    }),
);
