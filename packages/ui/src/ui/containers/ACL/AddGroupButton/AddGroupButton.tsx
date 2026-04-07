import {Flex} from '@gravity-ui/uikit';
import React from 'react';
import Button from '../../../components/Button/Button';
import Icon from '../../../components/Icon/Icon';
import {Tooltip} from '@ytsaurus/components';
import {AclMode} from '../../../constants/acl';
import UIFactory from '../../../UIFactory';
import {useEditColumnRowGroupModal} from '../EditGroupModal/EditGroupModal';
import i18n from './i18n';

export function AddGroupButton({
    cluster,
    path,
    loadAclDataFn,
    aclMode,
    nodeType,
}: {
    nodeType?: string;
    cluster: string;
    path: string;
    loadAclDataFn: () => void;
    aclMode: AclMode.ROW_GROUPS_PERMISSIONS | AclMode.COLUMN_GROUPS_PERMISSIONS;
}) {
    const isRowGroup = aclMode === AclMode.ROW_GROUPS_PERMISSIONS;

    const {editGroupModalNode, addGroup} = useEditColumnRowGroupModal({
        groupType: isRowGroup ? 'row' : 'column',
    });

    const handleAddClick = () => {
        addGroup({
            submit: (values) => {
                const res = isRowGroup
                    ? UIFactory.getAclApi().createRowGroup(cluster, path, values)
                    : UIFactory.getAclApi().createColumnGroup(cluster, path, values);

                return res.then(() => {
                    loadAclDataFn();
                });
            },
        });
    };

    const {allowEdit, allowEditNotice} = isRowGroup
        ? UIFactory.getAclApi().isAllowedToEditRowGroups({nodeType})
        : UIFactory.getAclApi().isAllowedToEditColumnGroups({nodeType});

    return (
        <Flex alignItems="center">
            <Button onClick={handleAddClick} disabled={!allowEdit} qa="acl:add-acl-group">
                <Icon awesome={'plus'} />
                {isRowGroup ? i18n('action_add-row-group') : i18n('action_add-column-group')}
            </Button>

            {Boolean(allowEditNotice) && (
                <Tooltip content={allowEditNotice}>
                    &nbsp;
                    <Icon awesome="question-circle" color="secondary" />
                </Tooltip>
            )}
            {editGroupModalNode}
        </Flex>
    );
}
