import axios, {CancelToken} from 'axios';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {YTError} from '../../../../@types/types';

export type WithResult<T> = {result: T};

export type ChytListAttributes = keyof Required<ChytListResponseItem>['$attributes'];

export type ChytApi =
    | {action: 'list'; params: {attributes?: Array<ChytListAttributes>}; response: ChytListResponse}
    | {action: 'start'; params: {alias: string; untracked?: boolean}; response: void}
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
        creation_time?: string;
        health?: ChytCliqueHealthType;
        instance_count?: number;
        speclet_modification_time?: string;
        stage?: string;
        state?: ChytCliqueStateType;
        strawberry_state_modification_time?: string;
        total_cpu?: number;
        total_memory?: number;
        yt_operation_id?: string;
        yt_operation_finish_time?: string;
        yt_operation_start_time?: string;
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
    | (ChytCliqueOption<'string', string> & {choices?: Array<string>})
    | ChytCliqueOption<'bool', boolean>
    | (ChytCliqueOption<'uint64' | 'int64' | 'byte_count', number> & {
          max_value?: number;
          min_value?: number;
      })
    | ChytCliqueOption<'yson', JsonAsString>
    | ChytCliqueOption<'path' | 'pool', string>;

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
