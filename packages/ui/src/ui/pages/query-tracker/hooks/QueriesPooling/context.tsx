import React, {createContext, useMemo} from 'react';
import {QueriesPollingService} from './QueriesPolling';
import {requestQueries} from '../../../../store/actions/query-tracker/api';
import {useDispatch} from '../../../../store/redux-hooks';

export const QueriesPoolingContext = createContext<QueriesPollingService>(
    new QueriesPollingService(() => Promise.resolve([])),
);

type QueriesPoolingProps = {
    children?: React.ReactNode;
};

export const QueriesPooling = ({children}: QueriesPoolingProps) => {
    const dispatch = useDispatch();
    const poolingService = useMemo(() => {
        const requestQueryList = (items: string[]) => dispatch(requestQueries(items));
        // @ts-ignore
        return new QueriesPollingService(requestQueryList);
    }, [dispatch]);
    return (
        <QueriesPoolingContext.Provider value={poolingService}>
            {children}
        </QueriesPoolingContext.Provider>
    );
};
