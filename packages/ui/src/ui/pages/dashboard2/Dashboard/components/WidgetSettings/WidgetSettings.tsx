import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';

import {editConfig} from '../../../../../store/actions/dashboard2/dashboard';
import {
    closeSettingsDialog,
    getEdittingItem,
    getSettingsDialogVisibility,
} from '../../../../../store/reducers/dashboard2/dashboard';

import {FormApi, YTDFDialog} from '../../../../../components/Dialog';

import format from '../../../../../common/hammer/format';

import {SettingsValues} from './SettingsValues';

import {useSettingsFields} from './use-settings-fields';

import i18n from './i18n';

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
            return Promise.reject(i18n('alert_widget-get-error'));
        }
        dispatch(editConfig(item?.target, values, item));
        return Promise.resolve();
    };

    return (
        <YTDFDialog<SettingsValues>
            onAdd={onAdd}
            key={`${item?.id}_${item?.type}`}
            headerProps={{
                title: item?.type
                    ? i18n('title_widget-settings-typed', {type: format.ReadableField(item.type)})
                    : i18n('title_widget-settings'),
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
