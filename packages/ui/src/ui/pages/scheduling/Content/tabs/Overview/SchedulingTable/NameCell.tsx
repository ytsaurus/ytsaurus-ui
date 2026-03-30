import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {ExpandableCell} from '../../../../../../components/DataTableGravity/ExpandableCell';
import Link from '../../../../../../components/Link/Link';
import {OperationPool} from '../../../../../../components/OperationPool/OperationPool';
import {Tooltip} from '../../../../../../components/Tooltip/Tooltip';
import {setExpandedPools} from '../../../../../../store/actions/scheduling/expanded-pools';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import {selectCluster} from '../../../../../../store/selectors/global/cluster';
import {
    getCurrentPool,
    getCurrentTreeExpandedPools,
} from '../../../../../../store/selectors/scheduling/scheduling';
import {getTree} from '../../../../../../store/selectors/scheduling/scheduling-pools';
import {PoolLeafNode} from '../../../../../../utils/scheduling/pool-child';
import {unquote} from '../../../../../../utils/string';
import {YSON_AS_TEXT, prettyPrintSafe} from '../../../../../../utils/unipika';
import './NameCell.scss';
import PoolTags from './PoolTags';
import type {RowData} from './SchedulingTable';

const block = cn('yt-scheduling-name-cell');

export function NameCell({row}: {row: RowData}) {
    const cluster = useSelector(selectCluster);
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
                        hideTree
                        routed
                        className={block('pool')}
                        cluster={cluster}
                        pool={{
                            pool: incomplete ? '' : row.name,
                            tree,
                            isLightweight: row.isEffectiveLightweight,
                            isEphemeral: row.isEphemeral,
                        }}
                        theme="primary"
                    />
                    <span style={{flex: '1 1 0px'}} />
                    <PoolTags pool={row} />
                </>
            ) : (
                renderOperationName({cluster, row})
            )}
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

    const hasTitle = Boolean(title);

    return (
        <Flex direction="column" style={{margin: '-4px 0'}} overflow="hidden">
            <Text variant="inherit" ellipsis>
                {fifoIndexNode}
                <Link url={url}>
                    {hasTitle ? unquote(prettyPrintSafe(title, YSON_AS_TEXT())) : id}
                </Link>
            </Text>
            {hasTitle && (
                <Text variant="code-inline-1" color="secondary" ellipsis>
                    {id}
                </Text>
            )}
        </Flex>
    );
}
