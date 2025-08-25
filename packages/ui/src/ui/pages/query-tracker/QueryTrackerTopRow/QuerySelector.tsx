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

const Filter = (size: SelectProps['size']) => {
    const FilterComponent: Required<SelectProps>['renderFilter'] = ({
        onChange,
        onKeyDown,
        ref,
        value,
    }) => {
        return (
            <div className={popupBlock('filter')}>
                <TextInput
                    ref={ref}
                    value={value}
                    size={size}
                    onKeyDown={onKeyDown}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        );
    };

    return FilterComponent;
};

export const QuerySelector = <T,>({
    size,
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
            size={size}
            filterable
            className={controlBlock(null, className)}
            popupClassName={popupBlock(null, popupClassName)}
            value={value ? [value] : []}
            onUpdate={handleChange}
            renderFilter={Filter(size)}
            {...props}
        >
            {children(items)}
        </Select>
    );
};
