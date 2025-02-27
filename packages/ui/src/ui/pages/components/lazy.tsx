import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';
import {withDisableMaxContentWidth} from '../../containers/MaxContentWidth';

function importComponents() {
    return import(/* webpackChunkName: "components" */ './Components');
}

export const ComponentsLazy = withDisableMaxContentWidth(
    withLazyLoading(
        React.lazy(async () => {
            return {default: (await importComponents()).Components};
        }),
    ),
);

export const ComponentsTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importComponents()).ComponentsTopRow};
    }),
    '',
);
