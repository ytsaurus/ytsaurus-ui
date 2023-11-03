import React from 'react';
import cn from 'bem-cn-lite';
import {showErrorPopup} from '../../utils/utils';
import Link from '../Link/Link';
import {Text} from '@gravity-ui/uikit';

import './CompactError.scss';
const block = cn('compact-error-block');

interface Props {
    error: any;
    maxMessageLength?: number;
}

function messageFromError(error: {message: string}, maxLength?: number) {
    if (!maxLength || maxLength < 0 || 'string' !== typeof error?.message) {
        return undefined;
    }

    const resLength = Math.min(maxLength, error.message.length);
    return error.message.length - resLength > 2
        ? error.message.substring(0, maxLength) + '\u2026'
        : error.message;
}

export default function CompactError({error, maxMessageLength}: Props) {
    const message = messageFromError(error, maxMessageLength);
    return (
        <Text variant="body-1" color="danger" className={block()}>
            {message ?? 'An error occurred'}
            <Link
                className={block('link')}
                onClick={() => {
                    showErrorPopup(error, {hideOopsMsg: true});
                }}
            >
                Details
            </Link>
        </Text>
    );
}
