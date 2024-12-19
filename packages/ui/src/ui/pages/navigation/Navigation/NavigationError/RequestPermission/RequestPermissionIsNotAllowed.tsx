import React from 'react';
import hammer from '../../../../../common/hammer';
import {Info} from '../../../../../components/Info/Info';

type Props = {
    block: (mix: string) => string;
    objectType: any;
};

function RequestPermissionIsNotAllowed(props: Props) {
    const {block, objectType} = props;

    return (
        <Info className={block('error-block')}>
            It is not possible to request access to the{' '}
            {hammer.format['Readable'](objectType, {caps: 'none'})}. Please request access to the
            parent directory.
        </Info>
    );
}

export default RequestPermissionIsNotAllowed;
