import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

export const SupportComponentLazy = withLazyLoading(
    React.lazy(async () => {
        const {SupportComponent} = await import('./SupportComponent');
        return {default: SupportComponent};
    }),
);
