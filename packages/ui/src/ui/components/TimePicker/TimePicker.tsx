import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import moment, {type Moment} from 'moment';

import {TextInput as TextInputImpl, type TextInputProps} from '@gravity-ui/uikit';

import Icon, {type IconProps} from '../Icon/Icon';
import i18n from './i18n';

import './TimePicker.scss';

const bForm = cn('elements-form');
const block = cn('timepicker');
const DISPLAY_FORMAT = 'HH:mm';
const invalidTitle = i18n('error_invalid-time');

// Retain legacy props ignored by the current UIKit implementation.
const TextInput: React.ComponentType<
    TextInputProps & {
        theme?: string;
        iconRight?: React.ReactNode;
        controlAttrs?: React.InputHTMLAttributes<HTMLInputElement>;
    }
> = TextInputImpl;

export const MomentObjectType = PropTypes.shape({
    _isAMomentObject: PropTypes.oneOf([true]),
});

export type TimePickerProps = {
    date: string | Moment;
    onChange: (date: string) => void;
    disabled?: boolean;
    minDate?: string | Moment | null;
};

type TimePickerState = {time: string; date: string | Moment};

export default class TimePicker extends Component<TimePickerProps, TimePickerState> {
    static defaultProps = {
        minDate: null,
        disabled: false,
    };

    static getDerivedStateFromProps(nextProps: TimePickerProps, prevState: TimePickerState) {
        if (nextProps.date !== prevState.date) {
            return {
                time: moment(nextProps.date).format(DISPLAY_FORMAT),
                date: nextProps.date,
            };
        }

        return null;
    }

    override state: TimePickerState = {
        time: '',
        date: '',
    };

    _checkInputTimeValidity(textTime: string) {
        return (
            new RegExp('[0-9]{2}:[0-9]{2}').test(textTime) &&
            moment(textTime, DISPLAY_FORMAT).isValid()
        );
    }

    _checkDateValidity(textDate: string) {
        const {minDate} = this.props;
        const newDate = moment(textDate).unix();

        return minDate ? newDate > moment(minDate).unix() : true;
    }

    _prepareOutputDate(textTime: string) {
        const {date} = this.state;
        const currentDate = moment(date);
        const newDate = moment(textTime, DISPLAY_FORMAT);

        newDate.year(currentDate.year());
        newDate.month(currentDate.month());
        newDate.date(currentDate.date());

        return newDate.toISOString();
    }

    handleTimeChange = (newTime: string) => {
        const {onChange} = this.props;
        const isValidFormat = this._checkInputTimeValidity(newTime);

        this.setState({time: newTime});

        if (isValidFormat) {
            const newDate = this._prepareOutputDate(newTime);

            onChange(newDate);
        }
    };

    renderIcon(icon: IconProps['awesome']) {
        return <Icon awesome={icon} />;
    }

    override render() {
        const {time} = this.state;
        const {disabled} = this.props;
        const newDate = this._prepareOutputDate(time);

        const isValidFormat = this._checkInputTimeValidity(time);
        const isValidDate = this._checkDateValidity(newDate);
        const isValid = isValidFormat && isValidDate;

        const title = isValid ? '' : invalidTitle;

        return (
            <div className={bForm('field', {theme: isValid ? 'valid' : 'invalid'}, block())}>
                <TextInput
                    theme="normal"
                    size="s"
                    value={time}
                    disabled={disabled}
                    onUpdate={this.handleTimeChange}
                    iconRight={this.renderIcon('clock')}
                    controlAttrs={{
                        maxLength: 5,
                        title,
                    }}
                    className={block('control')}
                    placeholder={i18n('placeholder_time')}
                />
            </div>
        );
    }
}
