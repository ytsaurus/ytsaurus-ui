import { GetStoreFn } from "../types";
import { AnyApi } from "./buildCreateApi";

type BuildUseQueryHookOptions = {
    api: AnyApi;
    endpointName: string;
    getStore: GetStoreFn;
    buildPrefetchKey: PrefetchKeyBuilder;
};


export function buildUseQueryHook({
    api,
    endpointName,
    getStore,
    buildPrefetchKey,
}: BuildUseQueryHookOptions) {

}
