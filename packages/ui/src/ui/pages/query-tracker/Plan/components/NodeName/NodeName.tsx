import React from 'react';
import {Icon, Link, Popover, Text} from '@gravity-ui/uikit';
import {ProcessedNode, nodeHasInfo} from '../../utils';

import OperationNodeInfo from '../../OperationNodeInfo';

import infoIcon from '@gravity-ui/icons/svgs/circle-info.svg';

import cn from 'bem-cn-lite';

import './NodeName.scss';

const block = cn('node-name');

export function NodeName({node, className}: {node: ProcessedNode; className?: string}) {
    let name = <span title={node.title}>{node.label}</span>;
    if (node.url) {
        name = (
            <Link href={node.url} title={node.title} target="_blank">
                {node.label}
                {node.type === 'in' ||
                    (node.type === 'out' && <Text color="secondary">{` (${node.type})`}</Text>)}
            </Link>
        );
    }
    return (
        <span className={block('name', className)}>
            {name}
            {nodeHasInfo(node) && (
                <Popover
                    className={block('operation-node-info')}
                    tooltipContentClassName={block('operation-node-info-popup')}
                    content={<OperationNodeInfo {...node} />}
                    hasArrow={false}
                    placement={['right', 'left']}
                    delayOpening={300}
                >
                    <Icon className={block('icon')} data={infoIcon} size={12} />
                </Popover>
            )}
        </span>
    );
}
