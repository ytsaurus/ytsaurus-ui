import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {Button, Checkbox, TextInput} from '@gravity-ui/uikit';

import {NAMESPACES} from '../../../../../shared/constants/settings';
import {
    applyFilterPreset,
    removeFilterPreset,
    saveFilterPreset,
    toggleSaveFilterPresetDialog,
} from '../../../../store/actions/operations';
import {DEFAULT_PRESET_SETTING} from '../../../../constants/operations';
import {OPERATIONS_LIST_RUNNING_PRESET} from '../../../../constants/operations/list';

import {makeGetSetting} from '../../../../store/selectors/settings';
import {
    getOperationsListActivePresets,
    getOperationsListFilterPresets,
} from '../../../../store/selectors/operations/operations-list';
import Modal from '../../../../components/Modal/Modal';
import Icon from '../../../../components/Icon/Icon';

import './OperationsFilterPresets.scss';

const ELEMENT = 'toolbar-presets';
const block = cn('operations-list');
const tbBlock = cn('elements-toolbar');

class OperationsFilterPresets extends Component {
    static propTypes = {
        // from connect
        applyFilterPreset: PropTypes.func.isRequired,
        removeFilterPreset: PropTypes.func.isRequired,
        saveFilterPreset: PropTypes.func.isRequired,
        toggleSaveFilterPresetDialog: PropTypes.func.isRequired,
        presets: PropTypes.objectOf(
            PropTypes.shape({
                failedJobs: PropTypes.bool,
                pool: PropTypes.string,
                state: PropTypes.string,
                text: PropTypes.string,
                type: PropTypes.string,
                user: PropTypes.string,
            }),
        ).isRequired,
        defaultPreset: PropTypes.string,
        dialog: PropTypes.shape({
            isSaving: PropTypes.bool.isRequired,
            name: PropTypes.string.isRequired,
            isDefault: PropTypes.bool.isRequired,
        }).isRequired,
        // from react-router
        location: PropTypes.shape({
            search: PropTypes.string.isRequired,
        }).isRequired,
    };

    state = {
        presetName: '',
        isPresetDefault: false,
    };

    componentDidMount() {
        const {applyFilterPreset, defaultPreset, presets, location} = this.props;

        if (location.search.length <= 1) {
            applyFilterPreset(presets[defaultPreset], false);
        }
    }

    onConfirm = () => {
        const {saveFilterPreset, toggleSaveFilterPresetDialog} = this.props;
        const {presetName, isPresetDefault} = this.state;
        saveFilterPreset(presetName, isPresetDefault).then(() => {
            this.setState({
                presetName: '',
                isPresetDefault: false,
            });
            toggleSaveFilterPresetDialog();
        });
    };

    makeRemoveHandler = (presetId) => {
        return (event) => {
            event.stopPropagation();
            this.props.removeFilterPreset(presetId);
        };
    };

    isPresetNameEmpty = () => !this.state.presetName;

    renderSavePresetDialog() {
        const {dialog, toggleSaveFilterPresetDialog} = this.props;
        const {presetName, isPresetDefault} = this.state;

        const block = cn('elements-form');
        const INPUT_ID = 'save-preset-filter';

        return (
            <Modal
                title="Save filter"
                confirmText="Save"
                visible={dialog.isSaving}
                onCancel={toggleSaveFilterPresetDialog}
                onConfirm={this.onConfirm}
                isConfirmDisabled={this.isPresetNameEmpty}
                content={
                    <React.Fragment>
                        <div className={block('field')}>
                            <label
                                htmlFor={INPUT_ID}
                                className={block('label')}
                                title="Filter name"
                            >
                                Filter name
                            </label>
                            <TextInput
                                id={INPUT_ID}
                                value={presetName}
                                onUpdate={(presetName) => this.setState({presetName})}
                                autoFocus
                            />
                        </div>
                        <div className={block('field')}>
                            <Checkbox
                                checked={isPresetDefault}
                                onChange={(isPresetDefault) => this.setState({isPresetDefault})}
                            >
                                Default filter
                            </Checkbox>
                        </div>
                    </React.Fragment>
                }
            />
        );
    }

    render() {
        const {defaultPreset, presets, applyFilterPreset, activePresets} = this.props;

        return (
            <div className={block(ELEMENT, tbBlock('container'))}>
                {this.renderSavePresetDialog()}
                {_.map(presets, (preset, presetId) => {
                    const active = activePresets.has(presetId);
                    return (
                        <div className={block(ELEMENT, tbBlock('component'))} key={presetId}>
                            <Button
                                className={block('preset', {active})}
                                onClick={() => applyFilterPreset(preset)}
                                role="button"
                                selected={active}
                            >
                                <span className={block('preset-content')}>
                                    <span className={block('preset-name')}>
                                        {defaultPreset === presetId && <Icon awesome="star-alt" />}
                                        &ensp;
                                        {preset.name}
                                    </span>
                                    {!preset.preconfigured && (
                                        <span
                                            className={block('preset-remove')}
                                            onClick={this.makeRemoveHandler(presetId)}
                                        >
                                            <Icon face="solid" awesome="times" />
                                        </span>
                                    )}
                                </span>
                            </Button>
                        </div>
                    );
                })}
            </div>
        );
    }
}

function mapStateToProps(state) {
    const {operations} = state;

    const getSetting = makeGetSetting(state);
    let defaultPreset = getSetting(DEFAULT_PRESET_SETTING, NAMESPACES.OPERATION);
    const presets = getOperationsListFilterPresets(state);

    if (!presets[defaultPreset]) {
        defaultPreset = OPERATIONS_LIST_RUNNING_PRESET;
    }

    return {
        presets,
        activePresets: getOperationsListActivePresets(state),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OperationsFilterPresets));
