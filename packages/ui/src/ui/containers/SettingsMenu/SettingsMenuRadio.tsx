import React, {VFC} from 'react';
import cn from 'bem-cn-lite';
import {connect, ConnectedProps} from 'react-redux';

import RadioButton, {ItemType} from '../../components/RadioButton/RadioButton';

import {setSetting} from '../../store/actions/settings';
import {makeGetSetting} from '../../store/selectors/settings';
import type {RootState} from '../../store/reducers';
import type {FIX_MY_TYPE} from '../../types';

const block = cn('elements-page');

interface BaseProps {
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

type SettingNS = FIX_MY_TYPE;

interface Props
    extends ConnectedProps<typeof connector>,
        Pick<BaseProps, 'items' | 'heading' | 'description' | 'onAfterChange' | 'convertValue'> {
    settingName: string;
    settingNS: SettingNS;
    onChange?(settingName: string, settingNS: SettingNS, value: unknown): void;
}

const SettingsMenuRadio: VFC<Props> = (props) => {
    const {settingName, settingNS, getSetting, setSetting, onChange, ...rest} = props;
    const onChangeHandler = React.useCallback(
        (value: unknown) => {
            if (onChange) onChange(settingName, settingNS, value);
        },
        [onChange, settingNS, settingName],
    );
    const set = React.useCallback(
        (value: unknown) => setSetting(settingName, settingNS, value),
        [setSetting, settingNS, settingName],
    );
    const get = React.useCallback(
        () => getSetting(settingName, settingNS),
        [getSetting, settingNS, settingName],
    );
    return (
        <SettingsMenuRadioBase
            {...rest}
            name={settingName}
            onChange={onChange ? onChangeHandler : undefined}
            set={set}
            get={get}
        />
    );
};

const mapStateToProps = (state: RootState) => {
    const getSetting = makeGetSetting(state);

    return {
        getSetting,
    };
};

const connector = connect(mapStateToProps, {setSetting});

export default connector(SettingsMenuRadio);
