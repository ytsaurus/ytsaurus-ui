import axios, {CancelToken} from 'axios';
import {wrapApiPromiseByToaster} from './utils';
import {YTError} from '../../@types/types';
import {OptionsGroup} from '../components/Dialog/df-dialog-utils';

export type WithResult<T> = {result: T};

export type StrawberryListAttributes = keyof Required<StrawberryListResponseItem>['$attributes'];

export type StrawberryDescribeOptionsType = Array<OptionsGroup>;

export type StrawberryApi =
    | {
          action: 'list';
          params: {attributes?: Array<StrawberryListAttributes>};
          response: StrawberryListResponse;
      }
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
              options_to_set: Partial<StrawberryListResponseItem['$attributes']>;
              options_to_remove: Array<StrawberryListAttributes>;
          };
          response: void;
      }
    | {
          action: 'describe_options';
          params: {alias: string};
          response: WithResult<StrawberryDescribeOptionsType>;
      }
    | {action: 'get_speclet'; params: {alias: string}; response: WithResult<unknown>}
    | {
          action: 'get_brief_info';
          params: {alias: string};
          response: WithResult<StrawberryStatusResponse>;
      };

export type StrawberryStatusResponse = {
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
    state?: StrawberryCliqueStateType;
    health?: StrawberryCliqueHealthType;
    health_reason?: unknown;
    incarnation_index?: number;
    creator?: string;
    speclet_modification_time?: string;
    strawberry_state_modification_time?: string;
    stage?: string;

    pool?: string;
    error?: YTError;
};

export type StrawberryListResponse = WithResult<Array<StrawberryListResponseItem>>;

export type StrawberryListResponseItem = {
    $value: string;
    $attributes?: {
        pool?: string;
        creator?: string;
        creation_time?: string;
        health?: StrawberryCliqueHealthType;
        health_reason?: string;
        instance_count?: number;
        speclet_modification_time?: string;
        stage?: string;
        state?: StrawberryCliqueStateType;
        strawberry_state_modification_time?: string;
        total_cpu?: number;
        total_memory?: number;
        yt_operation_id?: string;
        yt_operation_finish_time?: string;
        yt_operation_start_time?: string;
    };
};

export type StrawberryCliqueHealthType = 'good' | 'pending' | 'failed';
export type StrawberryCliqueStateType = 'active' | 'inactive' | 'untracked';

type StrawberryApiType = <
    T extends StrawberryApi['action'] = never,
    ApiItem extends StrawberryApi & {action: T} = StrawberryApi & {action: T},
>(
    action: T,
    cluster: string,
    params: ApiItem['params'],
    props: {
        cancelToken?: CancelToken;
        skipErrorToast?: boolean;
        successTitle?: string;
        isAdmin?: boolean;
    },
) => Promise<ApiItem['response']>;

const strawberryApi: StrawberryApiType = (
    action,
    cluster,
    params,
    {cancelToken, skipErrorToast, successTitle, isAdmin} = {},
) => {
    const query = isAdmin ? '?isDeveloper=true' : '';
    return wrapApiPromiseByToaster(
        axios.request({
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
};

export const chytApiAction: StrawberryApiType = (action, cluster, params, props) => {
    return strawberryApi(action, cluster, params, props);
};
