import React from 'react';
import {useDispatch, useSelector} from '../../store/redux-hooks';

import {Checkbox} from '@gravity-ui/uikit';

import {type DescribedSettings} from '../../../shared/constants/settings-types';
import {type KeysByType} from '../../../@types/types';

import {selectSettingsData} from '../../store/selectors/settings/settings-base';
import {setSettingByKey} from '../../store/actions/settings';
import {SettingsItemLayout, type SettingsItemLayoutProps} from './SettingsItemLayout';

export type BooleanSettingItemProps<T> = {settingKey: T} & Omit<
    SettingsItemLayoutProps,
    'children'
>;

export function BooleanSettingItem<T extends KeysByType<DescribedSettings, boolean>>({
    settingKey,
    ...rest
}: BooleanSettingItemProps<T>) {
    const dispatch = useDispatch();
    const {[settingKey]: checked} = useSelector(selectSettingsData);

    return (
        <SettingsItemLayout {...rest}>
            <Checkbox
                content={rest.title}
                checked={Boolean(checked)}
                onUpdate={(value) => {
                    dispatch(setSettingByKey(settingKey, value));
                }}
                qa={settingKey}
            />
        </SettingsItemLayout>
    );
}
