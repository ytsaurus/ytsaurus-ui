import {BaseQueryFn, createApi} from '@reduxjs/toolkit/query/react';

export enum TagTypes {
    NAVIGATION = 'Navigation',
    YT = 'YT',
}

export const tagTypes = [TagTypes.NAVIGATION, TagTypes.YT];

const baseQuery: BaseQueryFn = () => {
    return {data: undefined};
};

const endpoints = () => ({});

export const ytApi = createApi({
    baseQuery,
    endpoints,
    tagTypes,
});
