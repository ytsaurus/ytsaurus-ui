import React, {VFC} from 'react';
import cn from 'bem-cn-lite';
import {connect, ConnectedProps} from 'react-redux';

import RadioButton, {ItemType} from '../../components/RadioButton/RadioButton';

import {setSetting} from '../../store/actions/settings';
import {makeGetSetting} from '../../store/selectors/settings';
import type {RootState} from '../../store/reducers';
import type {FIX_MY_TYPE} from '../../types';

const block = cn('elements-page');

type SettingNS = FIX_MY_TYPE;

interface Props extends ConnectedProps<typeof connector> {
    settingName: string;
    settingNS: SettingNS;
    items: ItemType[];

    onAfterChange?(): void;
    onChange?(settingName: string, settingNS: SettingNS, value: unknown): void;
    heading?: string;
    description?: string;

    convertValue?(value: string): unknown;
}

const SettingsMenuRadio: VFC<Props> = (props) => {
    const {getSetting, setSetting, onAfterChange, convertValue = (v) => v, ...rest} = props;
    const {settingName, settingNS, items} = props;
    const {heading, description, onChange} = props;

    const handleChange = React.useCallback(
        (evt: React.ChangeEvent<HTMLInputElement>) => {
            const value = convertValue(evt.target.value);
            if (onChange) {
                return onChange(settingName, settingNS, value);
            } else {
                const res = setSetting(settingName, settingNS, value);
                if (onAfterChange) {
                    onAfterChange();
                }
                return res;
            }
        },
        [onChange, onAfterChange, setSetting, settingName, settingNS, convertValue],
    );

    return (
        <div className={block('settings-item')}>
            {heading && <div className={block('settings-radio-heading')}>{heading}</div>}

            <RadioButton
                {...rest}
                size="m"
                items={items}
                name={settingName}
                onChange={handleChange}
                value={String(getSetting(settingName, settingNS))}
            />

            {description && (
                <div className={block('settings-description', 'elements-secondary-text')}>
                    {description}
                </div>
            )}
        </div>
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
