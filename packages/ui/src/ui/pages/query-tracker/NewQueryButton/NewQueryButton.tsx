import React, {FC, MouseEvent, useState} from 'react';
import {useSelector} from '../../../store/redux-hooks';
import {Button, Icon} from '@gravity-ui/uikit';
import Modal from '../../../components/Modal/Modal';
import {isQueryDraftEditted} from '../../../store/selectors/query-tracker/query';
import FilePlusIcon from '@gravity-ui/icons/svgs/file-plus.svg';
import {Page} from '../../../../shared/constants/settings';
import {getCluster} from '../../../store/selectors/global';
import i18n from './i18n';

export const NewQueryPromt = (props: {
    cancel: () => void;
    confirm: () => void;
    visible: boolean;
}) => {
    return (
        <Modal
            title={i18n('title_new-query')}
            content={i18n('confirm_new-query')}
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
                title={i18n('title_new-query')}
                href={`/${cluster}/${Page.QUERIES}`}
                onClick={handleClick}
            >
                <Icon data={FilePlusIcon} size={16} />
                {!hideText && i18n('action_new')}
            </Button>
            <NewQueryPromt confirm={handleConfirm} cancel={handleCancel} visible={visible} />
        </React.Fragment>
    );
};
