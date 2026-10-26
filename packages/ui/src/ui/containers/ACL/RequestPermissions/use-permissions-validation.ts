import {useCallback, useEffect, useMemo, useState} from 'react';

import CancelHelper from '../../../utils/cancel-helper';
import {
    type PermissionsValidationParams,
    type PermissionsValidationState,
    createPermissionsValidator,
} from './validate-permissions';

export function usePermissionsValidation({
    idmKind,
    prepareValues,
    requestPermissions,
    visible,
}: Omit<PermissionsValidationParams, 'onValidation'>) {
    const [cancelHelper] = useState(() => new CancelHelper());
    const [validation, setValidation] = useState<PermissionsValidationState>({});

    useEffect(() => () => cancelHelper.removeAllRequests(), [cancelHelper]);

    const cancel = useCallback(() => {
        cancelHelper.removeAllRequests();
        setValidation({});
    }, [cancelHelper]);

    const validate = useMemo(
        () =>
            createPermissionsValidator({
                cancelHelper,
                idmKind,
                prepareValues,
                requestPermissions,
                visible,
                onValidation: setValidation,
            }),
        [cancelHelper, idmKind, prepareValues, requestPermissions, visible],
    );

    return {...validation, validate, cancel};
}
