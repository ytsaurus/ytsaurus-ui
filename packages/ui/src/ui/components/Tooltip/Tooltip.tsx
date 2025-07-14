import React from 'react';
import cn from 'bem-cn-lite';

import {Popover, PopoverInstanceProps, PopoverProps} from '@gravity-ui/uikit';
import './Tooltip.scss';
import {FIX_MY_TYPE} from '../../types';

const block = cn('yt-tooltip');

export type TooltipProps = Omit<
    PopoverProps,
    'theme' | 'children' | 'delayOpening' | 'delayClosing' | 'behavior'
> & {
    theme?: PopoverProps['theme'] | 'fix-link-colors';
    children?: React.ReactNode;
    useFlex?: boolean;
    ellipsis?: boolean;
    qa?: string;
};

const SHOW_HIDE_DELAY = 400;

export function Tooltip(props: TooltipProps) {
    const {content, className, children, theme, useFlex, ellipsis, qa, ...rest} = props;

    const anchorRef = React.useRef<HTMLDivElement>(null);
    const popoverRef = React.useRef<PopoverInstanceProps>(null);

    const [isOpen, setOpen] = React.useState(rest.initialOpen);
    const [nextOpen, setNextOpen] = React.useState<boolean | undefined>(undefined);

    const toggleOpen = React.useCallback(() => {
        if (isOpen) {
            popoverRef.current?.closeTooltip();
        } else {
            popoverRef.current?.openTooltip();
        }
    }, [isOpen]);

    React.useEffect(() => {
        if (nextOpen === undefined) {
            return () => {};
        }

        const timerId = setTimeout(() => {
            if (nextOpen !== isOpen) {
                if (nextOpen) {
                    popoverRef.current?.openTooltip();
                } else {
                    popoverRef.current?.closeTooltip();
                }
            }
            setNextOpen(undefined);
        }, SHOW_HIDE_DELAY);

        return () => {
            clearTimeout(timerId);
        };
    }, [isOpen, nextOpen]);

    const handleClose = React.useCallback(() => {
        setNextOpen(false);
    }, []);

    const handleOpen = React.useCallback(() => {
        setNextOpen(true);
    }, []);

    return (
        <div
            className={block({flex: useFlex, 'has-tooltip': Boolean(content), ellipsis}, className)}
            ref={anchorRef}
            onMouseOver={handleOpen}
            onMouseOut={handleClose}
            onClick={toggleOpen}
            data-qa={qa}
        >
            {children}
            {content ? (
                <Popover
                    {...rest}
                    theme={theme as FIX_MY_TYPE}
                    className={className}
                    content={content}
                    anchorRef={anchorRef}
                    ref={popoverRef}
                    onOpenChange={setOpen}
                />
            ) : null}
        </div>
    );
}
