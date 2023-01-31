import React, {createContext, useMemo} from 'react';
import {QueriesPollingService} from './QueriesPolling';

export const QueriesPoolingContext = createContext<QueriesPollingService>(
    new QueriesPollingService(),
);

type QueriesPoolingProps = {
    children?: React.ReactNode;
};

export const QueriesPooling = ({children}: QueriesPoolingProps) => {
    const poolingService = useMemo(() => new QueriesPollingService(), []);
    return (
        <QueriesPoolingContext.Provider value={poolingService}>
            {children}
        </QueriesPoolingContext.Provider>
    );
};
