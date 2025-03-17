import {BaseQueryFn, createApi} from '@reduxjs/toolkit/query/react';
import {YTApiId} from '../../rum/rum-wrap-api';

const tagTypes = Object.keys(YTApiId);

const baseQuery: BaseQueryFn = () => {
    return {data: undefined};
};

const endpoints = () => ({});

export const rootApi = createApi({
    baseQuery,
    endpoints,
    tagTypes,
});
