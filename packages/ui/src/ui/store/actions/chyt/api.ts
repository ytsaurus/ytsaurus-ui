import axios, {CancelToken} from 'axios';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {YTError} from '../../../../@types/types';

export type WithResult<T> = {result: T};

type ChytListAttributes =
    | 'creator'
    | 'state'
    | 'yt_operation_id'
    | 'instance_count'
    | 'total_memory'
    | 'total_cpu'
    | 'creation_time'
    | 'speclet_modification_time'
    | 'strawberry_state_modification_time'
    | 'stage'
    | 'health'
    | 'yt_operation_start_time'
    | 'yt_operation_finish_time';

export type ChytApi =
    | {action: 'list'; params: {attributes?: Array<ChytListAttributes>}; response: ChytListResponse}
    | {action: 'start'; params: {alias: string}; response: void}
    | {action: 'stop'; params: {alias: string}; response: void}
    | {action: 'remove'; params: {alias: string}; response: void}
    | {
          action: 'create';
          params: {
              alias: string;
              speclet_options: {
                  active: boolean;
                  pool: string;
                  instance_count: number;
              };
          };
          response: void;
      }
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
    | {action: 'get_brief_info'; params: {alias: string}; response: WithResult<ChytStatusResponse>};

export type ChytStatusResponse = {
    yt_operation: {
        start_time?: string;
        finish_time?: string;
        operation_id?: string;
        state?: string;
    };
    state?: ChytCliqueStateType;
    pool?: string;
    stage?: string;
    status?: string;
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
        health?: ChytCliqueHealthType;
        total_cpu?: number;
        total_memory?: number;
        yt_operation_id?: string;
        creation_time?: string;
    };
};

export type ChytCliqueHealthType = 'good' | 'pending' | 'failed';
export type ChytCliqueStateType = 'active' | 'inactive' | 'untracked';

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
    const query = isAdmin ? '?isDeveloper=true' : '';
    return wrapApiPromiseByToaster(
        axios.request<ApiItem['response']>({
            method: 'POST',
            url: `/api/chyt/${cluster}/${action}${query}`,
            data: {
                params: {...params},
            },
            cancelToken,
        }),
        {
            toasterName: `clique-${action}`,
            skipSuccessToast: !successTitle,
            successTitle,
            skipErrorToast,
            errorTitle: `'${action}' action failed`,
        },
    ).then((response) => {
        return response.data;
    });
}
