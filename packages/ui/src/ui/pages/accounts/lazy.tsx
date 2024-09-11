import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

function importPage() {
    return import('./index');
}

export const AccountsLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).Accounts};
    }),
);

export const AccountsTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).AccountsTopRowContent};
    }),
);
