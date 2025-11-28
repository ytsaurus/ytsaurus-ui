import React from 'react';

import {Icon, Link, Text, Tooltip} from '@gravity-ui/uikit';

import {nodeHasInfo} from '../../utils';

import OperationNodeInfo from '../../OperationNodeInfo';

import infoIcon from '@gravity-ui/icons/svgs/circle-info.svg';

import cn from 'bem-cn-lite';

import './NodeName.scss';
import {RowType} from '../../Timeline/utils';
import {makeNavigationLink} from '../../../../../utils/app-url';

const block = cn('node-name');

export function NodeName({row, className}: {row: RowType; className?: string}) {
    const {node, link} = row;
    let name = <span title={node.title}>{node.label}</span>;

    if (link) {
        name = (
            <Link
                href={makeNavigationLink({
                    cluster: link.cluster,
                    path: link.path,
                })}
                title={node.title}
                target="_blank"
            >
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
                <Tooltip
                    className={block('operation-node-info')}
                    content={
                        <OperationNodeInfo
                            {...node}
                            className={block('operation-node-info-popup')}
                        />
                    }
                    placement={['right', 'left']}
                    openDelay={300}
                    closeDelay={300}
                >
                    <Icon className={block('icon')} data={infoIcon} size={12} />
                </Tooltip>
            )}
        </span>
    );
}
