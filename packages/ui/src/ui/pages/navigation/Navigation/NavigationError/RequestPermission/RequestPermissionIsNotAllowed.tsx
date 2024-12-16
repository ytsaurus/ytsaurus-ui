import React from 'react';
import cn from 'bem-cn-lite';

import hammer from '../../../../../common/hammer';
import {Info} from '../../../../../components/Info/Info';

import './RequestPermission.scss';

const block = cn('request-permission-is-not-allowed');

type Props = {
    objectType: any;
};

export function RequestPermissionIsNotAllowed(props: Props) {
    const {objectType} = props;

    return (
        <Info className={block()}>
            It is not possible to request access to the{' '}
            {hammer.format['Readable'](objectType, {caps: 'none'})}. Please request access to the
            parent directory.
        </Info>
    );
}
