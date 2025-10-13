import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import b from 'bem-cn-lite';

import {DialogWrapper} from '../../../../../components/DialogWrapper/DialogWrapper';
import Yson from '../../../../../components/Yson/Yson';

import {
    getIncarnationInfoDialog,
    toggleIncarnationInfoDialog,
} from '../../../../../store/reducers/operations/incarnations';

import i18n from './i18n';

import './IncarnationInfoDialog.scss';

const block = b('incarnation-info-dialog');

export function IncarnationInfoDialog() {
    const dispatch = useDispatch();

    const data = useSelector(getIncarnationInfoDialog);
    const switchInfo = data?.incarnation?.switch_info;
    const switchReason = data?.incarnation?.switch_reason;

    const value: Record<string, unknown> = {};

    if (switchInfo) {
        value.incarnation_switch_info = switchInfo;
    }
    if (switchReason) {
        value.incarnation_switch_reason = switchReason;
    }

    const handleClose = () => {
        dispatch(
            toggleIncarnationInfoDialog({
                infoDialog: {incarnation: data?.incarnation || null, visible: false},
            }),
        );
    };

    return (
        <DialogWrapper size={'m'} open={Boolean(data?.visible)} onClose={handleClose}>
            <DialogWrapper.Header caption={i18n('incarnation-info')} />
            <DialogWrapper.Body>
                <Yson
                    className={block('details')}
                    settings={{format: 'json'}}
                    value={value ?? {}}
                />
            </DialogWrapper.Body>
        </DialogWrapper>
    );
}
