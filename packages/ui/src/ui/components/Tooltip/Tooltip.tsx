import React from 'react';
import cn from 'bem-cn-lite';

import {Tooltip as GravityTooltip, TooltipProps as GravityTooltipProps} from '@gravity-ui/uikit';
import './Tooltip.scss';

const block = cn('yt-tooltip');

const SHOW_HIDE_DELAY = 400;

export type TooltipProps = Omit<GravityTooltipProps, 'children'> & {
    children?: React.ReactNode;
    useFlex?: boolean;
    ellipsis?: boolean;
    qa?: string;
};

export function Tooltip(props: TooltipProps) {
    const {
        content,
        className,
        children,
        useFlex,
        ellipsis,
        qa,
        openDelay,
        closeDelay,
        placement,
        ...rest
    } = props;

    if (!content) {
        return (
            <div className={block({flex: useFlex, ellipsis}, className)} data-qa={qa}>
                {children}
            </div>
        );
    }

    return (
        <GravityTooltip
            {...rest}
            content={content}
            openDelay={openDelay ?? SHOW_HIDE_DELAY}
            closeDelay={closeDelay ?? SHOW_HIDE_DELAY}
            placement={placement ?? 'right'}
        >
            <div
                className={block(
                    {flex: useFlex, 'has-tooltip': true, ellipsis, width: '100%'},
                    className,
                )}
                data-qa={qa}
            >
                {children}
            </div>
        </GravityTooltip>
    );
}
