import React, {FC} from 'react';
import {Progress, Tooltip} from '@gravity-ui/uikit';
import {QueryStatus} from '../../../../types/query-tracker';
import {QueryItem} from '../../module/api';
import {calculateQueryProgress} from '../helpers/calculateQueryProgress';
import {QueryEngine} from '../../../../../shared/constants/engines';

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
