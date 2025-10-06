import React, {FC, useEffect} from 'react';
import {QueryItem} from '../../../types/query-tracker/api';
import {useDispatch} from 'react-redux';
import {loadQueryResult} from '../../../store/actions/query-tracker/queryResult';
import {QueryResultsView} from '../QueryResultsView';

type Props = {
    query: QueryItem;
    activeResultParams?: {queryId: string; resultIndex: number};
};

export const QueryResultContainer: FC<Props> = ({query, activeResultParams}) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (activeResultParams) {
            dispatch(loadQueryResult(activeResultParams.queryId, activeResultParams.resultIndex));
        }
    }, [activeResultParams, dispatch]);

    return <QueryResultsView query={query} index={activeResultParams?.resultIndex || 0} />;
};
