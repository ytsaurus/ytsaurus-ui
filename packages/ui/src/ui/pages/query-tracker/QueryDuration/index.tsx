import {Label} from '@gravity-ui/uikit';
import React, {useEffect, useState} from 'react';
import {QueryItem, QueryStatus} from '../module/api';
import {queryDuration} from '../utils/date';
import {isQueryCompleted} from '../utils/query';

export type QueryDurationProps = {
    query: QueryItem;
    className?: string;
};

const useQueryDuration = (query: QueryItem) => {
    const [duration, setDuration] = useState(queryDuration(query));
    useEffect(() => {
        if (query.state === QueryStatus.DRAFT) {
            setDuration(null);
            return;
        }
        if (isQueryCompleted(query)) {
            setDuration(query.finish_time ? queryDuration(query) : '-');
            return;
        }
        setDuration(queryDuration(query));
        if (query.finish_time) {
            return;
        }
        const timer = setInterval(() => setDuration(queryDuration(query)), 1000);
        return () => {
            clearInterval(timer);
        };
    }, [query.id, query.state, query.start_time]);

    return duration;
};

export const QueryDuration = React.memo(function QueryDuration({
    query,
    className,
}: QueryDurationProps) {
    const duration = useQueryDuration(query);
    return duration && <Label className={className}>{duration}</Label>;
});
