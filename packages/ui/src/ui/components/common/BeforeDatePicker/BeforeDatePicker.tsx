import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';

import {FocusBlurContainer} from '@gravity-ui/dialog-fields';
import {RadioButton, TextInput, TextInputSize} from '@gravity-ui/uikit';
import {Datepicker, DatepickerOutputDates} from '../../../components/common/Datepicker';

import './BeforeDatePicker.scss';

const block = cn('before-date-picker');

const UNLIMITED = 'unlimited';
const PERIOD = 'period';
const DATE = 'date';

type AllowedType = 'unlimited' | 'period' | 'date';

const ALLOWED_VIEW_TYPE: Array<AllowedType> = [UNLIMITED, PERIOD, DATE];
const TEXT: Record<AllowedType, string> = {
    [UNLIMITED]: 'Forever',
    [PERIOD]: 'Period',
    [DATE]: 'To Date',
};

const DAY_MS = 1000 * 60 * 60 * 24;

function dateToPeriod(date: IdmDatePickerProps['value']) {
    if (!(date instanceof Date)) {
        return undefined;
    }
    const diff = date.getTime() - new Date().getTime();
    return Math.ceil(diff / DAY_MS);
}

function periodToDate(daysCount: number) {
    const ms = new Date().getTime();
    return new Date(ms + daysCount * DAY_MS);
}

export type IdmDatePickerProps = {
    className?: string;

    value: Date | null | undefined;
    onChange: (value: IdmDatePickerProps['value'] | null) => void;
    onFocus?: () => void;
    onBlur?: () => void;

    size?: TextInputSize;
};

interface State {
    viewType: null | AllowedType; // see ALLOWED_VIEW_TYPE

    period: null | string;
    periodError: null | string;
}

/**
 * The component provides ability to specify value
 * as a period of days or as a specific date,
 * also it supports special value 'Forever' (value === undefined || value === null)
 */
class BeforeDatePicker extends React.Component<IdmDatePickerProps, State> {
    static UNLIMITED = UNLIMITED;
    static PERIOD = PERIOD;
    static DATE = DATE;

    static propTypes = {
        className: PropTypes.string,
        onChange: PropTypes.func.isRequired,
    };

    static defaultProps = {
        value: null,
    };

    static getDefaultValue() {
        return undefined;
    }

    static isEmpty() {
        return false;
    }

    static getDerivedStateFromProps({value}: IdmDatePickerProps, state: State) {
        const res: Partial<State> = {};
        const viewType = 'unlimited';
        if (!state.viewType && state.viewType !== viewType) {
            res.viewType = !value ? 'unlimited' : 'date';
        }

        return Object.keys(res).length > 0 ? res : null;
    }

    state = {
        viewType: null, // see ALLOWED_VIEW_TYPE

        period: null,
        periodError: null,
    };

    renderRadioButton() {
        const {viewType} = this.state;
        const {size} = this.props;

        return (
            <div>
                <RadioButton
                    size={size as any}
                    value={viewType || undefined}
                    onChange={this.onChangeViewType}
                    className={block('view-type')}
                >
                    {ALLOWED_VIEW_TYPE.map((item) => (
                        <RadioButton.Option key={item} value={item}>
                            {TEXT[item]}
                        </RadioButton.Option>
                    ))}
                </RadioButton>
            </div>
        );
    }

    onChangeViewType = (event: React.ChangeEvent<HTMLInputElement>) => {
        const viewType = event.target.value as State['viewType'];
        this.setState({viewType, periodError: null, period: null});

        const {value} = this.props;
        if (viewType === BeforeDatePicker.UNLIMITED && value !== null) {
            this.onNewDate(null);
        }
    };

    renderDateInput() {
        const {viewType, periodError, period} = this.state;
        const {value, size} = this.props;

        let control = null;

        if (viewType === BeforeDatePicker.PERIOD) {
            const dayCount = period === null ? dateToPeriod(value) : period;
            control = (
                <TextInput
                    error={periodError || undefined}
                    onUpdate={this.onChangePeriod}
                    value={String(dayCount || '')}
                    size={size}
                    placeholder="Enter days"
                />
            );
        }

        if (viewType === BeforeDatePicker.DATE) {
            control = (
                <Datepicker
                    controlSize={size}
                    from={value && value.getTime()}
                    range={false}
                    onUpdate={this.onDate}
                    controlWidth="unset"
                />
            );
        }
        return <div className={block('input-container')}>{control}</div>;
    }

    onChangePeriod = (valueStr: string) => {
        this.setState({period: valueStr});
        const daysCount = Number.parseInt(valueStr);
        if (String(daysCount) !== valueStr) {
            if (valueStr !== '') {
                this.setState({periodError: 'Please enter a valid number'});
            }
            return;
        }

        this.onNewDate(periodToDate(daysCount));
    };

    onDate = (value: DatepickerOutputDates) => {
        this.onNewDate(new Date(value.from as string | number));
    };

    onNewDate(date: Date | null) {
        const {onChange} = this.props;
        this.setState({periodError: null, period: null});
        onChange(date);
    }

    render() {
        const {className, onFocus, onBlur} = this.props;
        return (
            <FocusBlurContainer
                className={block(null, className)}
                onBlur={onBlur}
                onFocus={onFocus}
            >
                {this.renderRadioButton()}
                {this.renderDateInput()}
            </FocusBlurContainer>
        );
    }
}

export default BeforeDatePicker;
