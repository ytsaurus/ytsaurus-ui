type QueryFn =         (
            arg: QueryArg & {cluster: string},
            api: BaseQueryApi,
            extraOptions: BaseQueryExtraOptions<BaseQuery>,
            baseQuery: (arg: Parameters<BaseQuery>[0]) => ReturnType<BaseQuery>,
        ) => MaybePromise<
            QueryReturnValue<ResultType, BaseQueryError<BaseQuery>, BaseQueryMeta<BaseQuery>>
        >;

export function createYTQueryFn(fn: ) {

}
