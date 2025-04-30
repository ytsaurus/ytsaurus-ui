import React from 'react';
import {useElementSize} from '../../hooks/useResizeObserver';

export type ElementWidthAsCssVariableProps = {
    className: string;
    cssVariableName: `--${string}`;
    element?: HTMLElement;
};

export function ElementWidthAsCssVariable({
    className,
    cssVariableName,
    element,
}: ElementWidthAsCssVariableProps) {
    const size = useElementSize({element});
    const value = `${size?.contentRect.width ?? 0}px`;
    return !element ? null : <style>{`.${className} {${cssVariableName}: ${value};}`}</style>;
}
