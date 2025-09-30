import React, {FC, useMemo} from 'react';
import {Flex, Progress, Tooltip} from '@gravity-ui/uikit';
import {QueryStatus} from '../../../../types/query-tracker';
import {QueryItem, isSingleProgress} from '../../../../store/actions/queries/api';
import {calculateQueryProgress} from '../helpers/calculateQueryProgress';
import {QueryEngine} from '../../../../../shared/constants/engines';

type Props = {
    query: QueryItem;
};

export const QueryProgress: FC<Props> = ({query}) => {
    const isSupportedEngine = [QueryEngine.SPYT, QueryEngine.CHYT].includes(query.engine);
    const isActiveState = [QueryStatus.RUNNING, QueryStatus.COMPLETING].includes(query.state);

    const percents = useMemo(() => {
        if (!query.progress || !isSupportedEngine || !isActiveState) return [];

        if (isSingleProgress(query.progress)) {
            const percent = calculateQueryProgress(query.progress);
            return [
                {
                    tooltip: `${percent}%`,
                    percent,
                },
            ];
        }
        return query.progress.progress.map((item) => {
            const percent = calculateQueryProgress(item);
            return {
                tooltip: `${item.query_id} - ${percent}%`,
                percent,
            };
        });
    }, [isActiveState, isSupportedEngine, query.progress]);

    return (
        <Flex direction="column" gap={1}>
            {percents.map(({tooltip, percent}) => {
                return (
                    <Tooltip key={tooltip} content={tooltip}>
                        <div>
                            <Progress theme="info" size="xs" value={percent} />
                        </div>
                    </Tooltip>
                );
            })}
        </Flex>
    );
};
