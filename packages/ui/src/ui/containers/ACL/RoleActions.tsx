import React from 'react';
import cn from 'bem-cn-lite';

import {Button} from '@gravity-ui/uikit';

import Icon from '../../components/Icon/Icon';
import {type IdmKindType} from '../../utils/acl/acl-types';
import {type AclRoleActionsType} from '../../UIFactory';

import './RoleActions.scss';

const block = cn('navigation-acl');

export interface Props {
    mode: 'responsible' | 'permissions';
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
                <Button
                    className={block('button')}
                    onClick={() => handleDelete()}
                    qa="acl:delete-role"
                >
                    <Icon awesome="trash-alt" />
                </Button>
            )}
        </React.Fragment>
    );
}
