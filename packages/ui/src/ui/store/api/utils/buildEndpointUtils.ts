import type {Patch} from 'immer';
import type {Draft} from '@reduxjs/toolkit';
// import type {PatchCollection, QueryArgFrom, Recipe, ResultTypeFrom} from '@reduxjs/toolkit';

import type {AnyQueryDefinition, GetStoreFn} from '../types';
import {QueryArgFrom, ResultTypeFrom} from '@reduxjs/toolkit/query';
import {AnyApi} from './buildCreateApi';

export type MaybeDrafted<T> = T | Draft<T>;
export type Recipe<T> = (data: MaybeDrafted<T>) => void | MaybeDrafted<T>;

export type PatchCollection = {
    /**
     * An `immer` Patch describing the cache update.
     */
    patches: Patch[];
    /**
     * An `immer` Patch to revert the cache update.
     */
    inversePatches: Patch[];
    /**
     * A function that will undo the cache update.
     */
    undo: () => void;
};

// Набор методов для работы с кешом эндпоинта
export type EndpointUtils<Definition extends AnyQueryDefinition> = {
    updateQueryData: (
        queryArgs: QueryArgFrom<Definition>,
        recipe: Recipe<ResultTypeFrom<Definition>>,
    ) => PatchCollection;
    upsertQueryData: (
        queryArgs: QueryArgFrom<Definition>,
        data: ResultTypeFrom<Definition>,
    ) => Promise<unknown>;
    patchQueryData: (queryArgs: QueryArgFrom<Definition>, patches: readonly Patch[]) => void;
};

type BuildEndpointUtilsOptions = {
    api: AnyApi;
    endpointName: string;
    getStore: GetStoreFn;
};

export function buildEndpointUtils({
    api,
    endpointName,
    getStore,
}: BuildEndpointUtilsOptions): EndpointUtils<AnyQueryDefinition> {
    return {
        updateQueryData: (queryArgs, recipe) =>
            getStore().dispatch(api.util.updateQueryData(endpointName, queryArgs, recipe)),
        upsertQueryData: (queryArgs, data) =>
            getStore().dispatch(api.util.upsertQueryData(endpointName, queryArgs, data)),
        patchQueryData: (queryArgs, patches) =>
            getStore().dispatch(api.util.patchQueryData(endpointName, queryArgs, patches)),
    };
}
