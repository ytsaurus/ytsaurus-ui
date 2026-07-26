import React from 'react';
import RequestPermissions from '../../../../../../../containers/ACL/RequestPermissions/RequestPermissions';
import {selectOperationId} from '../../../../../../../store/selectors/operations/operation';
import {useDispatch, useSelector} from '../../../../../../../store/redux-hooks';
import {selectCluster} from '../../../../../../../store/selectors/global/cluster';
import {requestPermissions} from '../../../../../../../store/actions/acl';
import {getOperation} from '../../../../../../../store/actions/operations/detail';

export function OperationAclAddButton() {
    const dispatch = useDispatch();
    const cluster = useSelector(selectCluster);
    const id = useSelector(selectOperationId);

    return (
        <RequestPermissions
            idmKind={'operation'}
            path={id}
            cluster={cluster}
            requestPermissions={async ({values}) => {
                await dispatch(requestPermissions({values, idmKind: 'operation'}));
                dispatch(getOperation(id));
            }}
            cancelRequestPermissions={() => Promise.resolve()}
            fields={['path', 'permissions', 'subjects'] as const}
        />
    );
}
