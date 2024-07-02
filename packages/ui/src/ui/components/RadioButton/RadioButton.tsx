import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';

import hammer from '../../common/hammer';
import Icon from '../Icon/Icon';
import {RadioButton, RadioButtonProps} from '@gravity-ui/uikit';

interface Props extends RadioButtonProps {
    items: Array<ItemType>;
}

export interface ItemType {
    icon?: any;
    text: string;
    value: string;
}

const block = cn('elements-radiobutton');

export default class CustomRadioButton extends React.Component<Props> {
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
