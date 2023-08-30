import React, {Component, Fragment} from 'react';
import {Checkbox} from '@gravity-ui/uikit';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import hammer from '../../../../../common/hammer';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import RadioButton from '../../../../../components/RadioButton/RadioButton';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import Hotkey from '../../../../../components/Hotkey/Hotkey';
import Filter from '../../../../../components/Filter/Filter';
import Modal from '../../../../../components/Modal/Modal';
import Select from '../../../../../components/Select/Select';

import {initialState} from '../../../../../store/reducers/components/nodes/setup/setup';
import {
    applyPreset,
    getComponentsNodesFilterOptions,
    savePreset,
} from '../../../../../store/actions/components/nodes/nodes';
import {FLAG_STATE, MEDIUM_COLS_PREFIX} from '../../../../../constants/components/nodes/nodes';
import {parseBytes, updateListWithAll} from '../../../../../utils';

import {getMediumListNoCache} from '../../../../../store/selectors/thor';
import TagsFilter from './TagsFilter/TagsFilter';
import {
    getComponentNodesFiltersSetup,
    getComponentNodesRacks,
    getComponentNodesTags,
} from '../../../../../store/selectors/components/nodes/nodes';
import {
    getComponentNodesAvailableStates,
    getComponentNodesFilterSetupStateValue,
} from '../../../../../store/selectors/components/nodes/nodes/data';

import './SetupModal.scss';

const block = cn('nodes-setup-modal');

const groupFilterProps = PropTypes.shape({
    from: PropTypes.shape({
        value: PropTypes.number,
        valid: PropTypes.bool.isRequired,
    }).isRequired,
    to: PropTypes.shape({
        value: PropTypes.number,
        valid: PropTypes.bool.isRequired,
    }).isRequired,
});

export class SetupModal extends Component {
    static radioProps = PropTypes.oneOf([FLAG_STATE.ENABLED, FLAG_STATE.DISABLED, FLAG_STATE.ALL]);

    static propTypes = {
        // from parent
        visible: PropTypes.bool,
        handleClose: PropTypes.func.isRequired,

        // from connect
        setup: PropTypes.shape({
            default: PropTypes.shape({
                physicalHost: PropTypes.string.isRequired,
                tag: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
                state: PropTypes.string.isRequired,
                schedulerJobs: SetupModal.radioProps.isRequired,
                writeSessions: SetupModal.radioProps.isRequired,
                tabletCells: SetupModal.radioProps.isRequired,
                rack: PropTypes.object.isRequired,
                banned: SetupModal.radioProps.isRequired,
                decommissioned: SetupModal.radioProps.isRequired,
                full: SetupModal.radioProps.isRequired,
                alerts: SetupModal.radioProps.isRequired,
            }).isRequired,
            storage: SetupModal.createPropTypes('storage'),
            cpu: SetupModal.createPropTypes('cpu'),
            resources: SetupModal.createPropTypes('resources'),
            tablets: SetupModal.createPropTypes('tablets'),
        }),

        applyPreset: PropTypes.func.isRequired,
        savePreset: PropTypes.func.isRequired,
    };

    static createPropTypes(group) {
        const inner = _.mapValues(initialState[group], () => groupFilterProps.isRequired);

        return PropTypes.shape(inner).isRequired;
    }

    static getCurrentValue(state, props, section, group) {
        if (!state[section] || !state[section][group]) {
            return props[section][group];
        }
        return null;
    }

    static getDerivedStateFromProps(props, state) {
        const {mediumList, setup} = props;
        const {storage} = state;
        const newStorage = _.reduce(
            mediumList,
            (acc, medium) => {
                const key = MEDIUM_COLS_PREFIX + medium;
                acc[key] = storage[key] || setup.storage[key];
                return acc;
            },
            {},
        );
        return {storage: {...storage, ...newStorage}};
    }

    state = {};

    constructor(props) {
        super(props);
        this.state = {
            ...this.props.setup,
            saveAsTemplate: false,
            templateName: '',
        };

        this.state.default.state = this.props.stateValue;
    }

    get hotkeySettings() {
        return [{keys: 'enter', handler: this.handleApplySetup, scope: 'all'}];
    }

    get states() {
        return _.map(this.props.nodeStates, (state) => {
            return {
                title: hammer.format.Readable(state),
                value: state,
            };
        });
    }

    get radioItems() {
        const {ENABLED, DISABLED, ALL} = FLAG_STATE;

        return [
            {text: hammer.format['FirstUppercase'](ALL), value: ALL},
            {text: hammer.format['FirstUppercase'](ENABLED), value: ENABLED},
            {
                text: hammer.format['FirstUppercase'](DISABLED),
                value: DISABLED,
            },
        ];
    }

    prepareFiltersCallback(section, group) {
        return [
            (value) => this.handleValueFilterChange(section, group, 'from', value),
            (value) => this.handleValueFilterChange(section, group, 'to', value),
        ];
    }

    handleApplySetup = () => {
        const {applyPreset, handleClose, savePreset} = this.props;
        const {saveAsTemplate, templateName, ...setup} = this.state;

        if (saveAsTemplate && templateName.length > 0) {
            savePreset(templateName, setup);
        }

        applyPreset(this.state);
        this.setState({saveAsTemplate: false}, handleClose);
    };

    handleSelectChange = (newValue) => {
        const {state} = this.state.default;

        const values = updateListWithAll({value: state, newValue}, 'all');

        this.setState({
            default: {
                ...this.state.default,
                state: values,
            },
        });
    };

    handleRadioChange(section, key, value) {
        this.setState({
            [section]: {
                ...this.state[section],
                [key]: value,
            },
        });
    }

    handleValueFilterChange = (section, group, key, value) => {
        const parsedValue = value === '' ? null : parseBytes(value);
        const isValid = !isNaN(parsedValue);

        this.setState({
            [section]: {
                ...this.state[section],
                [group]: {
                    ...this.state[section][group],
                    [key]: {
                        value: isValid ? parsedValue : this.state[section][group][key].value,
                        valid: isValid,
                    },
                },
            },
        });
    };

    handleTextFilterChange = (section, key, value) => {
        this.setState({
            [section]: {
                ...this.state[section],
                [key]: value,
            },
        });
    };

    handleTemplateCheckboxChange = ({target}) => this.setState({saveAsTemplate: target.checked});

    handleTemplateNameChange = (templateName) => this.setState({templateName});

    renderValueFilter({placeholder, onChange, value, invalid, format = 'Bytes'}) {
        const formatter =
            format === 'Number' ? (value) => Number(value).toString() : hammer.format[format];
        const preparedValue = value === '' || value === null ? '' : formatter(value);

        return (
            <Filter
                size="m"
                debounce={500}
                invalid={invalid}
                autofocus={false}
                onChange={onChange}
                value={preparedValue}
                placeholder={placeholder}
            />
        );
    }

    renderTextFilter({placeholder, onChange, value, disabled = false, invalid = false}) {
        return (
            <Filter
                size="m"
                debounce={500}
                value={value}
                invalid={invalid}
                autofocus={false}
                disabled={disabled}
                onChange={onChange}
                placeholder={placeholder}
            />
        );
    }

    renderTagsFilter({items, onChange, value, disabled = false, modes, invalid = false}) {
        return (
            <TagsFilter
                value={value}
                invalid={invalid}
                autofocus={false}
                disabled={disabled}
                onChange={onChange}
                items={items}
                allowedModes={modes}
                selectPlaceholder={'Select tags...'}
            />
        );
    }

    renderFiltersGroup(section, group, format = 'Bytes') {
        const [firstCallback, secondCallback] = this.prepareFiltersCallback(section, group);

        const filter = this.state[section][group];

        const {valid: fromFilterValid, value: fromFilterValue} = filter.from;
        const {valid: toFilterValid, value: toFilterValue} = filter.to;

        return (
            <div className={block('filters-group')}>
                {this.renderValueFilter({
                    placeholder: 'From X...',
                    onChange: firstCallback,
                    value: fromFilterValue,
                    invalid: !fromFilterValid,
                    format,
                })}

                {this.renderValueFilter({
                    placeholder: 'To Y...',
                    onChange: secondCallback,
                    value: toFilterValue,
                    invalid: !toFilterValid,
                    format,
                })}
            </div>
        );
    }

    renderStatesSelect() {
        const {state} = this.state.default;
        return (
            <div className={block('select')}>
                <Select
                    value={state}
                    items={this.states}
                    filterable
                    onUpdate={this.handleSelectChange}
                    placeholder={'Select states...'}
                    width="max"
                    hideFilter
                    multiple
                />
            </div>
        );
    }

    renderRadioGroup(section, name) {
        const value = this.state[section][name];

        return (
            <RadioButton
                size="m"
                name={name}
                value={value}
                items={this.radioItems}
                onChange={(ev) => this.handleRadioChange(section, name, ev.target.value)}
            />
        );
    }

    renderCheckBox(text, checked, onChange) {
        return (
            <Checkbox
                size="l"
                key={text}
                content={text}
                checked={checked}
                onChange={onChange}
                className={block('checkbox')}
            />
        );
    }

    renderDefaultFilters() {
        const section = 'default';
        const {nodeTags, nodeRacks} = this.props;

        return (
            <MetaTable
                items={[
                    {
                        key: 'physical host',
                        value: this.renderTextFilter({
                            value: this.state[section]['physicalHost'],
                            placeholder: 'Enter physical host address...',
                            onChange: (value) =>
                                this.handleTextFilterChange(section, 'physicalHost', value),
                        }),
                    },
                    {
                        key: 'tags',
                        value: this.renderTagsFilter({
                            items: nodeTags,
                            value: this.state[section]['tag'],
                            onChange: (value) => this.handleTextFilterChange(section, 'tag', value),
                        }),
                    },
                    {
                        key: 'states',
                        value: this.renderStatesSelect(),
                    },
                    {
                        key: 'racks',
                        value: this.renderTagsFilter({
                            items: nodeRacks,
                            value: this.state[section]['rack'],
                            modes: ['filter', 'union'],
                            onChange: (value) =>
                                this.handleTextFilterChange(section, 'rack', value),
                        }),
                    },
                    {
                        key: 'banned',
                        value: this.renderRadioGroup(section, 'banned'),
                    },
                    {
                        key: 'decommissioned',
                        value: this.renderRadioGroup(section, 'decommissioned'),
                    },
                    {
                        key: 'full',
                        value: this.renderRadioGroup(section, 'full'),
                    },
                    {
                        key: 'alerts',
                        value: this.renderRadioGroup(section, 'alerts'),
                    },
                    {
                        key: 'scheduler jobs',
                        value: this.renderRadioGroup(section, 'schedulerJobs'),
                    },
                    {
                        key: 'write sessions',
                        value: this.renderRadioGroup(section, 'writeSessions'),
                    },
                    {
                        key: 'tablet cells',
                        value: this.renderRadioGroup(section, 'tabletCells'),
                    },
                ]}
            />
        );
    }

    renderStorageFilters() {
        const {mediumList} = this.props;
        const section = 'storage';

        return (
            <Fragment>
                <MetaTable
                    items={[
                        {
                            key: 'sessions',
                            value: this.renderFiltersGroup(section, 'sessions', 'Number'),
                        },
                        {
                            key: 'chunks',
                            value: this.renderFiltersGroup(section, 'chunks', 'Number'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>Space</h4>

                <MetaTable
                    items={[
                        {
                            key: 'used',
                            value: this.renderFiltersGroup(section, 'spaceUsed'),
                        },
                        {
                            key: 'total',
                            value: this.renderFiltersGroup(section, 'spaceTotal'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>IO weight</h4>

                <MetaTable
                    items={_.map(mediumList, (medium) => ({
                        key: hammer.format['Readable'](medium),
                        value: this.renderFiltersGroup(
                            section,
                            MEDIUM_COLS_PREFIX + medium,
                            'Number',
                        ),
                    }))}
                />
            </Fragment>
        );
    }

    renderCpuFilters() {
        const section = 'cpu';

        return (
            <Fragment>
                <MetaTable
                    items={[
                        {
                            key: 'blob session',
                            value: this.renderFiltersGroup(section, 'blobSession'),
                        },
                        {
                            key: 'block cache',
                            value: this.renderFiltersGroup(section, 'blockCache'),
                        },
                        {
                            key: 'chunk block meta',
                            value: this.renderFiltersGroup(section, 'chunkBlockMeta'),
                        },
                        {
                            key: 'chunk meta',
                            value: this.renderFiltersGroup(section, 'chunkMeta'),
                        },
                        {
                            key: 'footprint',
                            value: this.renderFiltersGroup(section, 'footprint'),
                        },
                        {
                            key: 'query',
                            value: this.renderFiltersGroup(section, 'query'),
                        },
                        {
                            key: 'system jobs',
                            value: this.renderFiltersGroup(section, 'systemJobs'),
                        },
                        {
                            key: 'versioned chunk meta',
                            value: this.renderFiltersGroup(section, 'versionedChunkMeta'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>Tablet dynamic</h4>

                <MetaTable
                    items={[
                        {
                            key: 'used',
                            value: this.renderFiltersGroup(section, 'tabletDynamicUsed'),
                        },
                        {
                            key: 'total',
                            value: this.renderFiltersGroup(section, 'tabletDynamicTotal'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>Tablet static</h4>

                <MetaTable
                    items={[
                        {
                            key: 'used',
                            value: this.renderFiltersGroup(section, 'tabletStaticUsed'),
                        },
                        {
                            key: 'total',
                            value: this.renderFiltersGroup(section, 'tabletStaticTotal'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>User jobs</h4>

                <MetaTable
                    items={[
                        {
                            key: 'used',
                            value: this.renderFiltersGroup(section, 'userJobsUsed'),
                        },
                        {
                            key: 'total',
                            value: this.renderFiltersGroup(section, 'userJobsTotal'),
                        },
                    ]}
                />
            </Fragment>
        );
    }

    renderResourcesFilters() {
        const section = 'resources';

        return (
            <Fragment>
                <h4 className={block('heading')}>User slots</h4>

                <MetaTable
                    items={[
                        {
                            key: 'user slots used',
                            value: this.renderFiltersGroup(section, 'userSlotsUsed', 'Number'),
                        },
                        {
                            key: 'user slots total',
                            value: this.renderFiltersGroup(section, 'userSlotsTotal', 'Number'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>Seal slots</h4>

                <MetaTable
                    items={[
                        {
                            key: 'seal slots used',
                            value: this.renderFiltersGroup(section, 'sealSlotsUsed', 'Number'),
                        },
                        {
                            key: 'seal slots total',
                            value: this.renderFiltersGroup(section, 'sealSlotsTotal', 'Number'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>Repair slots</h4>

                <MetaTable
                    items={[
                        {
                            key: 'repair slots used',
                            value: this.renderFiltersGroup(section, 'repairSlotsUsed', 'Number'),
                        },
                        {
                            key: 'repair slots total',
                            value: this.renderFiltersGroup(section, 'repairSlotsTotal', 'Number'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>Removal slots</h4>

                <MetaTable
                    items={[
                        {
                            key: 'removal slots used',
                            value: this.renderFiltersGroup(section, 'removalSlotsUsed', 'Number'),
                        },
                        {
                            key: 'removal slots total',
                            value: this.renderFiltersGroup(section, 'removalSlotsUsed', 'Number'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>Replication slots</h4>

                <MetaTable
                    items={[
                        {
                            key: 'replication slots used',
                            value: this.renderFiltersGroup(
                                section,
                                'replicationSlotsUsed',
                                'Number',
                            ),
                        },
                        {
                            key: 'replication slots total',
                            value: this.renderFiltersGroup(
                                section,
                                'replicationSlotsTotal',
                                'Number',
                            ),
                        },
                    ]}
                />
            </Fragment>
        );
    }

    renderTabletsFilters() {
        const section = 'tablets';

        return (
            <Fragment>
                <h4 className={block('heading')}>Tablet slots</h4>

                <MetaTable
                    items={[
                        {
                            key: 'all states',
                            value: this.renderFiltersGroup(section, 'all', 'Number'),
                        },
                        {
                            key: 'none',
                            value: this.renderFiltersGroup(section, 'none', 'Number'),
                        },
                        {
                            key: 'leading',
                            value: this.renderFiltersGroup(section, 'leading', 'Number'),
                        },
                        {
                            key: 'following',
                            value: this.renderFiltersGroup(section, 'following', 'Number'),
                        },
                        {
                            key: 'Follower Recovery',
                            value: this.renderFiltersGroup(section, 'followerRecovery', 'Number'),
                        },
                        {
                            key: 'Leader Recovery',
                            value: this.renderFiltersGroup(section, 'leaderRecovery', 'Number'),
                        },
                        {
                            key: 'stopped',
                            value: this.renderFiltersGroup(section, 'stopped', 'Number'),
                        },
                        {
                            key: 'elections',
                            value: this.renderFiltersGroup(section, 'elections', 'Number'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>Tablet memory</h4>

                <MetaTable
                    items={[
                        {
                            key: 'static used',
                            value: this.renderFiltersGroup(section, 'staticUsed'),
                        },
                        {
                            key: 'static total',
                            value: this.renderFiltersGroup(section, 'staticTotal'),
                        },
                        {
                            key: 'dynamic used',
                            value: this.renderFiltersGroup(section, 'dynamicUsed'),
                        },
                        {
                            key: 'dynamic total',
                            value: this.renderFiltersGroup(section, 'dynamicTotal'),
                        },
                    ]}
                />
            </Fragment>
        );
    }

    renderContent() {
        const {saveAsTemplate, templateName} = this.state;

        return (
            <div className={block()}>
                <CollapsibleSection size="s" name="Default" className={block('default')}>
                    {this.renderDefaultFilters()}
                </CollapsibleSection>

                <CollapsibleSection size="s" name="Storage">
                    {this.renderStorageFilters()}
                </CollapsibleSection>

                <CollapsibleSection size="s" name="CPU and memory">
                    {this.renderCpuFilters()}
                </CollapsibleSection>

                <CollapsibleSection size="s" name="Resources">
                    {this.renderResourcesFilters()}
                </CollapsibleSection>

                <CollapsibleSection size="s" name="Tablets">
                    {this.renderTabletsFilters()}
                </CollapsibleSection>

                <div className={block('template')}>
                    <MetaTable
                        items={[
                            {
                                key: 'save',
                                value: this.renderCheckBox(
                                    'Save as template',
                                    saveAsTemplate,
                                    this.handleTemplateCheckboxChange,
                                ),
                            },
                            {
                                key: 'template name',
                                value: this.renderTextFilter({
                                    placeholder: 'Enter template name...',
                                    onChange: this.handleTemplateNameChange,
                                    value: templateName,
                                    disabled: !saveAsTemplate,
                                    invalid: saveAsTemplate && templateName.length < 1,
                                }),
                            },
                        ]}
                    />
                </div>

                <Hotkey settings={this.hotkeySettings} />
            </div>
        );
    }

    render() {
        const {visible, handleClose} = this.props;

        return (
            <Modal
                size="m"
                title="Setup"
                visible={visible}
                onCancel={handleClose}
                content={this.renderContent()}
                onConfirm={this.handleApplySetup}
            />
        );
    }

    componentDidMount() {
        const {visible, loadOptions} = this.props;

        if (visible) {
            loadOptions();
        }
    }

    componentDidUpdate(prevProps) {
        const {visible, loadOptions} = this.props;

        if (!prevProps.visible && visible) {
            loadOptions();
        }
    }
}

const mapStateToProps = (state) => {
    return {
        setup: getComponentNodesFiltersSetup(state),
        mediumList: getMediumListNoCache(state),
        nodeTags: getComponentNodesTags(state),
        nodeRacks: getComponentNodesRacks(state),
        nodeStates: getComponentNodesAvailableStates(state),
        stateValue: getComponentNodesFilterSetupStateValue(state),
    };
};

export default connect(mapStateToProps, {
    applyPreset,
    savePreset,
    loadOptions: getComponentsNodesFilterOptions,
})(SetupModal);
