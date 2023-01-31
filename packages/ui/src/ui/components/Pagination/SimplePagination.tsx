import React from 'react';
import Pagination from './Pagination';

interface Props {
    value?: number;
    min?: number;
    max?: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    step?: number;
    className?: string;
}

function SimplePagination(props: Props) {
    const {value = NaN, min = NaN, max = NaN, onChange, disabled, step = 1, className} = props;

    const firstDiff = isNaN(value) || isNaN(min) ? 0 : value - min;
    const lastDiff = isNaN(value) || isNaN(max) ? 0 : max - value;

    const handleToFirst = React.useCallback(() => {
        onChange(min);
    }, [min, onChange]);

    const handleToPrev = React.useCallback(() => {
        const newValue = value - step;
        onChange(newValue < min ? min : newValue);
    }, [min, value, step, onChange]);

    const handleToNext = React.useCallback(() => {
        const newValue = value + step;
        onChange(newValue > max ? max : newValue);
    }, [max, value, step, onChange]);

    const handleToLast = React.useCallback(() => {
        onChange(max);
    }, [max, onChange]);

    return (
        <Pagination
            className={className}
            first={{
                handler: handleToFirst,
                disabled: firstDiff === 0 || disabled,
            }}
            previous={{
                handler: handleToPrev,
                disabled: firstDiff === 0 || disabled,
            }}
            next={{
                handler: handleToNext,
                disabled: lastDiff === 0 || disabled,
            }}
            last={{
                handler: handleToLast,
                disabled: lastDiff === 0 || disabled,
            }}
        />
    );
}

export default React.memo(SimplePagination);
