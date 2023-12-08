// eslint-disable-next-line @typescript-eslint/naming-convention
export type FIX_MY_TYPE = any;

export interface YTError {
    message: string;
    code?: number;
    attributes?: any;
    inner_errors?: YTError[];
}

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
