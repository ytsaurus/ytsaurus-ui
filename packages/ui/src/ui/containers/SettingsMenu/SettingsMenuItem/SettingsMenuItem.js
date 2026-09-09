import {connect} from 'react-redux';

import {setSetting} from '../../../store/actions/settings';
import {selectGetSetting} from '../../../store/selectors/settings';

import '../SettingsMenu.scss';

import {SettingsMenuItemBase} from './SettingsMenuItemBase';

function mapStateToProps(state) {
    return {
        getSetting: selectGetSetting(state),
    };
}

/**
 * @deprecated
 * Uses the legacy `settingName`/`settingNS` pattern.
 * Use `BooleanSettingItem` instead. Note: it does not yet support the
 * `useSwitch`/`annotationHighlight` variants of this component — extend it if you need those.
 */
export const SettingsMenuItem = connect(mapStateToProps, {setSetting})(SettingsMenuItemBase);
