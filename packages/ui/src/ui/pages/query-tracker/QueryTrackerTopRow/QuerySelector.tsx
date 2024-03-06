import React, {ReactElement} from 'react';
import {Select, SelectProps, TextInput} from '@gravity-ui/uikit';
import type {Option} from '@gravity-ui/uikit/build/esm/components/Select/tech-components';
import {SelectOption} from '@gravity-ui/uikit/build/esm/components/Select/types';
import './QuerySelector.scss';
import cn from 'bem-cn-lite';

const controlBlock = cn('yt-query-selector-control');
const popupBlock = cn('yt-query-selector-popup');

type Props<T> = {
    items: T[];
    value?: string;
    onChange: (value: string) => void;
    children: (items: T[]) => ReactElement<SelectOption<T>, typeof Option>[];
} & Omit<SelectProps, 'children' | 'onUpdate' | 'value'>;

const Filter: Required<SelectProps>['renderFilter'] = ({onChange, onKeyDown, ref, value}) => {
    return (
        <div className={popupBlock('filter')}>
            <TextInput
                ref={ref}
                value={value}
                size="l"
                onKeyDown={onKeyDown}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export const QuerySelector = <T,>({
    items,
    children,
    className,
    popupClassName,
    onChange,
    value,
    ...props
}: Props<T>): JSX.Element => {
    const handleChange = (values: string[]) => {
        onChange(values.length ? values[0] : '');
    };

    return (
        <Select
            size="l"
            filterable
            className={controlBlock(null, className)}
            popupClassName={popupBlock(null, popupClassName)}
            value={value ? [value] : []}
            onUpdate={handleChange}
            renderFilter={Filter}
            {...props}
        >
            {children(items)}
        </Select>
    );
};
