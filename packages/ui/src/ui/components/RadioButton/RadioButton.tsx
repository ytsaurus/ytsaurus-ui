import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';

import hammer from '../../common/hammer';
import Icon from '../Icon/Icon';
import {RadioButton, RadioButtonProps} from '@gravity-ui/uikit';

interface Props<T extends string = string> extends RadioButtonProps<T> {
    items: Array<ItemType<T>>;
}

export interface ItemType<T extends string = string> {
    icon?: any;
    text: string;
    value: T;
}

const block = cn('elements-radiobutton');

export default class CustomRadioButton<T extends string = string> extends React.Component<
    Props<T>
> {
    static propTypes = {
        value: PropTypes.string,
        items: PropTypes.arrayOf(PropTypes.shape({value: PropTypes.string})),
    };

    static prepareSimpleValue(value: Props['value']) {
        if (value === undefined || value === null) {
            throw new Error('CustomRadioButton: unexpected value');
        }
        return {
            value: value,
            text: hammer.format['ReadableField'](value),
        };
    }

    render() {
        const {items, className, ...props} = this.props;

        return (
            <RadioButton {...props} className={block(null, className)}>
                {items.map((option) => (
                    <RadioButton.Option {...option} key={option.value}>
                        {option.icon && <Icon {...option.icon} />}
                        {option.text || ' '}{' '}
                        {/* XXX whitespace helps render single icon correctly */}
                    </RadioButton.Option>
                ))}
            </RadioButton>
        );
    }
}
