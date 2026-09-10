import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {Button, Checkbox, TextInput} from '@gravity-ui/uikit';
import Modal from '../../../../../components/Modal/Modal';
import Icon from '../../../../../components/Icon/Icon';

import i18n from '../i18n';

const ELEMENT = 'toolbar-presets';
const block = cn('operations-list');
const tbBlock = cn('elements-toolbar');

export class OperationsFilterPresetsBase extends Component {
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

        const formBlock = cn('elements-form');
        const INPUT_ID = 'save-preset-filter';

        return (
            <Modal
                title={i18n('title_save-filter')}
                confirmText={i18n('action_save')}
                visible={dialog.isSaving}
                onCancel={toggleSaveFilterPresetDialog}
                onConfirm={this.onConfirm}
                isConfirmDisabled={this.isPresetNameEmpty}
                content={
                    <React.Fragment>
                        <div className={formBlock('field')}>
                            <label
                                htmlFor={INPUT_ID}
                                className={formBlock('label')}
                                title={i18n('field_filter-name')}
                            >
                                {i18n('field_filter-name')}
                            </label>
                            <TextInput
                                id={INPUT_ID}
                                value={presetName}
                                onUpdate={(name) => this.setState({presetName: name})}
                                autoFocus
                            />
                        </div>
                        <div className={formBlock('field')}>
                            <Checkbox
                                checked={isPresetDefault}
                                onChange={(checked) => this.setState({isPresetDefault: checked})}
                            >
                                {i18n('field_default-filter')}
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
                {map_(presets, (preset, presetId) => {
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
