import {connect} from 'react-redux';

import {selectPresets} from '../../../../../store/selectors/components/nodes/filters-presets';
import {applyPreset, removePreset} from '../../../../../store/actions/components/nodes/nodes';

import './FiltersPresets.scss';

import {FiltersPresetsBase} from './FiltersPresetsBase';

const mapStateToProps = (state) => ({presets: selectPresets(state)});

const FiltersPresets = connect(mapStateToProps, {
    applyPreset,
    removePreset,
})(FiltersPresetsBase);

export default FiltersPresets;
