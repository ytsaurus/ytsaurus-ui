import {BaseQueryFn, createApi} from '@reduxjs/toolkit/query/react';

export enum TagTypes {
    NAVIGATION = 'Navigation',
}

const baseQuery: BaseQueryFn = () => {
    return {data: undefined};
};

const endpoints = () => ({});

export const ytApi = createApi({
    baseQuery,
    endpoints,
    tagTypes: [TagTypes.NAVIGATION],
});
