// // import {TypedUseQuerySubscriptionResult} from '@reduxjs/toolkit/query/react';
// import {
//     TypedLazyQueryTrigger,
//     TypedUseMutation,
//     TypedUseQueryStateOptions,
//     TypedUseQueryStateResult,
//     TypedUseQuerySubscriptionResult,
//     reactHooksModule,
// } from '@reduxjs/toolkit/query/react';
// import {
//     Api,
//     ApiEndpointQuery,
//     ApiModules,
//     BaseQueryApi,
//     BaseQueryError,
//     BaseQueryExtraOptions,
//     BaseQueryFn,
//     BaseQueryMeta,
//     CoreModule,
//     EndpointDefinition,
//     EndpointDefinitions,
//     Module,
//     MutationDefinition,
//     QueryActionCreatorResult,
//     QueryArgFrom,
//     QueryDefinition,
//     QueryReturnValue,
//     SkipToken,
//     SubscriptionOptions,
//     buildCreateApi,
//     coreModule,
// } from '@reduxjs/toolkit/query';
// import {EndpointUtils, buildEndpointUtils} from './utils/buildEndpointUtils';
// import {isQueryDefinition} from './utils/utils';
// import {Store} from '@reduxjs/toolkit';
// import {buildHookName} from './utils/buildHookName';

// const YTModuleName = Symbol();
// type YTApiModule = typeof YTModuleName;

// export type AnyQueryDefinition = QueryDefinition<{cluster: string}, any, any, any, any>;
// export type AnyMutationDefinition = MutationDefinition<any, any, any, any, any>;
// export type AnyEndpointDefinition = EndpointDefinition<any, any, any, any, any>;

// type FilterQueries<Key, Definitions extends EndpointDefinitions> = Key extends keyof Definitions
//     ? Definitions[Key] extends AnyQueryDefinition
//         ? Key
//         : never
//     : never;

// type FilterMutations<
//     Key extends string,
//     Definitions extends EndpointDefinitions,
// > = Key extends keyof Definitions
//     ? Definitions[Key] extends AnyMutationDefinition
//         ? Key
//         : never
//     : never;

// export interface UseQuerySubscriptionOptions extends SubscriptionOptions {
//     skip?: boolean;
//     refetchOnMountOrArgChange?: boolean | number;
// }

// export type UseQuerySubscriptionResult<D extends QueryDefinition<any, any, any, any>> = Pick<
//     QueryActionCreatorResult<D>,
//     'refetch'
// >;

// type QueryArgs<D extends QueryDefinition<any, any, any, any>> = QueryArgFrom<D & {cluster: string}>;

// export type UseQueryStateDefaultResult<Definition extends AnyQueryDefinition> =
//     TypedUseQueryStateResult<any, QueryArgFrom<Definition>, BaseQueryFn>;

// export type UseQueryStateDefaultResultWitoutIsLoading<Definition extends AnyQueryDefinition> = Omit<
//     UseQueryStateDefaultResult<Definition>,
//     'isLoading'
// >;

// export type EndpointQueryHook<
//     Definition extends AnyQueryDefinition,
//     BaseQuery extends BaseQueryFn,
// > = {
//     useQuery: {
//         <
//             Result extends Record<
//                 string,
//                 any
//             > = UseQueryStateDefaultResultWitoutIsLoading<Definition>,
//         >(
//             arg: QueryArgs<Definition> | SkipToken,
//             options?: UseQuerySubscriptionOptions &
//                 TypedUseQueryStateOptions<Result, Definition, BaseQuery>,
//         ): TypedUseQueryStateResult<Result, QueryArgs<Definition>, BaseQuery> &
//             TypedUseQuerySubscriptionResult<Result, QueryArgs<Definition>, BaseQuery>;
//     };
// };

// export type EndpointsRootQueryHooks<
//     Definitions extends EndpointDefinitions,
//     BaseQuery extends BaseQueryFn,
// > = {
//     [Key in FilterQueries<
//         keyof Definitions & string,
//         Definitions
//     > as `use${Capitalize<Key>}Query`]: Definitions[Key] extends AnyQueryDefinition
//         ? EndpointQueryHook<Definitions[Key], BaseQuery>['useQuery']
//         : never;
// };

// /**
//  * https://github.com/reduxjs/redux-toolkit/blob/98cdfb2bd2008f599b287ebc0a4b90694727282f/packages/toolkit/src/query/react/buildHooks.ts#L249C1-L253C2
//  */
// export type UseLazyQueryLastPromiseInfo<D extends QueryDefinition<any, any, any, any>> = {
//     lastArg: QueryArgFrom<D>;
// };

// /**
//  * Тип хука `useLazyQuery`.
//  * Дублирует тип из RTKQ, чтобы дополнить возвращаемое значение нужными полями.
//  */
// export type EndpointLazyQueryHook<
//     Definition extends AnyQueryDefinition,
//     BaseQuery extends BaseQueryFn,
// > = {
//     useLazyQuery: <Result extends Record<string, any> = UseQueryStateDefaultResult<Definition>>(
//         options?: SubscriptionOptions &
//             Omit<TypedUseQueryStateOptions<Result, QueryArgs<Definition>, BaseQuery>, 'skip'>,
//     ) => [
//         TypedLazyQueryTrigger<Result, QueryArgFrom<Definition & {cluster: string}>, BaseQuery>,
//         TypedUseQueryStateResult<Result, QueryArgFrom<Definition & {cluster: string}>, BaseQuery>,
//         UseLazyQueryLastPromiseInfo<Definition>,
//     ];
// };

// /** Тип всех useLazyQuery хуков, доступных в корне API (с корректными названиями) */
// export type EndpointsRootLazyQueryHooks<
//     Definitions extends EndpointDefinitions,
//     BaseQuery extends BaseQueryFn,
// > = {
//     [Key in FilterQueries<
//         keyof Definitions & string,
//         Definitions
//     > as `useLazy${Capitalize<Key>}Query`]: Definitions[Key] extends AnyQueryDefinition
//         ? EndpointLazyQueryHook<Definitions[Key], BaseQuery>['useLazyQuery']
//         : never;
// };

// /** Тип всех useMutation хуков, доступных в корне API (с корректными названиями) */
// export type EndpointsRootMutationHooks<
//     Definitions extends EndpointDefinitions,
//     BaseQuery extends BaseQueryFn,
// > = {
//     [Key in FilterMutations<
//         keyof Definitions & string,
//         Definitions
//     > as `use${Capitalize<Key>}Mutation`]: Definitions[Key] extends AnyMutationDefinition
//         ? TypedUseMutation<Record<string, any>, Definitions[Key], BaseQuery>
//         : never;
// };

// export type EndpointsRootHooks<
//     Definitions extends EndpointDefinitions,
//     BaseQuery extends BaseQueryFn,
// > = EndpointsRootQueryHooks<Definitions, BaseQuery> &
//     EndpointsRootLazyQueryHooks<Definitions, BaseQuery> &
//     EndpointsRootMutationHooks<Definitions, BaseQuery>;

// export type MaybePromise<T> = T | PromiseLike<T>;

// export type EndpointDefinitionWithQueryFn<QueryArg, BaseQuery extends BaseQueryFn, ResultType> = {
//     queryFn(
//         arg: QueryArg,
//         api: BaseQueryApi,
//         extraOptions: BaseQueryExtraOptions<BaseQuery>,
//         baseQuery: (arg: Parameters<BaseQuery>[0]) => ReturnType<BaseQuery>,
//     ): MaybePromise<
//         QueryReturnValue<ResultType, BaseQueryError<BaseQuery>, BaseQueryMeta<BaseQuery>>
//     >;
//     query?: never;
//     transformResponse?: never;
//     transformErrorResponse?: never;
//     rawResponseSchema?: never;
//     rawErrorResponseSchema?: never;
// };

// export type QueryEndpointMethodsAndHooks<
//     Definition extends AnyQueryDefinition,
//     BaseQuery extends BaseQueryFn,
// > = EndpointDefinitionWithQueryFn<QueryArgs<Definition>, BaseQuery, Record<string, any>>;
// // EndpointQueryFn<Definition> &
// //     EndpointPrefetch<Definition> &
// //     EndpointSubscribe<Definition> &
// //     EndpointQueryHook<Definition> &
// //     EndpointLazyQueryHook<Definition> &
// //     EndpointQueryStateHook<Definition> &
// //     QueryEndpointCachedValues<Definition> &
// //     EndpointCreateDataProvider<Definition> &
// //     EndpointUtils<Definition>;

// export type EndpointsMethodsAndHooks<Definitions extends EndpointDefinitions> = {
//     [K in keyof Definitions]: QueryEndpointMethodsAndHooks<Definitions[K], BaseQueryFn>;
// };

// type ThunkMiddlewareDispatchExtension = ThunkDispatch<any, any, Action>;

// export type ModuleStoreDispatchExtension = ThunkMiddlewareDispatchExtension;

// export type StoreSubscribeListener = () => void;

// type StoreUnusbscribeFn = () => void;

// // Интерфейс функции подписки на изменения в модульном сторе.
// type StoreSubscribeBatchedFn = (listener: StoreSubscribeListener) => StoreUnusbscribeFn;

// export type ModuleStore = Store & {
//     moduleName: string;
//     dispatch: ModuleStoreDispatchExtension;
//     subscribeBatched: StoreSubscribeBatchedFn;
// };

// export type GetStoreFn = () => ModuleStore;

// export type UseQueryHookResult<
//     D extends QueryDefinition<any, any, any, any>,
//     R = UseQueryStateDefaultResult<D>,
// > = TypedUseQueryStateResult<Record<string, any>, D, R> & UseQuerySubscriptionResult<D>;

// export type UseQuery<D extends QueryDefinition<any, any, any, any>> = <
//     R extends Record<string, any> = UseQueryStateDefaultResult<D>,
//     BaseQuery extends BaseQueryFn = BaseQueryFn,
// >(
//     arg: QueryArgs<D> | SkipToken,
//     options?: UseQuerySubscriptionOptions & TypedUseQueryStateOptions<R, QueryArgs<D>, BaseQuery>,
// ) => UseQueryHookResult<D, R>;

// export type TypedUseQuery<ResultType, QueryArg, BaseQuery extends BaseQueryFn> = UseQuery<
//     QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>
// >;

// export type UseLazyQuery<D extends QueryDefinition<any, any, any, any>> = <
//     R extends Record<string, any> = UseQueryStateDefaultResult<D>,
//     BQ extends BaseQueryFn = BaseQueryFn,
// >(
//     options?: SubscriptionOptions & Omit<TypedUseQueryStateOptions<R, QueryArgs<D>, BQ>, 'skip'>,
// ) => [
//     TypedLazyQueryTrigger<R, QueryArgs<D>, BQ>,
//     UseLazyQueryStateResult<D, R>,
//     UseLazyQueryLastPromiseInfo<D>,
// ];

// export type TypedUseLazyQuery<ResultType, QueryArg, BaseQuery extends BaseQueryFn> = UseLazyQuery<
//     QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>
// >;

// export type UseLazyQueryStateResult<
//     D extends QueryDefinition<any, any, any, any>,
//     R = UseQueryStateDefaultResult<D>,
//     BQ extends BaseQueryFn = BaseQueryFn,
// > = TypedUseQueryStateResult<R, QueryArgs<D>, BQ> & {
//     /**
//      * Resets the hook state to its initial `uninitialized` state.
//      * This will also remove the last result from the cache.
//      */
//     reset: () => void;
// };

// export type QueryHooks<Definition extends QueryDefinition<any, any, any, any, any>> = {
//     useQuery: TypedUseQuery<Record<string, any>, QueryArgs<Definition>, BaseQueryFn>;
//     useLazyQuery: UseLazyQuery<Definition>;
//     // useQuerySubscription: UseQuerySubscription<Definition>;
//     // useLazyQuerySubscription: UseLazyQuerySubscription<Definition>;
//     // useQueryState: UseQueryState<Definition>;
// };

// export type InfiniteQueryHooks<
//     Definition extends InfiniteQueryDefinition<any, any, any, any, any>,
// > = {
//     useInfiniteQuery: UseInfiniteQuery<Definition>;
//     useInfiniteQuerySubscription: UseInfiniteQuerySubscription<Definition>;
//     useInfiniteQueryState: UseInfiniteQueryState<Definition>;
// };

// export type MutationHooks<Definition extends MutationDefinition<any, any, any, any, any>> = {
//     useMutation: UseMutation<Definition>;
// };

// declare module '@reduxjs/toolkit/query' {
//     export type EndpointDefinitionWithQueryFn<
//         QueryArg extends {cluster: string},
//         BaseQuery extends BaseQueryFn,
//         ResultType,
//     > = {
        // queryFn(
        //     arg: QueryArg & {cluster: string},
        //     api: BaseQueryApi,
        //     extraOptions: BaseQueryExtraOptions<BaseQuery>,
        //     baseQuery: (arg: Parameters<BaseQuery>[0]) => ReturnType<BaseQuery>,
        // ): MaybePromise<
        //     QueryReturnValue<ResultType, BaseQueryError<BaseQuery>, BaseQueryMeta<BaseQuery>>
        // >;
//         query?: never;
//         transformResponse?: never;
//         transformErrorResponse?: never;
//         rawResponseSchema?: never;
//         rawErrorResponseSchema?: never;
//     };
// }

//     // interface ApiModules<
//     //     // eslint-disable-next-line @typescript-eslint/no-unused-vars -- DIRECT-239681
//     //     BaseQuery extends BaseQueryFn,
//     //     Definitions extends EndpointDefinitions,
//     //     // eslint-disable-next-line @typescript-eslint/no-unused-vars -- DIRECT-239681
//     //     ReducerPath extends string,
//     //     // eslint-disable-next-line @typescript-eslint/no-unused-vars -- DIRECT-239681
//     //     TagTypes extends string,
//     // > {
//     //     [YTModuleName]: EndpointsRootHooks<Definitions, BaseQuery> & {
//     //         endpoints: EndpointsMethodsAndHooks<Definitions>;
//     //     };
//     // }

// // export const ytModule = ({getStore}: {getStore: GetStoreFn}): Module<YTApiModule> => ({
// //     name: YTModuleName,
// //     init(api, options, context) {
// //         // initialize stuff here if you need to
// //         const anyApi = api as any as Api<
// //             any,
// //             Record<string, any>,
// //             string,
// //             string,
// //             YTApiModule | CoreModule
// //         >;
// //         return {
// //             injectEndpoint(endpoint, definition) {
// //                 if (isQueryDefinition(definition)) {
// //                     const anyEndpoint = anyApi.endpoints[endpoint] as ApiEndpointQuery<any, any> &
// //                         QueryHooks<any> &
// //                         EndpointQuery<any> &
// //                         // EndpointPrefetch<any> &
// //                         // EndpointSubscribe<any> &
// //                         EndpointUtils<any>;
// //                     const hookName = buildHookName(endpoint);
// //                     anyApi[hookName] = anyEndpoint.useQuery;
// //                     const {updateQueryData, upsertQueryData, patchQueryData} = buildEndpointUtils({
// //                         api: anyApi,
// //                         endpoint,
// //                         getStore,
// //                     });
// //                     anyEndpoint.updateQueryData = updateQueryData;
// //                     anyEndpoint.upsertQueryData = upsertQueryData;
// //                     anyEndpoint.patchQueryData = patchQueryData;
// //                 } else {
// //                 }
// //             },
// //         };
// //     },
// // });

// // export const ytCreateApi = buildCreateApi(
// //     coreModule(),
// //     ytModule({getStore: () => (window as any).store}),
// // );
