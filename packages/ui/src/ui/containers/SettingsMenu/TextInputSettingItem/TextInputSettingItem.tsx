import React, {useCallback, useState} from 'react';
import cn from 'bem-cn-lite';

import {TextInput} from '@gravity-ui/uikit';

import {type KeysByType} from '../../../../@types/types';
import {type DescribedSettings} from '../../../../shared/constants/settings-types';
import {setSettingByKey} from '../../../store/actions/settings';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectSettingsData} from '../../../store/selectors/settings/settings-base';

const block = cn('elements-page');

type StringSettingKey = KeysByType<DescribedSettings, string> &
    {
        [K in keyof DescribedSettings]: string extends DescribedSettings[K] ? K : never;
    }[keyof DescribedSettings];

export type TextInputSettingItemProps<T extends StringSettingKey> = {
    settingKey: T;
    heading?: string;
    description?: React.ReactNode;
    placeholder?: string;
    validator?: (value: string) => string | null | undefined;
};

export function TextInputSettingItem<T extends StringSettingKey>({
    settingKey,
    heading,
    description,
    placeholder,
    validator,
}: TextInputSettingItemProps<T>) {
    const dispatch = useDispatch();
    const settings = useSelector(selectSettingsData);
    const [value, setValue] = useState<string>(settings[settingKey] ?? '');
    const error = validator?.(value) || undefined;

    const handleBlur = useCallback(() => {
        if (!error) {
            dispatch(setSettingByKey(settingKey, value as DescribedSettings[T]));
        }
    }, [dispatch, error, settingKey, value]);

    return (
        <div className={block('settings-item')}>
            {heading && <div className={block('settings-radio-heading')}>{heading}</div>}

            <TextInput
                hasClear
                size="m"
                placeholder={placeholder}
                onUpdate={setValue}
                onBlur={handleBlur}
                error={error}
                value={value}
            />

            {description && (
                <div className={block('settings-description', 'elements-secondary-text')}>
                    {description}
                </div>
            )}
        </div>
    );
}
