import React, {FC, MouseEvent, useState} from 'react';
import {useSelector} from 'react-redux';
import {Button, Icon} from '@gravity-ui/uikit';
import Modal from '../../../components/Modal/Modal';
import {isQueryDraftEditted} from '../../../store/selectors/queries/query';
import FilePlusIcon from '@gravity-ui/icons/svgs/file-plus.svg';
import {Page} from '../../../../shared/constants/settings';
import {getCluster} from '../../../store/selectors/global';

export const NewQueryPromt = (props: {
    cancel: () => void;
    confirm: () => void;
    visible: boolean;
}) => {
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

type Props = {
    onClick: () => void;
    hideText?: boolean;
};

export const NewQueryButton: FC<Props> = ({onClick, hideText}) => {
    const dirtyQuery = useSelector(isQueryDraftEditted);
    const [visible, setVisible] = useState(false);
    const cluster = useSelector(getCluster);

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

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
                href={`/${cluster}/${Page.QUERIES}`}
                onClick={handleClick}
            >
                <Icon data={FilePlusIcon} size={16} />
                {!hideText && 'New'}
            </Button>
            <NewQueryPromt confirm={handleConfirm} cancel={handleCancel} visible={visible} />
        </React.Fragment>
    );
};
