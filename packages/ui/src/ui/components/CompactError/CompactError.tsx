import React from 'react';
import cn from 'bem-cn-lite';
import {showErrorPopup} from '../../utils/utils';
import Link from '../Link/Link';
import {Text} from '@gravity-ui/uikit';

import './CompactError.scss';
const block = cn('compact-error-block');

interface Props {
    error: any;
}

export default function CompactError({error}: Props) {
    return (
        <Text variant="body-1" color="danger" className={block()}>
            An error occurred{' '}
            <Link
                onClick={() => {
                    showErrorPopup(error, {hideOopsMsg: true});
                }}
            >
                Show error
            </Link>
        </Text>
    );
}
