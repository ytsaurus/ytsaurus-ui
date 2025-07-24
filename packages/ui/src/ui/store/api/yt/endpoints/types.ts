import {YTError} from '../../../../types';
import {ApiMethodParams} from '../../../../rum/rum-wrap-api';

export type YTEndpointApiArgs<CommandParameters> = ClusterOrSetup<CommandParameters> &
    Omit<ApiMethodParams<CommandParameters>, 'setup'>;

export type ClusterOrSetup<CommandParameters> =
    // cluster or setup param should be required for the case of selection
    {cluster: string} | Required<Pick<ApiMethodParams<CommandParameters>, 'setup'>>;

export type OverrideDataType<T extends {data?: unknown}, Data> = Omit<T, 'data' | 'error'> & {
    data?: Data;
    error?: YTError;
};
