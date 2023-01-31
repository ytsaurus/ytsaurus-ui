/* eslint-disable camelcase */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import hammer from '../../../../../../common/hammer';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import StatusBlock from '../../../../../../components/StatusBlock/StatusBlock';
import MetaTable from '../../../../../../components/MetaTable/MetaTable';
import Input from '../../../../../../components/Filter/Filter';
import Modal from '../../../../../../components/Modal/Modal';
import Label from '../../../../../../components/Label/Label';

import {
    closeResourcesModal,
    setResourcesLimit,
} from '../../../../../../store/actions/components/nodes/actions/set-resources-limits';
import {parseBytes} from '../../../../../../utils';

import './ResourcesLimitsModal.scss';

const block = cn('node-resources-limits');

class ResourcesLimitsModal extends Component {
    static resourcesProps = PropTypes.shape({
        cpu: PropTypes.number,
        gpu: PropTypes.number,
        network: PropTypes.number,
        replication_slots: PropTypes.number,
        replication_data_size: PropTypes.number,
        user_slots: PropTypes.number,
        system_memory: PropTypes.number,
        user_memory: PropTypes.number,
    });

    static propTypes = {
        // from connect
        host: PropTypes.string.isRequired,
        visible: PropTypes.bool.isRequired,
        loading: PropTypes.bool.isRequired,
        resourcesLimit: ResourcesLimitsModal.resourcesProps.isRequired,
        resourcesLimitOverrides: ResourcesLimitsModal.resourcesProps.isRequired,

        closeResourcesModal: PropTypes.func.isRequired,
        setResourcesLimit: PropTypes.func.isRequired,
    };

    state = this.prepareState();

    get resources() {
        return [
            {
                placeholder: 'Set CPU limit...',
                value: this.state['cpu'],
                parseFormat: 'float',
                caption: 'CPU',
                type: 'cpu',
            },
            {
                placeholder: 'Set GPU limit...',
                value: this.state['gpu'],
                caption: 'GPU',
                parseFormat: 'int',
                type: 'gpu',
            },
            {
                placeholder: 'Set network limit...',
                value: this.state['network'],
                caption: 'network',
                type: 'network',
                parseFormat: 'int',
            },
            {
                placeholder: 'Set replication slots limit...',
                value: this.state['replication_slots'],
                caption: 'replication slots',
                type: 'replication_slots',
                parseFormat: 'int',
            },
            {
                placeholder: 'Set replication data size limit...',
                value: this.state['replication_data_size'],
                caption: 'replication data size',
                type: 'replication_data_size',
                visibleFormat: 'Bytes',
                parseFormat: 'bytes',
            },
            {
                placeholder: 'Set removal slots limit...',
                value: this.state['removal_slots'],
                caption: 'removal slots',
                type: 'removal_slots',
                parseFormat: 'int',
            },
            {
                placeholder: 'Set repair slots limit...',
                value: this.state['repair_slots'],
                caption: 'repair slots',
                type: 'repair_slots',
                parseFormat: 'int',
            },
            {
                placeholder: 'Set repair data size limit...',
                value: this.state['repair_data_size'],
                caption: 'repair data size',
                type: 'repair_data_size',
                visibleFormat: 'Bytes',
                parseFormat: 'bytes',
            },
            {
                placeholder: 'Set seal slots limit...',
                value: this.state['seal_slots'],
                caption: 'seal slots',
                type: 'seal_slots',
                parseFormat: 'int',
            },
            {
                placeholder: 'Set system memory limit...',
                value: this.state['system_memory'],
                caption: 'system memory',
                visibleFormat: 'Bytes',
                type: 'system_memory',
                parseFormat: 'bytes',
            },
            {
                placeholder: 'Set user memory limit...',
                value: this.state['user_memory'],
                caption: 'user memory',
                visibleFormat: 'Bytes',
                type: 'user_memory',
                parseFormat: 'bytes',
            },
        ];
    }

    prepareState() {
        const {resourcesLimit, resourcesLimitOverrides} = this.props;

        return _.reduce(
            resourcesLimit,
            (res, limit, resource) => {
                res[resource] = {
                    value: resourcesLimitOverrides[resource] || null,
                    invalid: false,
                    type: resource,
                };

                return res;
            },
            {},
        );
    }

    handleConfirmLimits = () => {
        const {setResourcesLimit, host} = this.props;

        setResourcesLimit(this.state, host);
    };

    handleInputChange = (stringValue, group, parseType) => {
        let value;

        switch (parseType) {
            case 'float':
                value = parseFloat(stringValue);
                break;
            case 'int':
                value = parseInt(stringValue, 10);
                break;
            case 'bytes':
                value = parseBytes(stringValue);
                break;
            default:
                value = Number(stringValue);
        }

        this.setState({
            [group]: {
                type: this.state[group].type,
                value: stringValue === '' ? null : value,
                invalid: stringValue === '' ? false : isNaN(value),
            },
        });
    };

    renderInput({resource, placeholder, onChange, format = 'Number'}) {
        const {resourcesLimit} = this.props;

        const value = resource?.value;
        const formatter = format === 'Number' ? (value) => value.toString() : hammer.format[format];
        const preparedValue = value === null ? '' : formatter(value);
        const initialValue = formatter(resourcesLimit[resource.type]);

        return (
            <div className={block('resources-override')}>
                <Input
                    size="s"
                    debounce={50}
                    autofocus={false}
                    onChange={onChange}
                    value={preparedValue}
                    placeholder={placeholder}
                    invalid={resource?.invalid}
                />

                <StatusBlock text={initialValue} />
            </div>
        );
    }

    renderContent() {
        const {host} = this.props;
        const items = _.map(this.resources, (resource) => ({
            key: resource.caption,
            value: this.renderInput({
                resource: resource.value,
                format: resource.visibleFormat,
                placeholder: resource.placeholder,
                onChange: (val) => this.handleInputChange(val, resource.type, resource.parseFormat),
            }),
            visible: Boolean(resource.value),
        }));

        return (
            <div className={block()}>
                <Label
                    text={`Change resource limits for the node ${host}`}
                    className={block('label')}
                    theme="danger"
                    type="text"
                />

                <MetaTable items={items} />
            </div>
        );
    }

    render() {
        const {closeResourcesModal, visible, loading} = this.props;

        return (
            visible && (
                <Modal
                    size="m"
                    visible={visible}
                    loading={loading}
                    confirmText="Save"
                    title="Set resource limits"
                    content={this.renderContent()}
                    onCancel={closeResourcesModal}
                    onConfirm={this.handleConfirmLimits}
                    onOutsideClick={closeResourcesModal}
                    isConfirmDisabled={this.checkDisable}
                />
            )
        );
    }
}

const mapStateToProps = ({components}) => {
    const {visible, loading, host, resourcesLimit, resourcesLimitOverrides} =
        components.nodes.resourcesLimit;

    return {visible, loading, host, resourcesLimit, resourcesLimitOverrides};
};

const mapDispatchToProps = {
    closeResourcesModal,
    setResourcesLimit,
};

export default connect(mapStateToProps, mapDispatchToProps)(ResourcesLimitsModal);
