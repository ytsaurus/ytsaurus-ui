import {YTError} from '../../../../types';
import {ApiMethodParams, YTApiSetup} from '../../../../rum/rum-wrap-api';

export type YTEndpointApiArgs<CommandParameters> = ClusterOrSetup &
    Omit<ApiMethodParams<CommandParameters>, 'setup'>;

export type ClusterOrSetup =
    // cluster or setup param should be required for the case of selection
    {cluster?: string} | {setup: Omit<YTApiSetup, 'proxy'> & Pick<Required<YTApiSetup>, 'proxy'>};

export type OverrideDataType<T extends {data?: unknown}, Data> = Omit<T, 'data' | 'error'> & {
    data?: Data;
    error?: YTError;
};
