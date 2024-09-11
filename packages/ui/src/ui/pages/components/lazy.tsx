import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

function importComponents() {
    return import('./Components');
}

export const ComponentsLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importComponents()).Components};
    }),
);

export const ComponentsTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importComponents()).ComponentsTopRow};
    }),
);
