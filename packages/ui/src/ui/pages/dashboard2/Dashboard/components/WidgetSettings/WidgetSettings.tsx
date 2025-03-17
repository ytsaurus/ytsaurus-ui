import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import remove_ from 'lodash/remove';

import {setSettingByKey} from '../../../../../store/actions/settings';
import {editItem, selectEdittingItem} from '../../../../../store/reducers/dashboard2/dashboard';
import {getSettingsData} from '../../../../../store/selectors/settings/settings-base';

import {FormApi, YTDFDialog} from '../../../../../components/Dialog';

import {useSettingsFields} from './use-settings-fields';

import './WidgetSettings.scss';

export function WidgetSettings() {
    const dispatch = useDispatch();

    const item = useSelector(selectEdittingItem);
    const config = useSelector(getSettingsData)['global::dashboard::config'];

    const {getFields} = useSettingsFields();

    const onClose = () => {
        dispatch(editItem({}));
    };

    const onAdd = async (form: FormApi<unknown>) => {
        const {values} = form.getState();
        const configItems = [...config.items];
        const prevItem = configItems.find((e) => e.id === item?.id);
        const newItem = {...prevItem, data: {...values}};
        remove_(configItems, prevItem);
        configItems.push(newItem);
        const newConfig = {...config, items: [...configItems]};
        console.log(values);
        return dispatch(setSettingByKey('global::dashboard::config', newConfig));
    };

    return (
        <YTDFDialog
            onAdd={onAdd}
            headerProps={{title: 'Widget settings'}}
            initialValues={item?.data}
            visible={Boolean(item)}
            fields={getFields(item?.type)}
            onClose={onClose}
        />
    );
}
