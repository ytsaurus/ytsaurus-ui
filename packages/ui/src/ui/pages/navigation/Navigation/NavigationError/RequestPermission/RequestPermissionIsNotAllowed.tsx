import React from 'react';
import cn from 'bem-cn-lite';

import hammer from '../../../../../common/hammer';
import {Info} from '../../../../../components/Info/Info';
import i18n from './i18n';

import './RequestPermission.scss';

const block = cn('request-permission-is-not-allowed');

type Props = {
    objectType: any;
};

export function RequestPermissionIsNotAllowed(props: Props) {
    const {objectType} = props;

    return (
        <Info className={block()}>
            {i18n('context_not-possible-to-request-access', {
                objectType: hammer.format['Readable'](objectType, {caps: 'none'}),
            })}
        </Info>
    );
}
