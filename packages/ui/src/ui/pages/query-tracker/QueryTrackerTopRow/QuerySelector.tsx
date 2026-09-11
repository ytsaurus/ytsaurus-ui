import React, {type ReactElement} from 'react';
import {Select, type SelectOption, type SelectProps, TextInput} from '@gravity-ui/uikit';
import './QuerySelector.scss';
import cn from 'bem-cn-lite';

const controlBlock = cn('yt-query-selector-control');
const popupBlock = cn('yt-query-selector-popup');

type Props<T> = {
    items: T[];
    value?: string;
    onChange: (value: string) => void;
    children: (items: T[]) => ReactElement<SelectOption<T>, typeof Select.Option>[];
} & Omit<SelectProps, 'children' | 'onUpdate' | 'value'>;

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
            renderFilter={(filterProps) => {
                const {onChange: onFilterChange, ...inputProps} = filterProps;

                return (
                    <div className={popupBlock('filter')}>
                        <TextInput
                            {...inputProps}
                            size={size}
                            onChange={(e) => onFilterChange(e.target.value)}
                        />
                    </div>
                );
            }}
            {...props}
        >
            {children(items)}
        </Select>
    );
};
