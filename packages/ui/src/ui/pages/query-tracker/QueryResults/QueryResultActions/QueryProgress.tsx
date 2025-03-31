import React, {FC} from 'react';
import {Progress, Tooltip} from '@gravity-ui/uikit';
import {QueryItem, QueryStatus} from '../../module/api';
import {QueryEngine} from '../../module/engines';
import {calculateQueryProgress} from '../helpers/calculateQueryProgress';

type Props = {
    query: QueryItem;
};

export const QueryProgress: FC<Props> = ({query}) => {
    const isSupportedEngine = [QueryEngine.SPYT, QueryEngine.CHYT].includes(query.engine);
    const isActiveState = [QueryStatus.RUNNING, QueryStatus.COMPLETING].includes(query.state);

    if (!isSupportedEngine || !isActiveState) return null;

    const percent = calculateQueryProgress(query.progress);
    return (
        <Tooltip content={`${percent}%`}>
            <div>
                <Progress theme="info" size="xs" value={percent} />
            </div>
        </Tooltip>
    );
};
