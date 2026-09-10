import {withRouter} from 'react-router';
import {connect} from 'react-redux';

import {NAMESPACES} from '../../../../../../shared/constants/settings';
import {
    applyFilterPreset,
    removeFilterPreset,
    saveFilterPreset,
    toggleSaveFilterPresetDialog,
} from '../../../../../store/actions/operations';
import {DEFAULT_PRESET_SETTING} from '../../../../../constants/operations';
import {OPERATIONS_LIST_RUNNING_PRESET} from '../../../../../constants/operations/list';

import {selectGetSetting} from '../../../../../store/selectors/settings';
import {
    selectOperationsListActivePresets,
    selectOperationsListFilterPresets,
} from '../../../../../store/selectors/operations/operations-list';

import '../OperationsFilterPresets.scss';

import {OperationsFilterPresetsBase} from './OperationsFilterPresetsBase';

function mapStateToProps(state) {
    const {operations} = state;

    const getSetting = selectGetSetting(state);
    let defaultPreset = getSetting(DEFAULT_PRESET_SETTING, NAMESPACES.OPERATION);
    const presets = selectOperationsListFilterPresets(state);

    if (!presets[defaultPreset]) {
        defaultPreset = OPERATIONS_LIST_RUNNING_PRESET;
    }

    return {
        presets,
        activePresets: selectOperationsListActivePresets(state),
        defaultPreset,
        dialog: operations.list.savePresetDialog,
    };
}

const mapDispatchToProps = {
    applyFilterPreset,
    removeFilterPreset,
    saveFilterPreset,
    toggleSaveFilterPresetDialog,
};

export const OperationsFilterPresets = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(OperationsFilterPresetsBase),
);
