import React, {FC} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import expandedIcon from '@gravity-ui/icons/svgs/chevron-right.svg';
import cn from 'bem-cn-lite';
import './ExpandButton.scss';

const block = cn('yt-expanded-button');

type Props = {
    expanded: boolean;
    toggleExpanded: () => void;
};

export const ExpandButton: FC<Props> = ({expanded, toggleExpanded}) => {
    return (
        <Button
            view="flat-secondary"
            title={expanded ? 'Collapse' : 'Expand'}
            onClick={toggleExpanded}
        >
            <Icon className={block('expand', {expanded})} data={expandedIcon} size={16} />
        </Button>
    );
};
