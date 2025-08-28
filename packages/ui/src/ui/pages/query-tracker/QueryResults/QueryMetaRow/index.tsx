import React, {useCallback, useMemo} from 'react';
import block from 'bem-cn-lite';
import {Button, Icon, Text} from '@gravity-ui/uikit';
import {useDispatch} from 'react-redux';
import format from '../../../../common/hammer/format';
import {QueryItem} from '../../module/api';
import {QueryDuration} from '../../QueryDuration';
import stopIcon from '../../../../assets/img/svg/icons/stop-circle.svg';

import {QueryStatusView} from '../../../../components/QueryStatus';

import './index.scss';
import {isAbortable} from '../../utils/query';
import {abortCurrentQuery} from '../../module/query/actions';

const b = block('query-meta-info');

export const QueryMetaInfo = React.memo(function QueryMetaInfo({
    query,
    className,
}: {
    query: QueryItem;
    className: string;
}) {
    const isQueryExecuting = useMemo(() => {
        return query && isAbortable(query);
    }, [query]);
    const dispatch = useDispatch();

    const abortQuery = useCallback(() => {
        dispatch(abortCurrentQuery());
    }, [dispatch]);

    return (
        <div className={b(null, className)}>
            <QueryStatusView className={b('item')} mode="both" status={query.state} />
            <QueryDuration query={query} className={b('item', b('duration'))} />
            <Text className={b('item', b('start-time'))}>
                {format['DateTime'](query.start_time, {format: 'short'})}
            </Text>
            <Text className={b('item')} color={'secondary'}>
                by {query.user}
            </Text>

            {isQueryExecuting && (
                <Button size="s" onClick={abortQuery}>
                    <Icon data={stopIcon} />
                    Stop
                </Button>
            )}
        </div>
    );
});
