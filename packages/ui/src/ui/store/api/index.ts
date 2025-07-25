import {BaseQueryFn, createApi} from '@reduxjs/toolkit/query/react';
import {YTApiIdType} from '../../../shared/constants/yt-api-id';

const tagTypes = [] as Array<YTApiIdType | `${YTApiIdType}_${string}`>;

const baseQuery: BaseQueryFn = () => {
    return {data: undefined};
};

const endpoints = () => ({});

export const rootApi = createApi({
    baseQuery,
    endpoints,
    tagTypes,
});
