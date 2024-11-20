import React, {useCallback, useState} from 'react';

import {useDispatch} from 'react-redux';

import ClickableAttributesButton from '../../../components/AttributesButton/ClickableAttributesButton';

import Icon from '../../../components/Icon/Icon';
import Button from '../../../components/Button/Button';

import {openGroupEditorModal} from '../../../store/actions/groups';
import UIFactory from '../../../UIFactory';
import {DeleteGroupModal} from '../DeleteGroupModal/DeleteUserModal';

type GroupActionsProps = {
    className?: string;
    groupname: string;
};

export function GroupActions({className, groupname}: GroupActionsProps) {
    const dispatch = useDispatch();

    const onEdit = React.useCallback(() => {
        dispatch(openGroupEditorModal(groupname));
    }, [groupname]);

    const {allowDelete} = UIFactory.getAclApi().groups;

    return (
        <div className={className}>
            <ClickableAttributesButton title={groupname} path={`//sys/groups/${groupname}`} />
            <Button view="flat-secondary" size="m" onClick={onEdit}>
                <Icon awesome="pencil-alt" />
            </Button>
            {allowDelete && <DeleteGroupButton group={groupname} />}
        </div>
    );
}

function DeleteGroupButton({group}: {group: string}) {
    const [visible, setVisible] = useState(false);

    const onClick = useCallback(() => {
        setVisible(true);
    }, []);

    const onClose = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <React.Fragment>
            <Button view="flat-secondary" size="m" onClick={onClick}>
                <Icon awesome="trash-bin" />
            </Button>
            {visible && <DeleteGroupModal group={group} onClose={onClose} />}
        </React.Fragment>
    );
}
