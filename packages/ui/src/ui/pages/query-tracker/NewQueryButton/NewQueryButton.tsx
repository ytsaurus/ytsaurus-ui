import * as React from 'react';
import {useState} from 'react';
import {useSelector} from 'react-redux';
import {Button} from '@gravity-ui/uikit';
import Icon from '../../../components/Icon/Icon';
import Modal from '../../../components/Modal/Modal';
import {isQueryDraftEditted} from '../module/query/selectors';

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
                view="outlined"
                size="l"
                title="New query"
                onClick={handleClick}
            >
                <Icon awesome="file" size={16} />
                New
            </Button>
            <NewQueryPromt confirm={handleConfirm} cancel={handleCancel} visible={visible} />
        </React.Fragment>
    );
};
