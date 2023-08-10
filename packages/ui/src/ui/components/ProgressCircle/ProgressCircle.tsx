import {getProgressBarColorByIndex} from '../../constants/colors';
import React from 'react';

export type ProgressCircleProps = {
    className?: string;
    /**
     * Defines width and height
     */
    size: number;
    /**
     * Empty space between pieces in percents
     */
    gap?: number;
    stack: Array<Stack>;
};

export type Stack = {
    value: number;
    color?: string;
};

export function ProgressCircle({stack: rawStack, gap = 0, size, className}: ProgressCircleProps) {
    const stack = rawStack.filter(({value}) => Math.abs(value) > 0);
    if (!stack.length) {
        return null;
    }

    const sum = stack.reduce((acc, {value}) => {
        return acc + (isNaN(value) ? 0 : Math.abs(value));
    }, 0);

    const viewBox = 1000;
    const strokeWidth = viewBox / 5;

    const r = viewBox / 2 - strokeWidth / 2;
    const l = 2 * Math.PI * r;
    const gapLength = (l / 100) * (stack.length > 1 ? gap : 0);

    let lastOffset = gapLength;

    const storkeDashArrays = stack.map(({value}) => {
        const current = ((l - gapLength * stack.length) * Math.abs(value)) / sum;
        let res = '';

        res = `0 ${lastOffset} ${current} ${l}`;

        lastOffset += current + gapLength;
        return res;
    });

    return (
        <svg
            style={{transform: 'rotate(-90deg)'}}
            className={className}
            width={size}
            height={size}
            viewBox={`0 0 ${viewBox} ${viewBox}`}
        >
            {sum > 0 &&
                stack.map((item, index) => {
                    const current = (100 * Math.abs(item.value)) / sum;
                    const res = (
                        <circle
                            fill="none"
                            r={r}
                            key={index}
                            cx="50%"
                            cy="50%"
                            strokeDasharray={storkeDashArrays[index]}
                            stroke={item.color ?? getProgressBarColorByIndex(index)}
                            strokeWidth={strokeWidth}
                        />
                    );
                    lastOffset += current;
                    return res;
                })}
        </svg>
    );
}
