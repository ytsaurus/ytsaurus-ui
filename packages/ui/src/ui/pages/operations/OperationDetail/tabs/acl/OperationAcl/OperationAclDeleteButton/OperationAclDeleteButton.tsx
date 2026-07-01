import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import {Button, Icon} from '@gravity-ui/uikit';
import React from 'react';
import {AclRoleActionsType} from '../../../../../../../UIFactory';
import DeletePermissionModal from '../../../../../../../containers/ACL/DeletePermissionModal/DeletePermissionModal';
import {
    type DeletePemissionsParams,
    deletePermissions,
} from '../../../../../../../store/actions/acl';
import {getOperation} from '../../../../../../../store/actions/operations/detail';
import {useDispatch, useSelector} from '../../../../../../../store/redux-hooks';
import {selectOperationId} from '../../../../../../../store/selectors/operations/operation';

type Props = {
    row: AclRoleActionsType;
};

export function OperationAclDeleteButton({row}: Props) {
    const dispatch = useDispatch();
    const operationId = useSelector(selectOperationId);
    const [visible, setVisible] = React.useState(false);
    return (
        <>
            <Button onClick={() => setVisible(true)} view="flat" title="Delete">
                <Icon color="secondary" data={TrashBinIcon} />
            </Button>
            <DeletePermissionModal
                visible={visible}
                handleClose={() => setVisible(false)}
                idmKind="operation"
                path={operationId}
                itemToDelete={row}
                deletePermissions={async ({
                    idmKind,
                    path,
                    itemToDelete,
                    roleKey,
                }: DeletePemissionsParams) => {
                    await dispatch(
                        deletePermissions({
                            idmKind,
                            path,
                            itemToDelete,
                            roleKey,
                        }),
                    );
                    dispatch(getOperation(operationId));
                }}
            />
        </>
    );
}
