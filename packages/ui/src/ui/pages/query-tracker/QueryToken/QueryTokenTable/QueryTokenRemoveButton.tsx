import React, {FC, useState} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import {useDispatch} from '../../../../store/redux-hooks';
import {removeQueryToken} from '../../../../store/actions/settings/settings';
import {YTDFDialog} from '../../../../components/Dialog';
import i18n from './i18n';

type Props = {
    name: string;
};

export const QueryTokenRemoveButton: FC<Props> = ({name}) => {
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);

    const handleConfirm = async () => {
        setShowModal(false);
        dispatch(removeQueryToken(name));
    };

    return (
        <>
            <Button view="flat" onClick={() => setShowModal(true)}>
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
                onClose={() => setShowModal(false)}
            />
        </>
    );
};
