import React from 'react';
import cn from 'bem-cn-lite';

import ypath from '../../../../../common/thor/ypath';
import {getParentPath} from '../../../../../utils/navigation';
import RequestPermissions from '../../../tabs/ACL/RequestPermissions/RequestPermissions';
import {RequestPermissionIsNotAllowed} from './RequestPermissionIsNotAllowed';
import {YTError} from '../../../../../../@types/types';

import './RequestPermission.scss';

const block = cn('request-permission');

type Props = {
    error: YTError;
    path?: string;
    cluster: string;
};

export function RequestPermission(props: Props) {
    const {path: currentPath, error, cluster} = props;
    const objectType = ypath.getValue(error?.attributes, '/object_type');
    const errorPath = ypath.getValue(error?.attributes, '/path');
    const isRequestPermissionsForPathAllowed = objectType === 'map_node';

    const path = errorPath ?? currentPath;

    const pathForRequest = isRequestPermissionsForPathAllowed ? path : getParentPath(path);

    return (
        <div>
            {!isRequestPermissionsForPathAllowed && (
                <RequestPermissionIsNotAllowed objectType={objectType} />
            )}

            <RequestPermissions
                buttonClassName={block('request-permissions-button')}
                path={pathForRequest}
                cluster={cluster}
                buttonProps={{size: 'l', width: 'max'}}
            />
        </div>
    );
}
