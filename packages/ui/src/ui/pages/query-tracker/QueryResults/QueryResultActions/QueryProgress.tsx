import React, {FC} from 'react';
import {Progress, Tooltip} from '@gravity-ui/uikit';
import {QueryItem, QueryStatus} from '../../module/api';

type Props = {
    query: QueryItem;
};

export const QueryProgress: FC<Props> = ({query}) => {
    if (
        query.engine !== 'spyt' ||
        !(query.state === QueryStatus.RUNNING || query.state === QueryStatus.COMPLETING)
    )
        return null;

    const percent = query.progress?.spyt_progress
        ? Math.round(query.progress.spyt_progress * 100)
        : 0;

    return (
        <Tooltip content={`${percent}%`}>
            <div>
                <Progress theme="info" size="xs" value={percent} />
            </div>
        </Tooltip>
    );
};
