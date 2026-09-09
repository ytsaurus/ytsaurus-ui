import React, {type VFC} from 'react';

import {setSetting} from '../../../store/actions/settings';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectGetSetting} from '../../../store/selectors/settings';
import {type FIX_MY_TYPE} from '../../../types';

import {type BaseProps, SettingsMenuRadioBase} from './SettingsMenuRadioBase';

type SettingNS = FIX_MY_TYPE;

interface Props extends Pick<
    BaseProps,
    'items' | 'heading' | 'description' | 'onAfterChange' | 'convertValue'
> {
    settingName: string;
    settingNS: SettingNS;
    onChange?(settingName: string, settingNS: SettingNS, value: unknown): void;
}

/**
 * @deprecated
 * Uses the legacy `settingName`/`settingNS` pattern.
 * Use `SettingsMenuRadioByKey` instead.
 */
export const SettingsMenuRadio: VFC<Props> = (props) => {
    const {settingName, settingNS, onChange, ...rest} = props;
    const dispatch = useDispatch();
    const getSetting = useSelector(selectGetSetting);
    const onChangeHandler = React.useCallback(
        (value: unknown) => {
            if (onChange) onChange(settingName, settingNS, value);
        },
        [onChange, settingNS, settingName],
    );
    const set = React.useCallback(
        (value: unknown) => dispatch(setSetting(settingName, settingNS, value)),
        [dispatch, settingNS, settingName],
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
