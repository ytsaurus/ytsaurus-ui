import React from 'react';
import {useDispatch, useSelector} from '../../store/redux-hooks';
import block from 'bem-cn-lite';

import {SegmentedRadioGroup, type SegmentedRadioGroupProps} from '@gravity-ui/uikit';

import {type KeysByType} from '../../../@types/types';
import {type DescribedSettings} from '../../../shared/constants/settings-types';
import SelectFacade, {
    type Item,
    SelectSingle,
    type YTSelectProps,
} from '../../components/Select/Select';
import {setSettingByKey} from '../../store/actions/settings';
import {selectSettingsData} from '../../store/selectors/settings/settings-base';

import {type SettingsItemLayoutProps} from './SettingsItemLayout';

import './SettingsMenu.scss';

const b = block('elements-page');

type SelectSettingItemProps<K extends KeysByType<DescribedSettings, string>> = {
    settingKey: K;
    options: Array<Item<DescribedSettings[K]>>;
    description?: React.ReactNode;
    displayValue?: DescribedSettings[K];
};

export function SelectSettingItem<K extends KeysByType<DescribedSettings, string>>({
    settingKey,
    options,
    description,
    displayValue,
}: SelectSettingItemProps<K>) {
    const dispatch = useDispatch();
    const storedValue = useSelector(selectSettingsData)[settingKey];
    const value = displayValue ?? storedValue;

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

type MultiSelectSettingItemProps<K extends KeysByType<DescribedSettings, Array<string>>> = {
    settingKey: K;
    options: Array<Item<DescribedSettings[K][number]>>;
    description?: React.ReactNode;
};

export function MultiSelectSettingItem<K extends KeysByType<DescribedSettings, Array<string>>>({
    settingKey,
    options,
    description,
    ...rest
}: MultiSelectSettingItemProps<K> &
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

type SegmentedSettingValue = string | number | boolean;
type SegmentedOption<T extends SegmentedSettingValue> = Omit<
    NonNullable<SegmentedRadioGroupProps['options']>[number],
    'value'
> & {value: T};
type ConvertedSegmentedSettingValue<T extends SegmentedSettingValue> = T extends number
    ? number
    : T extends boolean
      ? boolean
      : T;
type ConvertValueProps<T extends SegmentedSettingValue> = [T] extends [string]
    ? {convertValue?: never}
    : {convertValue: (value: string) => ConvertedSegmentedSettingValue<T>};

type SegmentedRadioGroupSettingItemProps<
    K extends KeysByType<DescribedSettings, SegmentedSettingValue>,
> = Omit<SettingsItemLayoutProps, 'children'> & {
    settingKey: K;
    options: Array<SegmentedOption<DescribedSettings[K]>>;
    displayValue?: DescribedSettings[K];
} & ConvertValueProps<DescribedSettings[K]>;

export function SegmentedRadioGroupSettingItem<
    K extends KeysByType<DescribedSettings, SegmentedSettingValue>,
>({
    settingKey,
    options,
    displayValue,
    convertValue,
    description,
    oneLine,
    title,
}: SegmentedRadioGroupSettingItemProps<K>) {
    const {value: storedValue, onUpdate} = useSettingByKey(settingKey);
    const value = displayValue ?? storedValue;

    return (
        <div className={b('settings-item', {'one-line': oneLine})} title={title}>
            <SegmentedRadioGroup
                options={options.map(({value: optionValue, ...option}) => ({
                    ...option,
                    value: String(optionValue),
                }))}
                value={String(value)}
                onUpdate={(nextValue) => {
                    const convertedValue = convertValue ? convertValue(nextValue) : nextValue;
                    onUpdate(convertedValue as DescribedSettings[K]);
                }}
                qa={settingKey}
            />
            {description && (
                <div className={b('settings-description', 'elements-secondary-text')}>
                    {description}
                </div>
            )}
        </div>
    );
}

function useSettingByKey<K extends keyof DescribedSettings>(settingKey: K) {
    const dispatch = useDispatch();
    const value = useSelector(selectSettingsData)[settingKey];

    return {
        value,
        onUpdate: React.useCallback(
            (v: typeof value) => {
                dispatch(setSettingByKey(settingKey, v));
            },
            [dispatch, settingKey],
        ),
    };
}
