import axios, {CancelToken} from 'axios';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {YTError} from '../../../../@types/types';

export type WithResult<T> = {result: T};

type CliqueAttributes =
    | 'creator'
    | 'state'
    | 'start_time'
    | 'instance_count'
    | 'total_memory'
    | 'total_cpu'
    | 'operation_id'
    | 'creation_time';

export type ChytApi =
    | {action: 'list'; params: {attributes?: Array<CliqueAttributes>}; response: ChytListResponse}
    | {action: 'start'; params: {alias: string}; response: void}
    | {action: 'stop'; params: {alias: string}; response: void}
    | {action: 'remove'; params: {alias: string}; response: void}
    | {action: 'create'; params: {alias: string}; response: void}
    | {
          action: 'set_options';
          params: {
              alias: string;
              options: Record<string, unknown>;
          };
          response: void;
      }
    | {
          action: 'describe_options';
          params: {alias: string};
          response: WithResult<Array<ChytCliqueOptionsGroup>>;
      }
    | {action: 'status'; params: {alias: string}; response: WithResult<ChytStatusResponse>};

export type ChytStatusResponse = {
    yt_operation_state?: 'running';
    state?: ChytCliqueStateType;
    pool?: string;
    stage?: string;
    start_time?: string;
    finish_time?: string;
    incarnation_index?: number;
    ctl_attributes: {
        instance_count?: number;
        total_cpu?: number;
        total_memory?: number;
    };
    operation_id?: string;
    error?: YTError;
};

export type ChytListResponse = WithResult<Array<ChytListResponseItem>>;

export type ChytListResponseItem = {
    $value: string;
    $attributes?: {
        creator?: string;
        instance_count?: number;
        start_time?: string;
        state?: ChytCliqueStateType;
        total_cpu?: number;
        total_memory?: number;
        operation_id?: string;
        creation_time?: string;
    };
};

export type ChytCliqueStateType = 'active' | 'broken' | 'inactive';

export type ChytCliqueOptionsGroup = {
    title: string;
    options: Array<ChytCliqueOptionDescription>;
    hidden: boolean;
};

export type ChytCliqueOptionDescription =
    | ChytCliqueOption<'string', string>
    | ChytCliqueOption<'bool', boolean>
    | ChytCliqueOption<'uint64', number>
    | ChytCliqueOption<'yson', JsonAsString>;

export type ChytCliqueOptionType = ChytCliqueOptionDescription['type'];

export type JsonAsString = string;

export type ChytCliqueOption<TypeName extends string, T> = {
    name: string;
    type: TypeName;
    current_value?: T | null;
    default_value?: T;
    description?: string;
};

export function chytApiAction<
    T extends ChytApi['action'] = never,
    ApiItem extends ChytApi & {action: T} = ChytApi & {action: T},
>(
    action: T,
    cluster: string,
    params: ApiItem['params'],
    {
        cancelToken,
        skipErrorToast,
        successTitle,
        isAdmin,
    }: {
        cancelToken?: CancelToken;
        skipErrorToast?: boolean;
        successTitle?: string;
        isAdmin?: boolean;
    } = {},
) {
    const extras = action === 'start' ? {untracked: true} : undefined;
    const query = isAdmin ? '?isDeveloper=true' : '';
    return wrapApiPromiseByToaster(
        axios.request<ApiItem['response']>({
            method: 'POST',
            url: `/api/chyt/${cluster}/${action}${query}`,
            data: {
                params: {...params, ...extras},
            },
            cancelToken,
        }),
        {
            toasterName: `clique-${action}`,
            skipSuccessToast: !successTitle,
            successTitle,
            skipErrorToast,
            errorTitle: `'${action}' action is failed`,
        },
    ).then((response) => {
        return response.data;
    });
}
