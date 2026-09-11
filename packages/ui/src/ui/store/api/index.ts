import {type BaseQueryFn, createApi} from '@reduxjs/toolkit/query/react';
import {YTApiId, type YTApiIdType} from '../../../shared/constants/yt-api-id';

const tagTypes = [YTApiId.flowExecute] as Array<YTApiIdType | `${YTApiIdType}_${string}`>;

const baseQuery: BaseQueryFn = () => {
    return {data: undefined};
};

const endpoints = () => ({});

export const rootApi = createApi({
    baseQuery,
    endpoints,
    tagTypes,
});
