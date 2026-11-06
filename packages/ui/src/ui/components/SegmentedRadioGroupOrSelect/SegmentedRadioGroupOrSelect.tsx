import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import {SelectSingle} from '../Select/Select';
import cn from 'bem-cn-lite';

const block = cn('yt-segmented-radio-group-or-select');
/**
 * Props for the SegmentedRadioGroupOrSelect component.
 * @template T - The type of the option values
 */
export type RadioOrSelectProps<T extends string | undefined = string> = {
    /** Current selected value */
    value: T;
    /** Available options with value and display text */
    options: Array<{value: T; text: React.ReactNode}>;
    /** Callback fired when the value changes */
    onUpdate: (value: T) => void;
    /** Additional elements whose width changes trigger a new layout check. */
    resizeTriggerElements?: ReadonlyArray<HTMLElement | null>;
};

/**
 * A smart component that automatically switches between a segmented radio group
 * and a dropdown select based on available container width.
 *
 * @example
 * ```tsx
 * <SegmentedRadioGroupOrSelect
 *   value="option1"
 *   options={[
 *     { value: 'option1', text: 'Option 1' },
 *     { value: 'option2', text: 'Option 2' },
 *   ]}
 *   onUpdate={(value) => console.log(value)}
 * />
 * ```
 */
export function SegmentedRadioGroupOrSelect<T extends string>({
    resizeTriggerElements,
    value,
    options,
    onUpdate,
}: RadioOrSelectProps<T>) {
    const [mode, setMode] = useState<'radio' | 'select' | 'measuring'>('measuring');
    const [element, setElement] = useState<HTMLElement | null>(null);
    const settledWidths = useRef(new Map<HTMLElement, number>());
    const observedElements = useMemo(() => {
        const elements = [element, element?.parentElement, ...(resizeTriggerElements ?? [])];
        return [...new Set(elements.filter((item): item is HTMLElement => Boolean(item)))];
    }, [element, resizeTriggerElements]);

    useLayoutEffect(() => {
        const observer = new ResizeObserver(() => {
            // Read the current layout: queued entries may describe a temporary Radio render.
            const hasChangedWidth = observedElements.some((item) => {
                const width = item.getBoundingClientRect().width;
                return Math.abs(width - (settledWidths.current.get(item) ?? -1)) > 1;
            });
            if (hasChangedWidth) {
                setMode('measuring');
            }
        });
        observedElements.forEach((item) => observer.observe(item));
        setMode('measuring');
        return () => observer.disconnect();
    }, [observedElements, options]);

    useLayoutEffect(() => {
        const parent = element?.parentElement;
        if (!element || !parent) {
            return;
        }
        if (mode === 'measuring') {
            const parentWidth = parent.getBoundingClientRect().width;
            const width = element.getBoundingClientRect().width;
            // Check the full Radio before paint, retaining the fractional-width tolerance.
            const overflows = parentWidth + 1 < width;
            setMode(overflows ? 'select' : 'radio');
            return;
        }
        // Switching controls also resizes siblings; those notifications must not restart the check.
        settledWidths.current = new Map(
            observedElements.map((item) => [item, item.getBoundingClientRect().width]),
        );
    }, [element, mode, observedElements]);

    return (
        <div className={block({mode: mode === 'select' ? 'select' : 'radio'})} ref={setElement}>
            {mode === 'select' ? (
                <SelectSingle
                    hideClear
                    value={value}
                    items={options}
                    onChange={(v) => {
                        if (v !== undefined) {
                            onUpdate(v);
                        }
                    }}
                />
            ) : (
                <SegmentedRadioGroup
                    value={value}
                    options={options.map((i) => {
                        return {value: i.value, content: i.text};
                    })}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
}
