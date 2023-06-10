import React from 'react';
import cn from 'bem-cn-lite';

import Icon from '../../components/Icon/Icon';
import {PreparedAclSubject} from '../../utils/acl/acl-types';

const block = cn('navigation-acl');

export interface Props {
    idmKind: string;
    role: PreparedAclSubject;
    onDelete: (role: PreparedAclSubject) => void;
}

export default function RoleActions(props: Props) {
    const {role, onDelete} = props;
    const {inherited} = role;

    const handleDelete = React.useCallback(() => {
        onDelete(role);
    }, [onDelete, role]);
    return (
        <React.Fragment>
            {!inherited && (
                <span className={block('icon', {delete: true})} onClick={() => handleDelete()}>
                    <Icon awesome="trash-alt" />
                </span>
            )}
        </React.Fragment>
    );
}
