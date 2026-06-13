import React, {Component, Fragment} from 'react';
import {Checkbox} from '@gravity-ui/uikit';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import hammer from '../../../../../common/hammer';
import cn from 'bem-cn-lite';

import mapValues_ from 'lodash/mapValues';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import RadioButton from '../../../../../components/RadioButton/RadioButton';
import {Hotkey, MetaTable} from '@ytsaurus/components';
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
import {updateListWithAll} from '../../../../../utils';
import {parseBytes} from '../../../../../utils/parse/parse-bytes';

import {getMediumListNoCache} from '../../../../../store/selectors/thor';
import TagsFilter from './TagsFilter/TagsFilter';
import {
    selectComponentNodesFiltersSetup,
    selectComponentNodesRacks,
    selectComponentNodesTags,
} from '../../../../../store/selectors/components/nodes/nodes';
import {
    COMPONENTS_AVAILABLE_STATES,
    selectComponentNodesFilterSetupStateValue,
} from '../../../../../store/selectors/components/nodes/nodes/data';

import i18n from './i18n';

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
                state: PropTypes.arrayOf(PropTypes.string),
                schedulerJobs: SetupModal.radioProps.isRequired,
                writeSessions: SetupModal.radioProps.isRequired,
                tabletCells: SetupModal.radioProps.isRequired,
                rack: PropTypes.oneOfType([
                    PropTypes.string.isRequired,
                    PropTypes.object.isRequired,
                ]).isRequired,
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
        const inner = mapValues_(initialState[group], () => groupFilterProps.isRequired);

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
        const newStorage = reduce_(
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
        return map_(this.props.nodeStates, (state) => {
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
                selectPlaceholder={i18n('context_select-tags')}
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
                    placeholder: i18n('context_from'),
                    onChange: firstCallback,
                    value: fromFilterValue,
                    invalid: !fromFilterValid,
                    format,
                })}

                {this.renderValueFilter({
                    placeholder: i18n('context_to'),
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
                    placeholder={i18n('context_select-states')}
                    width="max"
                    maxVisibleValues={5}
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
                        key: 'physical-host',
                        label: i18n('field_physical-host'),
                        value: this.renderTextFilter({
                            value: this.state[section]['physicalHost'],
                            placeholder: i18n('context_enter-physical-host'),
                            onChange: (value) =>
                                this.handleTextFilterChange(section, 'physicalHost', value),
                        }),
                    },
                    {
                        key: 'tags',
                        label: i18n('field_tags'),
                        value: this.renderTagsFilter({
                            items: nodeTags,
                            value: this.state[section]['tag'],
                            onChange: (value) => this.handleTextFilterChange(section, 'tag', value),
                        }),
                    },
                    {
                        key: 'states',
                        label: i18n('field_states'),
                        value: this.renderStatesSelect(),
                    },
                    {
                        key: 'racks',
                        label: i18n('field_racks'),
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
                        label: i18n('field_banned'),
                        value: this.renderRadioGroup(section, 'banned'),
                    },
                    {
                        key: 'decommissioned',
                        label: i18n('field_decommissioned'),
                        value: this.renderRadioGroup(section, 'decommissioned'),
                    },
                    {
                        key: 'full',
                        label: i18n('field_full'),
                        value: this.renderRadioGroup(section, 'full'),
                    },
                    {
                        key: 'alerts',
                        label: i18n('field_alerts'),
                        value: this.renderRadioGroup(section, 'alertCount'),
                    },
                    {
                        key: 'scheduler-jobs',
                        label: i18n('field_scheduler-jobs'),
                        value: this.renderRadioGroup(section, 'schedulerJobs'),
                    },
                    {
                        key: 'write-sessions',
                        label: i18n('field_write-sessions'),
                        value: this.renderRadioGroup(section, 'writeSessions'),
                    },
                    {
                        key: 'tablet-cells',
                        label: i18n('field_tablet-cells'),
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
                            label: i18n('field_sessions'),
                            value: this.renderFiltersGroup(section, 'sessions', 'Number'),
                        },
                        {
                            key: 'chunks',
                            label: i18n('field_chunks'),
                            value: this.renderFiltersGroup(section, 'chunks', 'Number'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>{i18n('title_space')}</h4>

                <MetaTable
                    items={[
                        {
                            key: 'used',
                            label: i18n('field_used'),
                            value: this.renderFiltersGroup(section, 'spaceUsed'),
                        },
                        {
                            key: 'total',
                            label: i18n('field_total'),
                            value: this.renderFiltersGroup(section, 'spaceTotal'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>{i18n('title_io-weight')}</h4>

                <MetaTable
                    items={map_(mediumList, (medium) => ({
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
                            key: 'blob-session',
                            label: i18n('field_blob-session'),
                            value: this.renderFiltersGroup(section, 'blobSession'),
                        },
                        {
                            key: 'block-cache',
                            label: i18n('field_block-cache'),
                            value: this.renderFiltersGroup(section, 'blockCache'),
                        },
                        {
                            key: 'chunk-block-meta',
                            label: i18n('field_chunk-block-meta'),
                            value: this.renderFiltersGroup(section, 'chunkBlockMeta'),
                        },
                        {
                            key: 'chunk-meta',
                            label: i18n('field_chunk-meta'),
                            value: this.renderFiltersGroup(section, 'chunkMeta'),
                        },
                        {
                            key: 'footprint',
                            label: i18n('field_footprint'),
                            value: this.renderFiltersGroup(section, 'footprint'),
                        },
                        {
                            key: 'query',
                            label: i18n('field_query'),
                            value: this.renderFiltersGroup(section, 'query'),
                        },
                        {
                            key: 'system-jobs',
                            label: i18n('field_system-jobs'),
                            value: this.renderFiltersGroup(section, 'systemJobs'),
                        },
                        {
                            key: 'versioned-chunk-meta',
                            label: i18n('field_versioned-chunk-meta'),
                            value: this.renderFiltersGroup(section, 'versionedChunkMeta'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>{i18n('title_tablet-dynamic')}</h4>

                <MetaTable
                    items={[
                        {
                            key: 'used',
                            label: i18n('field_used'),
                            value: this.renderFiltersGroup(section, 'tabletDynamicUsed'),
                        },
                        {
                            key: 'total',
                            label: i18n('field_total'),
                            value: this.renderFiltersGroup(section, 'tabletDynamicTotal'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>{i18n('title_tablet-static')}</h4>

                <MetaTable
                    items={[
                        {
                            key: 'used',
                            label: i18n('field_used'),
                            value: this.renderFiltersGroup(section, 'tabletStaticUsed'),
                        },
                        {
                            key: 'total',
                            label: i18n('field_total'),
                            value: this.renderFiltersGroup(section, 'tabletStaticTotal'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>{i18n('title_user-jobs')}</h4>

                <MetaTable
                    items={[
                        {
                            key: 'used',
                            label: i18n('field_used'),
                            value: this.renderFiltersGroup(section, 'userJobsUsed'),
                        },
                        {
                            key: 'total',
                            label: i18n('field_total'),
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
                <h4 className={block('heading')}>{i18n('title_user-slots')}</h4>

                <MetaTable
                    items={[
                        {
                            key: 'user-slots-used',
                            label: i18n('field_user-slots-used'),
                            value: this.renderFiltersGroup(section, 'userSlotsUsed', 'Number'),
                        },
                        {
                            key: 'user-slots-total',
                            label: i18n('field_user-slots-total'),
                            value: this.renderFiltersGroup(section, 'userSlotsTotal', 'Number'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>{i18n('title_seal-slots')}</h4>

                <MetaTable
                    items={[
                        {
                            key: 'seal-slots-used',
                            label: i18n('field_seal-slots-used'),
                            value: this.renderFiltersGroup(section, 'sealSlotsUsed', 'Number'),
                        },
                        {
                            key: 'seal-slots-total',
                            label: i18n('field_seal-slots-total'),
                            value: this.renderFiltersGroup(section, 'sealSlotsTotal', 'Number'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>{i18n('title_repair-slots')}</h4>

                <MetaTable
                    items={[
                        {
                            key: 'repair-slots-used',
                            label: i18n('field_repair-slots-used'),
                            value: this.renderFiltersGroup(section, 'repairSlotsUsed', 'Number'),
                        },
                        {
                            key: 'repair-slots-total',
                            label: i18n('field_repair-slots-total'),
                            value: this.renderFiltersGroup(section, 'repairSlotsTotal', 'Number'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>{i18n('title_removal-slots')}</h4>

                <MetaTable
                    items={[
                        {
                            key: 'removal-slots-used',
                            label: i18n('field_removal-slots-used'),
                            value: this.renderFiltersGroup(section, 'removalSlotsUsed', 'Number'),
                        },
                        {
                            key: 'removal-slots-total',
                            label: i18n('field_removal-slots-total'),
                            value: this.renderFiltersGroup(section, 'removalSlotsUsed', 'Number'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>{i18n('title_replication-slots')}</h4>

                <MetaTable
                    items={[
                        {
                            key: 'replication-slots-used',
                            label: i18n('field_replication-slots-used'),
                            value: this.renderFiltersGroup(
                                section,
                                'replicationSlotsUsed',
                                'Number',
                            ),
                        },
                        {
                            key: 'replication-slots-total',
                            label: i18n('field_replication-slots-total'),
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
                <h4 className={block('heading')}>{i18n('title_tablet-slots')}</h4>

                <MetaTable
                    items={[
                        {
                            key: 'all-states',
                            label: i18n('field_all-states'),
                            value: this.renderFiltersGroup(section, 'all', 'Number'),
                        },
                        {
                            key: 'none',
                            label: i18n('field_none'),
                            value: this.renderFiltersGroup(section, 'none', 'Number'),
                        },
                        {
                            key: 'leading',
                            label: i18n('field_leading'),
                            value: this.renderFiltersGroup(section, 'leading', 'Number'),
                        },
                        {
                            key: 'following',
                            label: i18n('field_following'),
                            value: this.renderFiltersGroup(section, 'following', 'Number'),
                        },
                        {
                            key: 'follower-recovery',
                            label: i18n('field_follower-recovery'),
                            value: this.renderFiltersGroup(section, 'followerRecovery', 'Number'),
                        },
                        {
                            key: 'leader-recovery',
                            label: i18n('field_leader-recovery'),
                            value: this.renderFiltersGroup(section, 'leaderRecovery', 'Number'),
                        },
                        {
                            key: 'stopped',
                            label: i18n('field_stopped'),
                            value: this.renderFiltersGroup(section, 'stopped', 'Number'),
                        },
                        {
                            key: 'elections',
                            label: i18n('field_elections'),
                            value: this.renderFiltersGroup(section, 'elections', 'Number'),
                        },
                    ]}
                />

                <h4 className={block('heading')}>{i18n('title_tablet-memory')}</h4>

                <MetaTable
                    items={[
                        {
                            key: 'static-used',
                            label: i18n('field_static-used'),
                            value: this.renderFiltersGroup(section, 'staticUsed'),
                        },
                        {
                            key: 'static-total',
                            label: i18n('field_static-total'),
                            value: this.renderFiltersGroup(section, 'staticTotal'),
                        },
                        {
                            key: 'dynamic-used',
                            label: i18n('field_dynamic-used'),
                            value: this.renderFiltersGroup(section, 'dynamicUsed'),
                        },
                        {
                            key: 'dynamic-total',
                            label: i18n('field_dynamic-total'),
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
                <CollapsibleSection
                    size="s"
                    name={i18n('title_section-default')}
                    className={block('default')}
                >
                    {this.renderDefaultFilters()}
                </CollapsibleSection>

                <CollapsibleSection size="s" name={i18n('title_section-storage')}>
                    {this.renderStorageFilters()}
                </CollapsibleSection>

                <CollapsibleSection size="s" name={i18n('title_section-cpu-memory')}>
                    {this.renderCpuFilters()}
                </CollapsibleSection>

                <CollapsibleSection size="s" name={i18n('title_section-resources')}>
                    {this.renderResourcesFilters()}
                </CollapsibleSection>

                <CollapsibleSection size="s" name={i18n('title_section-tablets')}>
                    {this.renderTabletsFilters()}
                </CollapsibleSection>

                <div className={block('template')}>
                    <MetaTable
                        items={[
                            {
                                key: 'save',
                                label: i18n('field_save'),
                                value: this.renderCheckBox(
                                    i18n('action_save-as-template'),
                                    saveAsTemplate,
                                    this.handleTemplateCheckboxChange,
                                ),
                            },
                            {
                                key: 'template-name',
                                label: i18n('field_template-name'),
                                value: this.renderTextFilter({
                                    placeholder: i18n('context_enter-template-name'),
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
                title={i18n('title_setup')}
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
        setup: selectComponentNodesFiltersSetup(state),
        mediumList: getMediumListNoCache(state),
        nodeTags: selectComponentNodesTags(state),
        nodeRacks: selectComponentNodesRacks(state),
        nodeStates: COMPONENTS_AVAILABLE_STATES,
        stateValue: selectComponentNodesFilterSetupStateValue(state),
    };
};

export default connect(mapStateToProps, {
    applyPreset,
    savePreset,
    loadOptions: getComponentsNodesFilterOptions,
})(SetupModal);
