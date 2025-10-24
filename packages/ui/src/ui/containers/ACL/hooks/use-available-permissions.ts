import React from 'react';

import {IdmKindType} from '../../../utils/acl/acl-types';
import UIFactory from '../../../UIFactory';
import {YTError} from '../../../../@types/types';

export function useAvailablePermissions({idmKind, path}: {idmKind: IdmKindType; path: string}) {
    const {permissionsToRequest, permissionTypes, getAvailablePermissions} =
        UIFactory.getAclPermissionsSettings()[idmKind];

    const requestable = Boolean(getAvailablePermissions);

    const [result, setAvailablePermissions] = React.useState<{
        permissionsToRequest: typeof permissionsToRequest;
        permissionsToCheck: typeof permissionTypes;
        error?: YTError;
    }>({
        permissionsToRequest: requestable ? [] : permissionsToRequest,
        permissionsToCheck: requestable ? [] : permissionTypes,
    });

    React.useEffect(() => {
        getAvailablePermissions?.({path})
            .then((value) => {
                setAvailablePermissions((prevState) => {
                    return {...prevState, ...value};
                });
            })
            .catch((error: any) => {
                setAvailablePermissions((prevState) => {
                    return {
                        ...prevState,
                        permissionsToRequest,
                        permissionTypes,
                        error,
                    };
                });
            });
    }, [path, getAvailablePermissions]);

    return result;
}
