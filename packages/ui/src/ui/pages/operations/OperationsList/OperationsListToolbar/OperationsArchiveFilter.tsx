import React, {useCallback, useState} from 'react';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../../store/reducers';
import {showArchiveOperations, showCurrentOperations} from '../../../../store/actions/operations';
import {OPERATIONS_DATA_MODE} from '../../../../constants/operations';

import _ from 'lodash';
import moment from 'moment';

import {Button} from '@gravity-ui/uikit';
import Icon from '../../../../components/Icon/Icon';
import Modal from '../../../../components/Modal/Modal';
import TimePicker from '../../../../components/TimePicker/TimePicker';
import CustomRadioButton from '../../../../components/RadioButton/RadioButton';
import {SelectButton} from '../../../../components/Button/Button';
import {Datepicker} from '../../../../components/common/Datepicker';

import './OperationsArchiveFilter.scss';
import {ValueOf} from '../../../../../@types/types';

const block = cn('operations-list');
const tbBlock = cn('elements-toolbar');
const formBlock = cn('elements-form');

const datePickerProps = {
    range: false,
    controlSize: 's',
    format: 'dd-MM-yyyy',
    outputFormat: 'datetime',
    className: 'operations-datepicker-control',
    popupClassName: 'operations-datepicker-popup',
} as const;

const radioButtonTypes = {
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
} as const;

interface State {
    modalVisible: boolean;
    activeTypeValue: ValueOf<typeof radioButtonTypes>['value'];
    from?: string;
    to?: string;
}

export default function OperationsArchiveFilter() {
    const {
        dataMode,
        timeRange: {from, to},
    } = useSelector((store: RootState) => store.operations.list);

    const dispatch = useDispatch();

    const [state, setState] = useState<State>({
        modalVisible: false,
        activeTypeValue: radioButtonTypes.custom.value,
        from: from || moment().subtract(6, 'hours').toISOString(),
        to: to || moment().toISOString(),
    });

    const showModal = useCallback(() => {
        setState({
            ...state,
            modalVisible: true,
        });
    }, [state]);

    const hideModal = useCallback(() => {
        setState({...state, modalVisible: false});
    }, [state]);

    const resetTimeRange = useCallback(() => {
        hideModal();
        dispatch(showCurrentOperations());
    }, [dispatch, hideModal]);

    const applyTimeRange = useCallback(() => {
        hideModal();
        if (state.activeTypeValue === 'custom') {
            dispatch(showArchiveOperations(state.from, state.to));
        } else {
            dispatch(
                showArchiveOperations(
                    moment()
                        .subtract(radioButtonTypes[state.activeTypeValue].hours, 'hours')
                        .toISOString(),
                    moment().toISOString(),
                ),
            );
        }
    }, [dispatch, hideModal, state]);

    const prepareText = useCallback(() => {
        if (dataMode === OPERATIONS_DATA_MODE.CURRENT) {
            return 'Current operations';
        } else {
            const format = 'DD-MM-YYYY HH:mm';
            const fromPart = moment(from).format(format);
            const toPart = moment(to).format(format);
            return fromPart + ' — ' + toPart;
        }
    }, [dataMode, from, to]);

    const updateDate = useCallback(
        (date: Pick<State, 'from' | 'to'>) => {
            const dateWithHours = _.mapValues(date, (field, key) => {
                if (field) {
                    const {hours, minutes} = moment(state[key as 'from' | 'to']).toObject();
                    return moment(field).add({hours, minutes}).toISOString();
                }
                return field;
            });
            setState({...state, ...dateWithHours});
        },
        [state],
    );

    const updateTime = useCallback(
        (date: {from?: string; to?: string}) => setState({...state, ...date}),
        [state],
    );

    const handleActiveTypeChange = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            const activeTypeValue = ev.target.value as ValueOf<typeof radioButtonTypes>['value'];
            setState({
                ...state,
                activeTypeValue,
                ...(activeTypeValue !== 'custom' && {
                    from: moment()
                        .subtract(radioButtonTypes[activeTypeValue].hours, 'hours')
                        .toISOString(),
                    to: moment().toISOString(),
                }),
            });
        },
        [state],
    );

    const text = prepareText();
    const checked = dataMode === OPERATIONS_DATA_MODE.ARCHIVE;
    const disabled = state.activeTypeValue !== radioButtonTypes.custom.value;

    return (
        <div className={block('archive-range', tbBlock('component'))}>
            <Modal
                title="Choose range"
                size="s"
                confirmText="Apply"
                cancelText="Show current"
                cl={formBlock('time-modal')}
                visible={state.modalVisible}
                content={
                    <div className={formBlock(null, 'operations-archive-filter')}>
                        <div className={formBlock('button-group')}>
                            <CustomRadioButton
                                name="time-range"
                                items={_.values(radioButtonTypes)}
                                value={state.activeTypeValue}
                                onChange={handleActiveTypeChange}
                            />
                        </div>
                        <div>
                            <div className={formBlock('label')}>From</div>
                            <div className={formBlock('field-group')}>
                                <span className={formBlock('field')}>
                                    <Datepicker
                                        {...datePickerProps}
                                        disabled={disabled}
                                        from={state.from}
                                        onUpdate={({from: newFrom}) =>
                                            newFrom && updateDate({from: newFrom})
                                        }
                                    />
                                </span>
                                <span className={formBlock('field')}>
                                    {state.from && (
                                        <TimePicker
                                            disabled={disabled}
                                            date={state.from}
                                            onChange={(newDate: string) =>
                                                updateTime({from: newDate})
                                            }
                                        />
                                    )}
                                </span>
                            </div>
                            <div className={formBlock('label')}>To</div>
                            <div className={formBlock('field-group')}>
                                <span className={formBlock('field')}>
                                    <Datepicker
                                        {...datePickerProps}
                                        disabled={disabled}
                                        to={state.to}
                                        onUpdate={({from: newTo}) =>
                                            newTo && updateDate({to: newTo})
                                        }
                                    />
                                </span>
                                <span className={formBlock('field')}>
                                    {state.to && (
                                        <TimePicker
                                            disabled={disabled}
                                            date={state.to}
                                            onChange={(newDate: string) =>
                                                updateTime({to: newDate})
                                            }
                                        />
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                }
                renderCustomCancel={(className: string | undefined) => (
                    <Button title="Show current" className={className} onClick={resetTimeRange}>
                        Show current
                    </Button>
                )}
                onCancel={hideModal}
                onConfirm={applyTimeRange}
            />
            <SelectButton type="submit" selected={checked} title={text} onClick={showModal}>
                {text}
                <Icon awesome="calendar-alt" />
            </SelectButton>
        </div>
    );
}
