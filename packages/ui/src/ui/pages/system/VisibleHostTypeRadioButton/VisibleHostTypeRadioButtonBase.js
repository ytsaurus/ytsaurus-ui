import React from 'react';
import PropTypes from 'prop-types';
import {NAMESPACES, SettingName} from '../../../../shared/constants/settings';
import RadioButton from '../../../components/RadioButton/RadioButton';
import {mastersRadioButtonItems} from '../../../constants/system/masters';

VisibleHostTypeRadioButtonBase.propTypes = {
    hostType: PropTypes.string,
    setSetting: PropTypes.func,
};

export function VisibleHostTypeRadioButtonBase({hostType, setSetting, className}) {
    const onChange = React.useCallback(
        (evt) => {
            setSetting(SettingName.SYSTEM.MASTERS_HOST_TYPE, NAMESPACES.SYSTEM, evt.target.value);
        },
        [setSetting],
    );

    return (
        <RadioButton
            name="master-host-type"
            onChange={onChange}
            value={hostType}
            items={mastersRadioButtonItems}
            size="s"
            className={className}
        />
    );
}
