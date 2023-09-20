import React from 'react';
import cn from 'bem-cn-lite';

import {Popover, PopoverProps} from '@gravity-ui/uikit';
import './Tooltip.scss';
import {FIX_MY_TYPE} from '../../types';

const block = cn('yt-tooltip');

export type TooltipProps = Omit<PopoverProps, 'theme' | 'children'> & {
    theme?: PopoverProps['theme'] | 'fix-link-colors';
    children?: React.ReactNode;
};

export function Tooltip(props: TooltipProps) {
    const {
        behavior,
        content,
        className,
        delayOpening = 400,
        delayClosing = 400,
        children,
        theme,
        ...rest
    } = props;

    const delayProps = Object.assign(
        {},
        'behavior' in props ? {behavior} : {delayOpening, delayClosing},
    );

    return content ? (
        <Popover
            {...rest}
            {...delayProps}
            theme={theme as FIX_MY_TYPE}
            className={className}
            content={content}
        >
            {children}
        </Popover>
    ) : (
        <div className={block(null, className)}>{children}</div>
    );
}
