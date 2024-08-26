import React, {FC} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import shevronRightSvg from '@gravity-ui/icons/svgs/chevron-right.svg';
import doubleShevronRightSvg from '@gravity-ui/icons/svgs/chevrons-right.svg';
import cn from 'bem-cn-lite';
import './ExpandButton.scss';

const block = cn('yt-expanded-button');

type Props = {
    className?: string;
    expanded: boolean;
    toggleExpanded: () => void;
    inline?: boolean;
    all?: boolean;
    showText?: boolean;
};

export const ExpandButton: FC<Props> = ({
    className,
    expanded,
    inline,
    toggleExpanded,
    all,
    showText,
}) => {
    const titleExpanded = all ? 'Collapse All' : 'Collapse';
    const titleCollapsed = all ? 'Expand All' : 'Expand';
    return (
        <Button
            className={block({inline}, className)}
            view="flat-secondary"
            title={expanded ? titleExpanded : titleCollapsed}
            onClick={toggleExpanded}
        >
            {showText && (expanded ? titleExpanded : titleCollapsed) + ' '}
            <Icon
                className={block('expand', {expanded})}
                data={all ? doubleShevronRightSvg : shevronRightSvg}
                size={16}
            />
        </Button>
    );
};
