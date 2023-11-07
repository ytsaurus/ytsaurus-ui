import React from 'react';
import {Icon, Link, Popover, Text} from '@gravity-ui/uikit';
import {ProcessedNode, isExternalUrl, nodeHasInfo, performAction} from '../../utils';

import OperationNodeInfo from '../../OperationNodeInfo';

import infoIcon from '@gravity-ui/icons/svgs/circle-info.svg';

import cn from 'bem-cn-lite';

import './NodeName.scss';

const block = cn('node-name');

export function NodeName({node, className}: {node: ProcessedNode; className?: string}) {
    let name = <span title={node.title}>{node.label}</span>;
    if (node.url) {
        if (isExternalUrl(node.url)) {
            name = (
                <Link href={node.url} target="_blank" rel="noreferrer noopener" title={node.title}>
                    {node.label}
                </Link>
            );
        } else {
            name = (
                <Link
                    href={node.url}
                    onClick={(event) => {
                        performAction(node.url!, event);
                    }}
                    title={node.title}
                >
                    {node.label}
                    {node.type === 'in' ||
                        (node.type === 'out' && <Text color="secondary">{` (${node.type})`}</Text>)}
                </Link>
            );
        }
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
