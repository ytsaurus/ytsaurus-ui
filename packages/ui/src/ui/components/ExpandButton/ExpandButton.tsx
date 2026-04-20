import React, {type FC} from 'react';
import {Button, type ButtonProps, Icon} from '@gravity-ui/uikit';
import shevronRightSvg from '@gravity-ui/icons/svgs/chevron-right.svg';
import doubleShevronRightSvg from '@gravity-ui/icons/svgs/chevrons-right.svg';
import cn from 'bem-cn-lite';
import i18n from './i18n';
import './ExpandButton.scss';

const block = cn('yt-expanded-button');

type Props = {
    className?: string;
    expanded: boolean;
    toggleExpanded: () => void;
    inline?: boolean;
    all?: boolean;
    showText?: boolean;
    size?: ButtonProps['size'];
    qa?: ButtonProps['qa'];
};

export const ExpandButton: FC<Props> = ({
    className,
    expanded,
    inline,
    toggleExpanded,
    all,
    showText,
    size,
    qa,
}) => {
    const titleExpanded = all ? i18n('action_collapse-all') : i18n('action_collapse');
    const titleCollapsed = all ? i18n('action_expand-all') : i18n('action_expand');
    return (
        <Button
            className={block({inline}, className)}
            view="flat-secondary"
            title={expanded ? titleExpanded : titleCollapsed}
            onClick={toggleExpanded}
            size={size}
            qa={qa}
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
