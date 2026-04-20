import {
    type YTError,
    type YTErrorBlockTabs,
    type YTErrorKnownAttributes,
} from '@ytsaurus/components';
import {type AnnotateWithTypes} from '../shared/yt-types';

export type {YTError, YTErrorKnownAttributes, YTErrorBlockTabs};

// eslint-disable-next-line @typescript-eslint/naming-convention
export type FIX_MY_TYPE = any;

export type YTErrorAnnotated<AttributesT extends {attributes?: object}> = {
    [K in keyof YTError<AttributesT>]: K extends 'yt_javascript_wrapper'
        ? YTError[K]
        : K extends 'inner_errors'
          ? Array<YTError<AttributesT> | YTErrorAnnotated<AttributesT>>
          : YTError<AttributesT>[K] | AnnotateWithTypes<YTError<AttributesT>[K]>;
};

export type YTErrorRaw<
    AttributesT extends {attributes?: object} = {attributes?: YTErrorKnownAttributes},
> = YTError<AttributesT> | YTErrorAnnotated<AttributesT>;

export type ValueOf<T> = T[keyof T];

export type PromiseOrValue<T> = Promise<T> | T;

export interface RemoteCopyParams {
    cluster_name: string;
    input_table_paths: Array<string>;
    dstCluster: string;
    output_table_path: string;
    copy_attributes: boolean;
    schema_inference_mode: 'auto' | 'from_input' | 'from_output';
    pool: string;
    override?: boolean;
}

export type Pick2<
    T extends object,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    /** R new type for T[K1][K2], do not provide it to infer corresponding types from T */
    R = never,
> = {
    [L1 in K1]: T[L1] extends object
        ? {[L2 in K2]: R extends never ? T[L1][L2] : R}
        : R extends never
          ? T[L1]
          : R;
};

export type KeysByType<T, V> = Exclude<
    {[K in keyof T]: T[K] extends V ? K : never}[keyof T],
    undefined
>;
