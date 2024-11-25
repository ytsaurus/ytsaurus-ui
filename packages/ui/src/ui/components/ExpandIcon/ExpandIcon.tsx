import React from 'react';
import cn from 'bem-cn-lite';

import Icon from '../../components/Icon/Icon';

import './ExpandIcon.scss';

const block = cn('expand-icon');

type ExpandIconProps = {
    className?: string;

    expanded?: boolean;
    visible?: boolean;
    onClick?: (data?: string, expanded?: boolean) => void;

    data?: string;
};

export default function ExpandIcon({className, data, expanded, visible, onClick}: ExpandIconProps) {
    const icon = expanded ? 'angle-up' : 'angle-down';
    const onClickCb = React.useCallback(() => {
        if (onClick) {
            onClick(data, expanded);
        }
    }, [data, onClick, expanded]);

    return (
        <span
            className={block(
                {visible: Boolean(visible), clickable: onClick !== undefined},
                className,
            )}
            onClick={onClickCb}
        >
            <Icon awesome={icon} />
        </span>
    );
}
