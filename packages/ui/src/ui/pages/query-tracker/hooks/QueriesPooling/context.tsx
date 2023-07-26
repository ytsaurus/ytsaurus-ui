import React, {createContext, useMemo} from 'react';
import {QueriesPollingService} from './QueriesPolling';
import {requestQueries} from '../../module/api';
import {useThunkDispatch} from '../../../../store/thunkDispatch';

export const QueriesPoolingContext = createContext<QueriesPollingService>(
    new QueriesPollingService(() => Promise.resolve([])),
);

type QueriesPoolingProps = {
    children?: React.ReactNode;
};

export const QueriesPooling = ({children}: QueriesPoolingProps) => {
    const dispatch = useThunkDispatch();
    const requestQueryList = (items: string[]) => dispatch(requestQueries(items));
    const poolingService = useMemo(() => new QueriesPollingService(requestQueryList), []);
    return (
        <QueriesPoolingContext.Provider value={poolingService}>
            {children}
        </QueriesPoolingContext.Provider>
    );
};
