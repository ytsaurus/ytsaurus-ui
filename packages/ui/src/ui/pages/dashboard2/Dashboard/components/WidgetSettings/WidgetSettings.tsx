import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import remove_ from 'lodash/remove';

import {setSettingByKey} from '../../../../../store/actions/settings';
import {editItem, getEdittingItem} from '../../../../../store/reducers/dashboard2/dashboard';
import {getDashboardConfig} from '../../../../../store/selectors/dashboard2/dashboard';
import {getCluster} from '../../../../../store/selectors/global';

import {FormApi, YTDFDialog} from '../../../../../components/Dialog';

import hammer from '../../../../../common/hammer';

import {SettingsValues} from './SettingsValues';

import {useSettingsFields} from './use-settings-fields';

import './WidgetSettings.scss';

export function WidgetSettings() {
    const dispatch = useDispatch();

    const item = useSelector(getEdittingItem);
    const config = useSelector(getDashboardConfig);
    const cluster = useSelector(getCluster);

    const {getFields} = useSettingsFields();

    const onClose = () => {
        dispatch(editItem({}));
    };

    const onAdd = async (form: FormApi<SettingsValues>) => {
        const {values} = form.getState();
        const configItems = [...config.items];
        const prevItem = configItems.find((e) => e.id === item?.id);
        if (prevItem) {
            const newItem = {...prevItem, data: {...values}};
            remove_(configItems, prevItem);
            configItems.push(newItem);
            const newConfig = {...config, items: [...configItems]};
            dispatch(setSettingByKey(`local::${cluster}::dashboard::config`, newConfig));
            return Promise.resolve();
        }
        return Promise.reject('Failed to update dashboard');
    };

    return (
        <YTDFDialog<SettingsValues>
            onAdd={onAdd}
            headerProps={{
                title: `${hammer.format['ReadableField'](item?.type + ' widget') || 'Widget'} settings`,
            }}
            pristineSubmittable
            initialValues={item?.data}
            visible={Boolean(item)}
            fields={getFields(item?.type)}
            onClose={onClose}
        />
    );
}
