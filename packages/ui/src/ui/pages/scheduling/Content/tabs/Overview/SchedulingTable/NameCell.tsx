import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
//import cn from 'bem-cn-lite';

import {Flex, Text} from '@gravity-ui/uikit';

import {setExpandedPools} from '../../../../../../store/actions/scheduling/expanded-pools';
import {
    getCurrentPool,
    getCurrentTreeExpandedPools,
} from '../../../../../../store/selectors/scheduling/scheduling';

import {ExpandableCell} from '../../../../../../components/DataTableGravity/ExpandableCell';
import Link from '../../../../../../components/Link/Link';
import {OperationPool} from '../../../../../../components/OperationPool/OperationPool';
import {Tooltip} from '../../../../../../components/Tooltip/Tooltip';
import {getCluster} from '../../../../../../store/selectors/global/cluster';
import {getTree} from '../../../../../../store/selectors/scheduling/scheduling-pools';

import {PoolLeafNode} from '../../../../../../utils/scheduling/pool-child';

import PoolTags from './PoolTags';

import type {RowData} from './SchedulingTable';

//const block = cn('yt-scheduling-name-cell');

export function NameCell({row}: {row: RowData}) {
    const cluster = useSelector(getCluster);
    const tree = useSelector(getTree);
    const currentPool = useSelector(getCurrentPool);

    const dispatch = useDispatch();
    const expandedPools = useSelector(getCurrentTreeExpandedPools);

    const handlePoolExpand = React.useCallback(
        (poolName: string, value: boolean) => {
            dispatch(setExpandedPools({[poolName]: value}));
        },
        [dispatch],
    );

    const {name, type, level = 0, incomplete} = row;
    const isCurrentPool = currentPool?.name === name;
    const {child_pool_count = 0, pool_operation_count = 0} = row.attributes;
    const allowExpand = child_pool_count > 0 || pool_operation_count > 0;

    const expanded = type === 'pool' ? Boolean(expandedPools?.get(name)) : undefined;

    return (
        <ExpandableCell
            level={level}
            expanded={expanded}
            onExpand={
                !isCurrentPool && allowExpand ? () => handlePoolExpand(name, !expanded) : undefined
            }
        >
            {row.type === 'pool' ? (
                <>
                    <OperationPool
                        cluster={cluster}
                        pool={{pool: incomplete ? '' : row.name, tree}}
                        hideTree
                        routed
                    />
                </>
            ) : (
                renderOperationName({cluster, row})
            )}
            <PoolTags pool={row} />
        </ExpandableCell>
    );
}

function renderOperationName({cluster, row}: {cluster: string; row: PoolLeafNode}) {
    const {
        id,
        attributes: {title},
        fifoIndex,
    } = row;
    const url = `/${cluster}/operations/${id}`;

    const fifoIndexNode =
        fifoIndex !== undefined ? (
            <Tooltip content={`Fifo index: ${fifoIndex}`}>#{fifoIndex}&nbsp;</Tooltip>
        ) : null;

    const hasTitle = 0 > title?.length!;

    return (
        <Flex direction="column">
            <Text variant="inherit" ellipsis>
                {fifoIndexNode}
                <Link url={url}>{title ?? id}</Link>
            </Text>
            {!hasTitle && (
                <Text variant="code-inline-1" color="secondary">
                    {id}
                </Text>
            )}
        </Flex>
    );
}
