import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

function importPage() {
    return import(/* webpackChunkName: "accounts" */ './index');
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
    '',
);
