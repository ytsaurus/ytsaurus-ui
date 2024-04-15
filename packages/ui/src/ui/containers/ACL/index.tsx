import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

function importAcl() {
    return import(/* webpackChunkName: "acl" */ './ACL-connect-helpers');
}

export const AccessContentAcl = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importAcl()).AccessContentAcl};
    }),
);

export const NavigationAcl = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importAcl()).NavigationAcl};
    }),
);

export const PoolAclPanel = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importAcl()).PoolAclPanel};
    }),
);

export const AccountsAcl = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importAcl()).AccountsAcl};
    }),
);

export const BundleAcl = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importAcl()).BundleAcl};
    }),
);
