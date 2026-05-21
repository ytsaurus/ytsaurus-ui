import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import React from 'react';
import useResizeObserver from '../../hooks/useResizeObserver';
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
    /** Which ancestor element to observe for width changes: 'parent' or 'grandparent' (default: 'grandparent') */
    observeWidthBy?: 'parent' | 'grandparent';
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
export function SegmentedRadioGroupOrSelect({
    observeWidthBy = 'parent',
    value,
    options,
    onUpdate,
}: RadioOrSelectProps) {
    const switchWidthRef = React.useRef<number>(0);
    const [mode, setMode] = React.useState<'radio' | 'select'>('radio');
    const [element, setElement] = React.useState<HTMLElement | null>(null);

    const observeWidthByElement =
        observeWidthBy === 'parent'
            ? element?.parentElement
            : element?.parentElement?.parentElement;

    useResizeObserver({
        element: observeWidthByElement,
        onResize: ([item]) => {
            const observedWidth = item.contentRect.width;

            requestAnimationFrame(() => {
                const parentWidth = element?.parentElement?.getBoundingClientRect().width ?? 0;
                const {width = 0} = element?.getBoundingClientRect() ?? {};

                if ((width > 0 && parentWidth < width) || observedWidth < parentWidth) {
                    setMode('select');
                    switchWidthRef.current = observedWidth;
                } else if (observedWidth > switchWidthRef.current) {
                    setMode('radio');
                }
            });
        },
    });

    return (
        <div className={block()} ref={setElement}>
            {mode === 'select' ? (
                <SelectSingle value={value} items={options} onChange={(v) => onUpdate(v!)} />
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
