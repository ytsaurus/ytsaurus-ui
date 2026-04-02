import React, {type FC} from 'react';
import {Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import hammer from '../../../../../common/hammer';
import {QueryStatusIcon} from '../../../../../components/QueryStatus';
import {formatTime} from '../../../../../components/common/Timeline/util';
import {type QueryItem} from '../../../../../types/query-tracker/api';
import EditQueryNameModal from '../../EditQueryNameModal/EditQueryNameModal';
import {QueryStatus} from '../../../../../types/query-tracker';
import {QueryDuration} from '../../../QueryDuration';
import {QueryEnginesNames} from '../../../../../../shared/constants/engines';
import './ColumnCells.scss';

const b = block('yt-queries-column-cells');

type CellProps = {
    row: QueryItem;
};

export const QueryHistoryNameCell: FC<CellProps> = ({row}) => {
    const name = row.annotations?.title;
    return (
        <div className={b('name')} title={name}>
            <QueryStatusIcon className={b('status-icon')} status={row.state} />
            <Text className={b('name-container')} color={name ? 'primary' : 'secondary'} ellipsis>
                {name || 'No name'}
            </Text>
        </div>
    );
};

export const QueryHistoryActionCell: FC<CellProps> = ({row}) => {
    return (
        <div className={b('action')} onClick={(e) => e.stopPropagation()}>
            <EditQueryNameModal className={b('name-edit')} query={row} />
        </div>
    );
};

export const QueryHistoryTypeCell: FC<CellProps> = ({row}) => {
    return (
        <Text variant="body-1" color="secondary">
            {row.engine in QueryEnginesNames ? QueryEnginesNames[row.engine] : row.engine}
        </Text>
    );
};

export const QueryHistoryDurationCell: FC<CellProps> = ({row}) => {
    if (row.state === QueryStatus.RUNNING) {
        return hammer.format.NO_VALUE;
    }
    return <QueryDuration query={row} />;
};

export const QueryHistoryStartedCell: FC<CellProps> = ({row}) => {
    return (
        <Text variant="body-1" color="secondary">
            {formatTime(row.start_time)}
        </Text>
    );
};

export const QueryHistoryAuthorCell: FC<CellProps> = ({row}) => {
    return (
        <Text variant="body-1" ellipsis title={row.user}>
            {row.user}
        </Text>
    );
};

export const QueryHistoryACOCell: FC<CellProps> = ({row}) => {
    const title = row.access_control_objects?.join(', ');

    return (
        <Text variant="body-1" ellipsis title={title}>
            {title}
        </Text>
    );
};
