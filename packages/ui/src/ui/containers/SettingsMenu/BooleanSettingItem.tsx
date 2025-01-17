import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Checkbox} from '@gravity-ui/uikit';

import {DescribedSettings} from '../../../shared/constants/settings-types';
import {KeysByType} from '../../../@types/types';

import {getSettingsData} from '../../store/selectors/settings/settings-base';
import {setSettingByKey} from '../../store/actions/settings';
import {SettingsItemLayot, SettingsItemLayotProps} from './SettingsItemLayout';

export type BooleanSettingItemProps<T> = {settingKey: T} & Omit<SettingsItemLayotProps, 'children'>;

export function BooleanSettingItem<T extends KeysByType<DescribedSettings, boolean>>({
    settingKey,
    ...rest
}: BooleanSettingItemProps<T>) {
    const dispatch = useDispatch();
    const {[settingKey]: checked} = useSelector(getSettingsData);

    return (
        <SettingsItemLayot {...rest}>
            <Checkbox
                content={rest.title}
                checked={Boolean(checked)}
                onUpdate={(value) => {
                    dispatch(setSettingByKey(settingKey, value));
                }}
                qa={settingKey}
            />
        </SettingsItemLayot>
    );
}
