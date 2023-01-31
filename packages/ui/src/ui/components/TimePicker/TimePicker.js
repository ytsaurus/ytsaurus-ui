import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import moment from 'moment';

import {TextInput} from '@gravity-ui/uikit';

import Icon from '../Icon/Icon';

import './TimePicker.scss';

const bForm = cn('elements-form');
const block = cn('timepicker');
const DISPLAY_FORMAT = 'HH:mm';
const invalidTitle = `Time should be specified as HH:MM.
Estimated start time should be less than estimated finish time.`;

export const MomentObjectType = PropTypes.shape({
    _isAMomentObject: PropTypes.oneOf([true]),
});

export default class TimePicker extends Component {
    static propTypes = {
        date: PropTypes.oneOfType([PropTypes.string, MomentObjectType]).isRequired,
        onChange: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        minDate: PropTypes.oneOfType([PropTypes.string, MomentObjectType]),
    };

    static defaultProps = {
        minDate: null,
        disabled: false,
    };

    state = {
        time: '',
        date: '',
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.date !== prevState.date) {
            return {
                time: moment(nextProps.date).format(DISPLAY_FORMAT),
                date: nextProps.date,
            };
        }

        return null;
    }

    _checkInputTimeValidity(textTime) {
        return (
            new RegExp('[0-9]{2}:[0-9]{2}').test(textTime) &&
            moment(textTime, DISPLAY_FORMAT).isValid()
        );
    }

    _checkDateValidity(textDate) {
        const {minDate} = this.props;
        const newDate = moment(textDate).unix();

        return minDate ? newDate > moment(minDate).unix() : true;
    }

    _prepareOutputDate(textTime) {
        const {date} = this.state;
        const currentDate = moment(date);
        const newDate = moment(textTime, DISPLAY_FORMAT);

        newDate.year(currentDate.year());
        newDate.month(currentDate.month());
        newDate.date(currentDate.date());

        return newDate.toISOString();
    }

    handleTimeChange = (newTime) => {
        const {onChange} = this.props;
        const isValidFormat = this._checkInputTimeValidity(newTime);

        this.setState({time: newTime});

        if (isValidFormat) {
            const newDate = this._prepareOutputDate(newTime);

            onChange({from: newDate});
        }
    };

    renderIcon(icon) {
        return <Icon awesome={icon} />;
    }

    render() {
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
                    placeholder={'HH:mm'}
                />
            </div>
        );
    }
}
