import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import {TextInput} from '@gravity-ui/uikit';

import './ConfirmInput.scss';

const block = cn('confirm-input');

class ConfirmInput extends Component {
    static propTypes = {
        onConfirm: PropTypes.func,
        onChange: PropTypes.func,
        onError: PropTypes.func,
        className: PropTypes.string,
    };

    static defaultProps = {
        onConfirm: () => {},
        onChange: () => {},
        onError: () => {},
    };

    static getRandomNumber(min = 0, max = Infinity) {
        return Math.round(Math.random() * (max - min) + min);
    }

    state = {value: ''};

    firstValue = ConfirmInput.getRandomNumber(1, 9);
    secondValue = ConfirmInput.getRandomNumber(1, 9);

    handleInputChange = (value) => {
        const {onConfirm, onError, onChange} = this.props;

        const currentValue = Number(value);
        const correct = this.firstValue + this.secondValue === currentValue;

        if (correct) {
            onConfirm(correct);
        } else {
            onError(correct);
        }

        onChange(correct);

        this.setState({value});
    };

    render() {
        const {className} = this.props;
        const {value} = this.state;

        return (
            <div className={block(null, className)}>
                <p className={block('description')}>
                    Please enter the sum of {this.firstValue} + {this.secondValue} to confirm its
                    deletion
                </p>

                <TextInput size="l" value={value} onUpdate={this.handleInputChange} />
            </div>
        );
    }
}

export default ConfirmInput;
