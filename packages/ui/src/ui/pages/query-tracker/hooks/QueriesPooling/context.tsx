import React, {createContext, useMemo} from 'react';
import {QueriesPollingService} from './QueriesPolling';
import {requestQueries} from '../../../../store/actions/queries/api';
import {useThunkDispatch} from '../../../../store/thunkDispatch';

export const QueriesPoolingContext = createContext<QueriesPollingService>(
    new QueriesPollingService(() => Promise.resolve([])),
);

type QueriesPoolingProps = {
    children?: React.ReactNode;
};

export const QueriesPooling = ({children}: QueriesPoolingProps) => {
    const dispatch = useThunkDispatch();
    const poolingService = useMemo(() => {
        const requestQueryList = (items: string[]) => dispatch(requestQueries(items));
        return new QueriesPollingService(requestQueryList);
    }, [dispatch]);
    return (
        <QueriesPoolingContext.Provider value={poolingService}>
            {children}
        </QueriesPoolingContext.Provider>
    );
};
