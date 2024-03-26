import React from 'react';
import cn from 'bem-cn-lite';

import Icon from '../../components/Icon/Icon';
import {IdmKindType} from '../../utils/acl/acl-types';
import {AclRoleActionsType} from '../../UIFactory';

const block = cn('navigation-acl');

export interface Props {
    idmKind?: IdmKindType;
    role: AclRoleActionsType;
    onDelete?: (role: AclRoleActionsType) => void;
}

export default function RoleActions(props: Props) {
    const {role, onDelete} = props;
    const {inherited} = role;

    const handleDelete = React.useCallback(() => {
        onDelete?.(role);
    }, [onDelete, role]);

    return (
        <React.Fragment>
            {!inherited && onDelete !== undefined && (
                <span className={block('icon', {delete: true})} onClick={() => handleDelete()}>
                    <Icon awesome="trash-alt" />
                </span>
            )}
        </React.Fragment>
    );
}
