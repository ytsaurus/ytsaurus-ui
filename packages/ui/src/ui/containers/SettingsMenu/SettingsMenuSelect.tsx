import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import block from 'bem-cn-lite';

import {RadioButton, RadioButtonProps} from '@gravity-ui/uikit';

import {KeysByType} from '../../../@types/types';
import {DescribedSettings} from '../../../shared/constants/settings-types';
import SelectFacade, {Item, SelectSingle, YTSelectProps} from '../../components/Select/Select';
import {setSettingByKey} from '../../store/actions/settings';
import {getSettingsData} from '../../store/selectors/settings/settings-base';

import {SettingsItemLayot, SettingsItemLayotProps} from './SettingsItemLayout';

import './SettingsMenu.scss';

const b = block('elements-page');

type SettingsMenuSelectOption =
    | {options: Array<{value: string; text: string}>}
    | {getOptionsOnMount: () => Promise<Array<{value: string; text: string}>>};
type SettingsMenuSelectProps = {
    placeholder?: string;
    label?: string;
    getSetting: () => string;
    setSetting: (value?: string) => void;
} & SettingsMenuSelectOption;

export const SettingsMenuSelect = (props: SettingsMenuSelectProps) => {
    const value = props.getSetting();
    const [items, setItems] = useState('options' in props ? props.options : []);

    useEffect(() => {
        if ('getOptionsOnMount' in props) {
            props?.getOptionsOnMount().then((options) => {
                setItems(options);
            });
        }
    }, []);

    return (
        <div className={b('settings-item', {select: true})} title={props.label}>
            <SelectSingle
                value={value}
                items={items}
                onChange={(value) => props.setSetting(value)}
                placeholder={props.placeholder}
                width="max"
            />
        </div>
    );
};

type SettingMenuSelectByKeyProps<K extends KeysByType<DescribedSettings, string>> = {
    settingKey: K;
    options: Array<Item<DescribedSettings[K]>>;
    description?: React.ReactNode;
};

export function SettingMenuSelectByKey<K extends KeysByType<DescribedSettings, string>>({
    settingKey,
    options,
    description,
}: SettingMenuSelectByKeyProps<K>) {
    const dispatch = useDispatch();
    const value = useSelector(getSettingsData)[settingKey];

    return (
        <div className={b('settings-item', {select: true})}>
            <SelectSingle
                value={value}
                items={options}
                onChange={(v) => {
                    dispatch(setSettingByKey(settingKey, v as typeof value));
                }}
                width="max"
            />
            {Boolean(description) && (
                <div className="elements-page__settings-description elements-secondary-text">
                    {description}
                </div>
            )}
        </div>
    );
}

type SettingMenuMultiSelectByKeyProps<K extends KeysByType<DescribedSettings, Array<string>>> = {
    settingKey: K;
    options: Array<Item<DescribedSettings[K][number]>>;
    description?: React.ReactNode;
};

export function SettingMenuMultiSelectByKey<
    K extends KeysByType<DescribedSettings, Array<string>>,
>({
    settingKey,
    options,
    description,
    ...rest
}: SettingMenuMultiSelectByKeyProps<K> &
    Omit<YTSelectProps<string>, 'value' | 'items' | 'onChange' | 'onUpdate'>) {
    const {value, onUpdate} = useSettingByKey(settingKey);

    return (
        <div className={b('settings-item', {select: true})}>
            <SelectFacade
                multiple
                value={value}
                items={options}
                onChange={(v) => onUpdate(v as typeof value)}
                width="max"
                {...rest}
            />
            {Boolean(description) && (
                <div className="elements-page__settings-description elements-secondary-text">
                    {description}
                </div>
            )}
        </div>
    );
}

type SettingsMenuRadioByKeyProps<K extends KeysByType<DescribedSettings, string>> = Omit<
    SettingsItemLayotProps,
    'children'
> & {
    settingKey: K;
    options: RadioButtonProps<DescribedSettings[K]>['options'];
};

export function SettingsMenuRadioByKey<K extends KeysByType<DescribedSettings, string>>({
    settingKey,
    options,
    ...rest
}: SettingsMenuRadioByKeyProps<K>) {
    const {value, onUpdate} = useSettingByKey(settingKey);

    return (
        <SettingsItemLayot {...rest}>
            <RadioButton options={options} value={value} onUpdate={onUpdate} />
        </SettingsItemLayot>
    );
}

function useSettingByKey<K extends keyof DescribedSettings>(settingKey: K) {
    const dispatch = useDispatch();
    const value = useSelector(getSettingsData)[settingKey];

    return {
        value,
        onUpdate: React.useCallback(
            (v: typeof value) => {
                dispatch(setSettingByKey(settingKey, v));
            },
            [settingKey],
        ),
    };
}
