import React, {FC} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import {useDispatch} from 'react-redux';
import {removeQueryToken} from '../../../../store/actions/settings/settings';
import {YTDFDialog} from '../../../../components/Dialog';
import {useToggle} from 'react-use';
import i18n from './i18n';

type Props = {
    name: string;
};

export const QueryTokenRemoveButton: FC<Props> = ({name}) => {
    const dispatch = useDispatch();
    const [showModal, toggleShowModal] = useToggle(false);

    const handleClick = () => {
        toggleShowModal();
    };

    const handleConfirm = async () => {
        toggleShowModal();
        dispatch(removeQueryToken(name));
    };

    return (
        <>
            <Button onClick={handleClick}>
                <Icon data={TrashBinIcon} size={16} />
            </Button>
            <YTDFDialog
                visible={showModal}
                pristineSubmittable
                headerProps={{title: i18n('title_remove-token')}}
                fields={[
                    {
                        type: 'block',
                        name: 'message',
                        extras: {
                            children: i18n('confirm_remove-token', {name}),
                        },
                    },
                ]}
                onAdd={handleConfirm}
                onClose={toggleShowModal}
            />
        </>
    );
};
