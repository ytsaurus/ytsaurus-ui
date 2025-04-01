/* eslint-disable @typescript-eslint/no-explicit-any */
import {TypedUseQueryStateOptions} from '@reduxjs/toolkit/dist/query/react';

import {
    BaseQueryFn,
    MutationDefinition,
    MutationResultSelectorResult,
    SubscriptionOptions,
} from '@reduxjs/toolkit/query';

/**
 * MOTIVATION:
 * We need to redefine some types from RTK Query internally since they're not exported,
 * but are required to create type-safe custom hooks that work with the library's functionality.
 * This allows our custom hooks to accept the same options and return the same result types as
 * the original RTK Query hooks.
 */

// Types for useQuery hook

/**
 * Subscription options for the useQuery hook.
 * Reconstructed from RTK Query's internal types.
 *
 * @see https://github.com/reduxjs/redux-toolkit/blob/d624fa3cdd31716551cced161fe424dd5c7bf988/packages/toolkit/src/query/react/buildHooks.ts#L164
 */
type UseQuerySubscriptionOptions = SubscriptionOptions & {
    skip?: boolean;
    refetchOnMountOrArgChange?: boolean | number;
};

/**
 * Combined options for the useQuery hook.
 * This type represents all possible options that can be passed to a useQuery hook.
 */
export type UseQueryOptions<
    Result extends Record<string, any>,
    Args,
> = UseQuerySubscriptionOptions & TypedUseQueryStateOptions<Result, Args, BaseQueryFn>;

// Types for useMutation hook

type AnyMutationDefinition = MutationDefinition<any, any, any, any, any>;

/**
 * Options for the useMutation hook.
 * This type represents all possible options that can be passed to a useMutation hook.
 */
export type MutationOptions<
    Result extends Record<string, any>,
    Definition extends AnyMutationDefinition,
> = {
    selectFromResult?: (state: MutationResultSelectorResult<Definition>) => Result;
    fixedCacheKey?: string;
};
