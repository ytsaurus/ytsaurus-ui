import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {setSetting} from '../../store/actions/settings';
import {NAMESPACES, SettingName} from '../../../shared/constants/settings';
import RadioButton from '../../components/RadioButton/RadioButton';
import {mastersRadioButtonItems} from '../../constants/system/masters';
import {getMastersHostType} from '../../store/selectors/settings';

VisibleHostTypeRadioButton.propTypes = {
    hostType: PropTypes.string,
    setSetting: PropTypes.func,
};

function VisibleHostTypeRadioButton({hostType, setSetting, className}) {
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

const mapStateToProps = (state) => {
    return {
        hostType: getMastersHostType(state),
    };
};

const mapDispatchToProps = {
    setSetting,
};

export default connect(mapStateToProps, mapDispatchToProps)(VisibleHostTypeRadioButton);
