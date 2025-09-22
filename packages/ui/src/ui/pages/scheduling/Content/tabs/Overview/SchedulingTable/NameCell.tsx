import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {ExpandableCell} from '../../../../../../components/DataTableGravity/ExpandableCell';
import Icon from '../../../../../../components/Icon/Icon';
import {OperationPool} from '../../../../../../components/OperationPool/OperationPool';
import {getCluster} from '../../../../../../store/selectors/global/cluster';
import {getTree} from '../../../../../../store/selectors/scheduling/scheduling-pools';

import PoolTags from '../../OverviewOld/PoolTags';

import {RowData} from './SchedulingTable';

const block = cn('yt-scheduling-name-cell');

export function NameCell({row}: {row: RowData}) {
    const cluster = useSelector(getCluster);
    const tree = useSelector(getTree);
    const allowExpand = row.type === 'pool' && (row.children.length > 0 || row.leaves);

    return (
        <ExpandableCell onExpand={allowExpand ? () => {} : undefined}>
            {renderTypeIcon(row.type)}
            {row.type === 'pool' ? (
                <>
                    <OperationPool cluster={cluster} pool={{pool: row.name, tree}} />
                    <PoolTags pool={row} />
                </>
            ) : null}
        </ExpandableCell>
    );
}

function renderTypeIcon(type: RowData['type']) {
    const icon = {
        pool: 'tasks' as const,
        operation: 'code' as const,
    }[type];

    return (
        <span
            className={block('operation-icon', {
                type: type,
            })}
            title={type}
        >
            <Icon awesome={icon} />
        </span>
    );
}
