import React from 'react';
import cn from 'bem-cn-lite';

import RadioButton, {type ItemType} from '../../../components/RadioButton/RadioButton';

const block = cn('elements-page');

export interface BaseProps {
    items: ItemType[];
    name: string;
    heading?: string;
    description?: string;
    convertValue?(value: string): unknown;
    onChange?(value: unknown): void;
    onAfterChange?(): void;
    set(value: unknown): Promise<void>;
    get(): unknown;
}

/**
 * @deprecated
 * Uses the legacy `settingName`/`settingNS` pattern.
 * Use `SettingsMenuRadioByKey` instead.
 */
export const SettingsMenuRadioBase = (props: BaseProps) => {
    const {
        name,
        items,
        heading,
        description,
        convertValue = (v) => v,
        onChange,
        onAfterChange,
        set,
        get,
        ...rest
    } = props;

    const handleChange = React.useCallback(
        (evt: React.ChangeEvent<HTMLInputElement>) => {
            const value = convertValue(evt.target.value);
            if (onChange) {
                return onChange(value);
            } else {
                const res = set(value);
                if (onAfterChange) {
                    onAfterChange();
                }
                return res;
            }
        },
        [convertValue, onChange, set, onAfterChange],
    );

    return (
        <div className={block('settings-item')}>
            {heading && <div className={block('settings-radio-heading')}>{heading}</div>}

            <RadioButton
                {...rest}
                size="m"
                items={items}
                name={name}
                onChange={handleChange}
                value={String(get())}
            />

            {description && (
                <div className={block('settings-description', 'elements-secondary-text')}>
                    {description}
                </div>
            )}
        </div>
    );
};
