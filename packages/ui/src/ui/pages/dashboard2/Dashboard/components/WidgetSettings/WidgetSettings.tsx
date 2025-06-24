import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {editConfig} from '../../../../../store/actions/dashboard2/dashboard';
import {
    closeSettingsDialog,
    getEdittingItem,
    getSettingsDialogVisibility,
} from '../../../../../store/reducers/dashboard2/dashboard';

import {FormApi, YTDFDialog} from '../../../../../components/Dialog';

import hammer from '../../../../../common/hammer';

import {SettingsValues} from './SettingsValues';

import {useSettingsFields} from './use-settings-fields';

import './WidgetSettings.scss';

export function WidgetSettings() {
    const dispatch = useDispatch();

    const item = useSelector(getEdittingItem);
    const visible = useSelector(getSettingsDialogVisibility);

    const {getFields} = useSettingsFields();

    const onClose = () => {
        dispatch(closeSettingsDialog());
    };

    const onAdd = async (form: FormApi<SettingsValues>) => {
        const {values} = form.getState();
        if (!item) {
            return Promise.reject("Can't get current widget, please try again");
        }
        dispatch(editConfig(item?.target, values, item));
        return Promise.resolve();
    };

    return (
        <YTDFDialog<SettingsValues>
            onAdd={onAdd}
            key={item?.id}
            headerProps={{
                title: `${hammer.format['ReadableField'](item?.type + ' widget') || 'Widget'} settings`,
            }}
            pristineSubmittable
            initialValues={item?.data}
            visible={visible}
            size={'l'}
            fields={getFields(item?.type)}
            onClose={onClose}
        />
    );
}
