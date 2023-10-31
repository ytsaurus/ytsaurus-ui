import React from 'react';

import {Text} from '@gravity-ui/uikit';

import Link from '../../components/Link/Link';
import format from '../../common/hammer/format';
import {Page} from '../../../shared/constants/settings';

export function OperationId({
    id,
    cluster,
    color,
}: {
    id?: string;
    color?: 'secondary';
    cluster: string;
}) {
    const operationId = id && id !== '0-0-0-0' ? id : null;

    return (
        <Text variant="code-1" color={color}>
            {operationId ? (
                <Link theme={color} url={`/${cluster}/${Page.OPERATIONS}/${operationId}`} routed>
                    {operationId}
                </Link>
            ) : (
                format.NO_VALUE
            )}
        </Text>
    );
}
