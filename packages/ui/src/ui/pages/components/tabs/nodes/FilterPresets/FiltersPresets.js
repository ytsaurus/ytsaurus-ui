import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import Icon from '../../../../../components/Icon/Icon';

import {getPresets} from '../../../../../store/selectors/components/nodes/filters-presets';
import {applyPreset, removePreset} from '../../../../../store/actions/components/nodes/nodes';

import './FiltersPresets.scss';

const block = cn('nodes-filters-preset');

class FiltersPresets extends Component {
    static propTypes = {
        // from connect
        presets: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                data: PropTypes.object.isRequired,
                isDefault: PropTypes.bool.isRequired,
            }).isRequired,
        ).isRequired,

        applyPreset: PropTypes.func.isRequired,
        removePreset: PropTypes.func.isRequired,

        // from parent
        onChange: PropTypes.func,
    };

    handlePresetClick = (preset) => {
        const {applyPreset, onChange} = this.props;

        applyPreset(preset.data);
        if (typeof onChange === 'function') {
            onChange(preset);
        }
    };

    handleRemoveClick = (evt, name) => {
        const {removePreset} = this.props;

        evt.stopPropagation();
        removePreset(name);
    };

    renderPreset(preset) {
        const {name, isDefault} = preset;

        return (
            <div
                onClick={() => this.handlePresetClick(preset)}
                className={block('preset')}
                key={name}
            >
                {name}

                {!isDefault && (
                    <span
                        onClick={(evt) => this.handleRemoveClick(evt, name)}
                        className={block('close')}
                    >
                        <Icon face="solid" awesome="times" />
                    </span>
                )}
            </div>
        );
    }

    render() {
        const {presets} = this.props;

        return (
            <div className={block()}>{map_(presets, (preset) => this.renderPreset(preset))}</div>
        );
    }
}

const mapStateToProps = (state) => ({presets: getPresets(state)});

export default connect(mapStateToProps, {applyPreset, removePreset})(FiltersPresets);
