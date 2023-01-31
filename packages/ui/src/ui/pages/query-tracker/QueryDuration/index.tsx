import {Label} from '@gravity-ui/uikit';
import React, {useEffect, useState} from 'react';
import {QueryItem} from '../module/api';
import {queryDuration} from '../utils/date';

export type QueryDurationProps = {
    query: QueryItem;
    className?: string;
};

const useQueryDuration = (query: QueryItem) => {
    const [duration, setDuration] = useState(queryDuration(query));
    useEffect(() => {
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
    return <Label className={className}>{useQueryDuration(query)}</Label>;
});
