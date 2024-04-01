import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {Button, Icon} from '@gravity-ui/uikit';
import Modal from '../../../components/Modal/Modal';
import {isQueryDraftEditted} from '../module/query/selectors';
import FilePlusIcon from '@gravity-ui/icons/svgs/file-plus.svg';

const NewQueryPromt = (props: {cancel: () => void; confirm: () => void; visible: boolean}) => {
    return (
        <Modal
            title="New query"
            content="All the changes will be lost. Are you sure you want to reset query?"
            onCancel={props.cancel}
            onConfirm={props.confirm}
            onOutsideClick={props.cancel}
            visible={props.visible}
        />
    );
};

export const NewQueryButton = ({onClick}: {onClick: () => void}) => {
    const dirtyQuery = useSelector(isQueryDraftEditted);
    const [visible, setVisible] = useState(false);

    const handleClick = () => {
        if (dirtyQuery) {
            setVisible(true);
        } else {
            onClick();
        }
    };

    const handleConfirm = () => {
        onClick();

        setVisible(false);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    return (
        <React.Fragment>
            <Button
                qa="new-query-btn"
                view="action"
                size="l"
                title="New query"
                onClick={handleClick}
            >
                <Icon data={FilePlusIcon} size={16} />
                New
            </Button>
            <NewQueryPromt confirm={handleConfirm} cancel={handleCancel} visible={visible} />
        </React.Fragment>
    );
};
