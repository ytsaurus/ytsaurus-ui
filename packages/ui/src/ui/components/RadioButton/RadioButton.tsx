import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';

import hammer from '../../common/hammer';
import {Icon, IconData, SegmentedRadioGroup, SegmentedRadioGroupProps} from '@gravity-ui/uikit';

interface Props<T extends string = string> extends SegmentedRadioGroupProps<T> {
    items: Array<ItemType<T>>;
}

export interface ItemType<T extends string = string> {
    icon?: IconData;
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

        const options = items.map((item) => ({
            value: item.value,
            content: (
                <>
                    {item.icon && <Icon data={item.icon} size={13} />}
                    {item.text || ' '} {/* XXX whitespace helps render single icon correctly */}
                </>
            ),
        }));

        return (
            <SegmentedRadioGroup {...props} className={block(null, className)} options={options} />
        );
    }
}
