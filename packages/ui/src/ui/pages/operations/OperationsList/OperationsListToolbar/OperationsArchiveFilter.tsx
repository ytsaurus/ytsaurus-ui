import React, {Component} from 'react';
import cn from 'bem-cn-lite';
import {connect} from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import {Button} from '@gravity-ui/uikit';

import Icon from '../../../../components/Icon/Icon';
import Modal from '../../../../components/Modal/Modal';
import TimePicker from '../../../../components/TimePicker/TimePicker';
import CustomRadioButton from '../../../../components/RadioButton/RadioButton';

import {OPERATIONS_DATA_MODE} from '../../../../constants/operations';
import {showArchiveOperations, showCurrentOperations} from '../../../../store/actions/operations';
import {SelectButton} from '../../../../components/Button/Button';
import {Datepicker} from '../../../../components/common/Datepicker';

import './OperationsArchiveFilter.scss';

const block = cn('operations-list');
const tbBlock = cn('elements-toolbar');

const datePickerProps = {
    range: false,
    controlSize: 's',
    format: 'dd-MM-yyyy',
    outputFormat: 'datetime',
    className: 'operations-datepicker-control',
    popupClassName: 'operations-datepicker-popup',
};

class OperationsArchiveFilter extends Component {
    static propTypes = {
        // from connect
        dataMode: PropTypes.oneOf([OPERATIONS_DATA_MODE.ARCHIVE, OPERATIONS_DATA_MODE.CURRENT]),
        from: PropTypes.string,
        to: PropTypes.string,
        showArchiveOperations: PropTypes.func.isRequired,
        showCurrentOperations: PropTypes.func.isRequired,
    };

    static defaultProps = {
        from: moment().subtract(6, 'hours').toISOString(),
        to: moment().toISOString(),
    };

    state = {
        modalVisible: false,
        activeTypeValue: this.radioButtonTypes.custom.value,
    };

    showModal = () => {
        const {from, to} = this.props;
        this.setState({
            modalVisible: true,
            from: from,
            to: to,
        });
    };

    hideModal = () => {
        this.setState({modalVisible: false});
    };

    resetTimeRange = () => {
        this.hideModal();
        this.props.showCurrentOperations();
    };

    applyTimeRange = () => {
        const {from, to, activeTypeValue} = this.state;
        this.hideModal();
        if (activeTypeValue === 'custom') {
            this.props.showArchiveOperations(from, to);
        } else {
            this.props.showArchiveOperations(
                moment()
                    .subtract(this.radioButtonTypes[activeTypeValue].hours, 'hours')
                    .toISOString(),
                moment().toISOString(),
            );
        }
    };

    prepareText() {
        const {from, to, dataMode} = this.props;

        if (dataMode === OPERATIONS_DATA_MODE.CURRENT) {
            return 'Current operations';
        } else {
            const format = 'DD-MM-YYYY HH:mm';
            const fromPart = moment(from).format(format);
            const toPart = moment(to).format(format);

            return fromPart + ' — ' + toPart;
        }
    }

    get radioButtonTypes() {
        return {
            custom: {
                text: 'custom',
                value: 'custom',
            },
            twoHours: {
                text: 'last 2 hours',
                value: 'twoHours',
                hours: 2,
            },
            day: {
                text: 'last day',
                value: 'day',
                hours: 24,
            },
            week: {
                text: 'last week',
                value: 'week',
                hours: 168,
            },
        };
    }

    updateStartTime = ({from}) => this.setState({from});
    updateFinishTime = ({from: to}) => this.setState({to: to});
    handleActiveTypeChange = (ev) => {
        const activeTypeValue = ev.target.value;
        this.setState({
            activeTypeValue,
            from: moment()
                .subtract(this.radioButtonTypes[activeTypeValue].hours, 'hours')
                .toISOString(),
            to: moment().toISOString(),
        });
    };

    renderModal() {
        const block = cn('elements-form');
        const {from, to, activeTypeValue} = this.state;
        const disabled = activeTypeValue !== this.radioButtonTypes.custom.value;

        return (
            <Modal
                title="Choose range"
                size="s"
                confirmText="Apply"
                cancelText="Show current"
                cl={block('time-modal')}
                visible={this.state.modalVisible}
                content={
                    <div className={block()}>
                        <div className={block('button-group')}>
                            <CustomRadioButton
                                name="time-range"
                                items={_.values(this.radioButtonTypes)}
                                value={activeTypeValue}
                                onChange={this.handleActiveTypeChange}
                            />
                        </div>
                        <div>
                            <div className={block('label')}>From</div>
                            <div className={block('field-group')}>
                                <span className={block('field')}>
                                    <Datepicker
                                        {...datePickerProps}
                                        disabled={disabled}
                                        from={from}
                                        onUpdate={this.updateStartTime}
                                    />
                                </span>
                                <span className={block('field')}>
                                    {from && (
                                        <TimePicker
                                            disabled={disabled}
                                            date={from}
                                            onChange={this.updateStartTime}
                                        />
                                    )}
                                </span>
                            </div>
                            <div className={block('label')}>To</div>
                            <div className={block('field-group')}>
                                <span className={block('field')}>
                                    <Datepicker
                                        {...datePickerProps}
                                        disabled={disabled}
                                        from={to}
                                        onUpdate={this.updateFinishTime}
                                    />
                                </span>
                                <span className={block('field')}>
                                    {to && (
                                        <TimePicker
                                            disabled={disabled}
                                            date={to}
                                            onChange={this.updateFinishTime}
                                        />
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                }
                renderCustomCancel={(className) => (
                    <Button
                        title="Show current"
                        className={className}
                        onClick={this.resetTimeRange}
                    >
                        Show current
                    </Button>
                )}
                onCancel={this.hideModal}
                onConfirm={this.applyTimeRange}
            />
        );
    }

    render() {
        const {dataMode} = this.props;
        const checked = dataMode === OPERATIONS_DATA_MODE.ARCHIVE;
        const text = this.prepareText();

        return (
            <div className={block('archive-range', tbBlock('component'))}>
                {this.renderModal()}
                <SelectButton
                    type="submit"
                    selected={checked}
                    title={text}
                    onClick={this.showModal}
                >
                    {text}
                    <Icon awesome="calendar-alt" />
                </SelectButton>
            </div>
        );
    }
}

function mapStateToProps({operations}) {
    const {
        dataMode,
        timeRange: {from, to},
    } = operations.list;

    return {
        dataMode,
        from,
        to,
    };
}

const mapDispatchToProps = {
    showArchiveOperations,
    showCurrentOperations,
};

export default connect(mapStateToProps, mapDispatchToProps)(OperationsArchiveFilter);
