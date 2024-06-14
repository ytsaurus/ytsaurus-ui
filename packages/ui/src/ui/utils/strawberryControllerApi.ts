import axios, {CancelToken} from 'axios';
import {wrapApiPromiseByToaster} from './utils';
import {YTError} from '../../@types/types';
import {OptionsGroup} from '../components/Dialog/df-dialog-utils';

export type WithResult<T> = {result: T};

export type ChytListAttributes = keyof Required<ChytListResponseItem>['$attributes'];

export type ChytDescribeOptionsType = Array<OptionsGroup>;

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
                  pool?: string;
                  instance_count: number;
              };
          };
          response: void;
      }
    | {
          action: 'edit_options';
          params: {
              alias: string;
              options_to_set: Partial<ChytListResponseItem['$attributes']>;
              options_to_remove: Array<ChytListAttributes>;
          };
          response: void;
      }
    | {
          action: 'describe_options';
          params: {alias: string};
          response: WithResult<ChytDescribeOptionsType>;
      }
    | {action: 'get_speclet'; params: {alias: string}; response: WithResult<unknown>}
    | {action: 'get_brief_info'; params: {alias: string}; response: WithResult<ChytStatusResponse>};

export type ChytStatusResponse = {
    ctl_attributes: {
        instance_count?: number;
        total_cpu?: number;
        total_memory?: number;
    };
    yt_operation: {
        id?: string;
        state?: string;
        start_time?: string;
        finish_time?: string;
    };
    state?: ChytCliqueStateType;
    health?: ChytCliqueHealthType;
    health_reason?: unknown;
    incarnation_index?: number;
    creator?: string;
    speclet_modification_time?: string;
    strawberry_state_modification_time?: string;
    stage?: string;

    pool?: string;
    error?: YTError;
};

export type ChytListResponse = WithResult<Array<ChytListResponseItem>>;

export type ChytListResponseItem = {
    $value: string;
    $attributes?: {
        pool?: string;
        creator?: string;
        creation_time?: string;
        health?: ChytCliqueHealthType;
        health_reason?: string;
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
