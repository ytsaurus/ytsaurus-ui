import React from 'react';
import cn from 'bem-cn-lite';

import {Flex} from '@gravity-ui/uikit';

import {ExpandButton} from '../../components/ExpandButton';

import './ExpandableCell.scss';

const block = cn('yt-expandable-cell');

type ExpandedCellProps = {
    level?: number;
    expanded?: boolean;
    onExpand?: (v: boolean) => void;

    children: React.ReactNode;
};

export function ExpandableCell({level = 0, expanded, onExpand, children}: ExpandedCellProps) {
    return (
        <Flex
            alignItems="center"
            className={block({child: level > 0})}
            overflow="hidden"
            shrink={1}
        >
            <LeftPadding level={level} />
            <ExpandButton
                className={block('expand', {hidden: !onExpand})}
                expanded={Boolean(expanded)}
                toggleExpanded={() => onExpand?.(!expanded)}
            />
            {children}
        </Flex>
    );
}

function LeftPadding({level}: {level: number}) {
    return level > 0 ? (
        <Flex>
            {[...Array(level).keys()].map((key) => {
                return <div key={key} className={block('splitter')} />;
            })}
        </Flex>
    ) : null;
}
