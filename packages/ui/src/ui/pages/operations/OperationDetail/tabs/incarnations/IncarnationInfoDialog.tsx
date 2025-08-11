import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {YTDFDialog} from '../../../../../components/Dialog';
import Yson from '../../../../../components/Yson/Yson';

import {
    getIncarnationInfoDialog,
    toggleIncarnationInfoDialog,
} from '../../../../../store/reducers/operations/incarnations';

import {detailsCn} from './constants';

import './Incarnations.scss';

export function IncarnationInfoDialog() {
    const dispatch = useDispatch();
    const data = useSelector(getIncarnationInfoDialog);
    const switchInfo = data?.incarnation.switch_info;
    const switchReason = data?.incarnation.switch_reason;

    const value = {
        incarnation_switch_info: switchInfo,
        incarnation_switch_reason: switchReason,
    };

    const handleClose = () => {
        dispatch(toggleIncarnationInfoDialog({infoDialog: null}));
    };

    const handleAdd = () => {
        handleClose();
        return Promise.resolve();
    };

    return (
        <YTDFDialog
            visible={Boolean(data)}
            headerProps={{title: 'Incarnation info'}}
            onClose={handleClose}
            fields={[
                {
                    type: 'block' as const,
                    name: 'incarnation-info',
                    extras: {
                        children: (
                            <Yson
                                className={detailsCn}
                                settings={{format: 'json'}}
                                value={value || {}}
                            />
                        ),
                    },
                },
            ]}
            pristineSubmittable
            onAdd={handleAdd}
        />
    );
}
