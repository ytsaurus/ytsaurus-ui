import React from 'react';

import {Text} from '@gravity-ui/uikit';

import Link from '../../components/Link/Link';
import format from '../../common/hammer/format';
import {Page} from '../../../shared/constants/settings';
import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';

export function OperationId({
    id,
    cluster,
    color,
    allowCopy,
}: {
    id?: string;
    color?: 'secondary';
    cluster: string;
    allowCopy?: boolean;
}) {
    const operationId = id && id !== '0-0-0-0' ? id : null;

    return (
        <Text variant="code-1" color={color}>
            {operationId ? (
                <React.Fragment>
                    <Link
                        theme={color}
                        url={`/${cluster}/${Page.OPERATIONS}/${operationId}`}
                        routed
                    >
                        {operationId}
                    </Link>
                    {allowCopy && (
                        <ClipboardButton
                            text={operationId}
                            view="clear"
                            visibleOnRowHover
                            inlineMargins
                        />
                    )}
                </React.Fragment>
            ) : (
                format.NO_VALUE
            )}
        </Text>
    );
}
