import {connect} from 'react-redux';

import {setSetting} from '../../../store/actions/settings';
import {selectGetSetting} from '../../../store/selectors/settings';

import {SettingsMenuInputBase} from './SettingsMenuInputBase';

const mapStateToProps = (state) => {
    const getSetting = selectGetSetting(state);

    return {
        getSetting,
    };
};

/**
 * @deprecated
 * Uses the legacy `settingName`/`settingNS` pattern.
 * There is no by-key replacement yet — a new component needs to be implemented following the
 * `settingKey` pattern, see `BooleanSettingItem` for reference.
 */
export const SettingsMenuInput = connect(mapStateToProps, {setSetting})(SettingsMenuInputBase);
