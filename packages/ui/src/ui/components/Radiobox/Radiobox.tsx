import React from 'react';
import cn from 'bem-cn-lite';
import {RadioGroup, RadioGroupProps} from '@gravity-ui/uikit';

import './Radiobox.scss';

const block = cn('elements-radiobox');

export interface CustomRadioboxProps extends RadioGroupProps {
    layout?: 'vertical' | 'horizontal';
    items: Array<RadioBoxItem>;
}

interface RadioBoxItem {
    text: string;
    value: string;
}

export default function Radiobox({items, layout = 'vertical', ...props}: CustomRadioboxProps) {
    return (
        <RadioGroup {...props} className={block({layout})}>
            {items.map((option) => (
                <RadioGroup.Option {...option} key={option.value} className={block('radio')}>
                    {option.text}
                </RadioGroup.Option>
            ))}
        </RadioGroup>
    );
}
