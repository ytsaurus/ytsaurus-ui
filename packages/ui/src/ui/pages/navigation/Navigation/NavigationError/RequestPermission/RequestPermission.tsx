import React from 'react';

import ypath from '../../../../../common/thor/ypath';
import {getParentPath} from '../../../../../utils/navigation';
import RequestPermissions from '../../../tabs/ACL/RequestPermissions/RequestPermissions';
import {ErrorType} from '../../NavigationError/helpers';
import RequestPermissionIsNotAllowed from './RequestPermissionIsNotAllowed';

type Props = {
    error: ErrorType;
    path?: string;
    cluster: string;
    block: (mix: string) => string;
};

function RequestPermission(props: Props) {
    const {path: currentPath, error, cluster, block} = props;
    const objectType = ypath.getValue(error?.attributes, '/object_type');
    const errorPath = ypath.getValue(error?.attributes, '/path');
    const isRequestPermissionsForPathAllowed = objectType === 'map_node';

    const path = errorPath ?? currentPath;

    const pathForRequest = isRequestPermissionsForPathAllowed ? path : getParentPath(path);
    const textForRequest = isRequestPermissionsForPathAllowed
        ? 'Request permission'
        : 'Request permission for parent node';

    return (
        <div>
            {!isRequestPermissionsForPathAllowed && (
                <RequestPermissionIsNotAllowed objectType={objectType} block={block} />
            )}

            <RequestPermissions
                className={block('error-action-button')}
                buttonClassName={block('request-permissions-button')}
                // @ts-ignore
                parentPath={pathForRequest}
                path={pathForRequest}
                cluster={cluster}
                buttonText={textForRequest}
                buttonProps={{size: 'l', width: 'max'}}
            />
        </div>
    );
}

export default RequestPermission;
