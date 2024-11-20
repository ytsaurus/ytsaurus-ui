import React from 'react';

import {useDispatch} from 'react-redux';

import ClickableAttributesButton from '../../../components/AttributesButton/ClickableAttributesButton';

import Icon from '../../../components/Icon/Icon';
import Button from '../../../components/Button/Button';

import {openGroupEditorModal, showGroupDeleteModal} from '../../../store/actions/groups';
import UIFactory from '../../../UIFactory';

type GroupActionsProps = {
    className?: string;
    groupname: string;
};

export function GroupActions({className, groupname}: GroupActionsProps) {
    const dispatch = useDispatch();

    const onEdit = React.useCallback(() => {
        dispatch(openGroupEditorModal(groupname));
    }, [groupname]);

    const onRemove = React.useCallback(() => {
        dispatch(showGroupDeleteModal(groupname));
    }, [groupname]);

    const {allowDelete} = UIFactory.getAclApi().groups;

    return (
        <div className={className}>
            <ClickableAttributesButton title={groupname} path={`//sys/groups/${groupname}`} />
            <Button view="flat-secondary" size="m" onClick={onEdit}>
                <Icon awesome="pencil-alt" />
            </Button>
            {allowDelete && (
                <Button view="flat-secondary" size="m" onClick={onRemove}>
                    <Icon awesome="trash-bin" />
                </Button>
            )}
        </div>
    );
}
