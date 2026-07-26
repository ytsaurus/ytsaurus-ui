import React from 'react';
import withLazyLoading from '../../../../../hocs/withLazyLoading';

export const OperationAclLazy = withLazyLoading(
    React.lazy(async () => {
        return {
            default: (
                await import(/* webpackChunkName: 'operation-acl' */ './OperationAcl/OperationAcl')
            ).OperationAcl,
        };
    }),
);
