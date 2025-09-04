import React from 'react';
import {AxiosError} from 'axios';
import {WritableDraft} from 'immer';

import forEach_ from 'lodash/forEach';
import get_ from 'lodash/get';
import isEqual_ from 'lodash/isEqual';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';
import set_ from 'lodash/set';

import {getBatchError} from '../../shared/utils/error';

import {TypedKeys, YTError} from '../types';
import {Link, ProgressProps} from '@gravity-ui/uikit';
import {
    ThemeThreshold,
    computeProgress,
    defaultThemeThresholds,
    getProgressTheme,
} from '../utils/progress';
import hammer from '../common/hammer';
import {LOADING_STATUS} from '../constants';
import type {ErrorInfo} from '../store/reducers/modals/errors';
import {showErrorModal} from '../store/actions/modals/errors';
import {LocationParameters} from '../store/location';
import {BatchResultsItem} from '../../shared/yt-types';

import {isCancelled} from './cancel-helper';
import {YTErrors} from '../rum/constants';
import {getWindowStore} from '../store/window-store';
import {toaster} from './toaster';

const COMMANDS_V4_WITH_VALUE: Record<string, boolean> = {
    get: true,
    list: true,
    exists: true,
};

export function extractBatchV4Values<V, T extends {value?: V}>(
    data: {
        results?: Array<BatchResultsItem<T | V>>;
    },
    requests: Array<{command: string}>,
) {
    const {results, ...rest} = data;
    const res = !results
        ? []
        : map_(results, (itemData, index) => {
              const hasValue = COMMANDS_V4_WITH_VALUE[requests[index]?.command];
              if (!hasValue) {
                  return itemData;
              }

              const {output, ...itemRest} = itemData;
              return {
                  ...itemRest,
                  ...(hasValue ? {output: (output as any).value} : {output}),
              };
          });

    return {...rest, results: res};
}

export const USE_IGNORE_NODE_DOES_NOT_EXIST = {ignoreErrorCodes: [YTErrors.NODE_DOES_NOT_EXIST]};
export const USE_SKIP_ERROR_FN_NODE_DOES_NOT_EXIST: Pick<
    Required<CommonWrapApiOptions<unknown>>,
    'skipErrorFn'
> = {
    skipErrorFn: ({code}) => code === YTErrors.NODE_DOES_NOT_EXIST,
};

export function getBatchErrorIndices<T>(results: Array<BatchResultsItem<T>>) {
    return reduce_(
        results,
        (acc, {error}, index) => {
            if (error) {
                acc.push(index);
            }
            return acc;
        },
        [] as Array<number>,
    );
}

interface CommonWrapApiOptions<T> {
    toasterName: string;
    successContent?: React.ReactNode | ((res: T) => React.ReactNode);
    skipSuccessToast?: boolean;
    errorContent?: React.ReactNode | ((e: YTError) => React.ReactNode);
    skipErrorToast?: boolean;
    skipErrorFn?: (e: any) => boolean;
    successTitle?: string;
    timeout?: number;
    autoHide?: boolean;
}

type BatchWrapApiOption<Type extends 'v3' | 'v4' | undefined> =
    | {batchType?: undefined; errorTitle?: string}
    | {batchType: Type; errorTitle: string};

export type WrapApiOptions<
    T,
    BatchTypeT extends 'v3' | 'v4' | undefined,
> = CommonWrapApiOptions<T> & BatchWrapApiOption<BatchTypeT>;

export type BatchResultsOrT<BatchType> = BatchType extends 'v3'
    ? Array<BatchResultsItem>
    : BatchType extends 'v4'
      ? {results: Array<BatchResultsItem>}
      : unknown;

export function wrapBatchPromise<T>(p: Promise<T>, errorTitle: string): Promise<T> {
    return p.then((res) => {
        const error = getBatchError(res as any, errorTitle);
        if (error) {
            throw error;
        }

        return res;
    });
}

export function wrapApiPromiseByToaster<
    T extends BatchResultsOrT<BatchType>,
    BatchType extends 'v3' | 'v4' | undefined = undefined,
>(p: Promise<T>, options: WrapApiOptions<T, BatchType>): Promise<T> {
    const {errorContent, successContent} = options;
    return p
        .then((res) => {
            if (options.batchType === 'v3' || options.batchType === 'v4') {
                const error = getBatchError(
                    options.batchType === 'v3'
                        ? (res as BatchResultsOrT<'v3'>)
                        : (res as BatchResultsOrT<'v4'>).results,
                    options.errorTitle || 'Missing batch error title',
                );
                if (error) {
                    throw error;
                }
            }

            if (!options.skipSuccessToast) {
                toaster.add({
                    name: options.toasterName,
                    theme: 'success',
                    title: options.successTitle || 'Success',
                    content:
                        'function' === typeof successContent ? successContent(res) : successContent,
                    autoHiding: options.autoHide === false ? false : (options.timeout ?? 10000),
                });
            }
            return res;
        })
        .catch((error) => {
            if (!isCancelled(error)) {
                const data = error?.response?.data || error;
                const {code, message} = data;

                const {skipErrorFn, skipErrorToast} = options;

                const isSkippedError = skipErrorFn ? skipErrorFn : (_e: unknown) => skipErrorToast;

                if (!isSkippedError(error)) {
                    toaster.add({
                        name: options.toasterName,
                        theme: 'danger',
                        title: options.errorTitle || 'Failure',
                        content:
                            'function' === typeof errorContent
                                ? errorContent(error)
                                : errorContent || (
                                      <span>
                                          [code {code}] {message}
                                      </span>
                                  ),
                        actions: [{label: ' Details', onClick: () => showErrorPopup(data)}],
                        autoHiding: false,
                    });
                }
            }
            return Promise.reject(error);
        });
}

export function calcProgressProps(
    usage?: number,
    limit?: number,
    format: 'Number' | 'Bytes' = 'Number',
    themeThresholds: ThemeThreshold[] = defaultThemeThresholds,
): ProgressProps {
    const value = computeProgress(usage, limit);
    return {
        value: value ?? 0,
        theme: getProgressTheme(value, themeThresholds),
        text: `${formatNumber(usage, format)} / ${formatNumber(limit, format)}`,
    };
}

export function formatNumber(value?: number, format?: 'Number' | 'Bytes'): string {
    return format === 'Bytes' ? hammer.format['Bytes'](value) : hammer.format['Number'](value);
}

export function showToasterError(name: string, error: any) {
    const data = error?.response?.data || error;
    const {code, message} = data;

    toaster.add({
        name,
        theme: 'danger',
        title: `${name} failure`,
        content: (
            <span>
                [code {code}] {message}
            </span>
        ),
        actions: [{label: ' view', onClick: () => showErrorPopup(data)}],
    });
    return Promise.reject(error);
}

export function unescapeSlashX(path: string) {
    let decoded = '';

    for (let i = 0, len = path.length; i < len; i++) {
        const currentChar = path.charAt(i);

        if (currentChar === '\\') {
            const nextChar = path.charAt((i += 1));

            if (nextChar === 'x') {
                // TODO check that next two characters are hexademical and end of string is not reached
                const hexEscapeSequence = path.charAt((i += 1)) + path.charAt((i += 1));

                decoded += String.fromCharCode(parseInt(hexEscapeSequence, 16));
            } else {
                decoded += nextChar;
            }
        } else {
            decoded += currentChar;
        }
    }

    return decoded;
}

export function calculateLoadingStatus(loading: boolean, loaded: boolean, error: any) {
    if (loading) {
        return LOADING_STATUS.LOADING;
    }

    if (error) {
        return LOADING_STATUS.ERROR;
    }

    if (loaded) {
        return LOADING_STATUS.LOADED;
    }

    return LOADING_STATUS.UNINITIALIZED;
}

export function isFinalLoadingStatus(status: string) {
    return status === LOADING_STATUS.LOADED || status === LOADING_STATUS.ERROR;
}

export function delayed<T>(callBack: () => Promise<T>, timeout: number): Promise<T> {
    return new Promise((res, rej) => {
        setTimeout(async () => {
            try {
                res(await callBack());
            } catch (e) {
                rej(e);
            }
        }, timeout);
    });
}

export function makeLink(url: string, text: string) {
    return !url ? undefined : (
        <Link href={url} target={'_blank'}>
            {text}
        </Link>
    );
}

export function showErrorPopup(
    error: YTError<{attributes?: object}> | AxiosError,
    options: Omit<ErrorInfo, 'error'> = {},
) {
    getWindowStore().dispatch(showErrorModal(error, options));
}

export function toggleBooleanInPlace<T, K extends TypedKeys<T, boolean>>(key: K, obj: T) {
    const tmp: any = obj;
    if (tmp[key]) {
        delete tmp[key];
    } else {
        tmp[key] = true;
    }
    return obj;
}

export function moveArrayElement<T>(arr: Array<T>, oldIndex: number, newIndex: number): [] | [T] {
    if (oldIndex < 0 || oldIndex >= arr.length || newIndex < 0 || newIndex >= arr.length) {
        return [];
    }

    const [item] = arr.splice(oldIndex, 1);
    arr.splice(newIndex, 0, item);

    return [item];
}

export function nanToUndefined(value: any) {
    return isNaN(value) ? undefined : value;
}

type Tree<T> = T & {
    children?: Array<Tree<T>>;
};

interface VisitTreeItemsOptions<T> {
    handledSet: Set<unknown>;
    isNeedToSkipChildren?: (item: T) => boolean;
}

export function visitTreeItems<T>(
    treeItem: Tree<T> | undefined,
    visitorFn: (item: T) => void,
    options?: Partial<VisitTreeItemsOptions<T>>,
) {
    const opts = {
        ...options,
        handledSet: options?.handledSet || new Set(),
    };

    return visitTreeItemsImpl(treeItem, visitorFn, opts);
}

function visitTreeItemsImpl<T>(
    treeItem: Tree<T> | undefined,
    visitorFn: (item: T) => void,
    options: VisitTreeItemsOptions<T>,
) {
    const {handledSet, isNeedToSkipChildren} = options;

    if (!treeItem || handledSet.has(treeItem)) {
        return;
    }

    handledSet.add(treeItem);
    visitorFn(treeItem);

    if (isNeedToSkipChildren && isNeedToSkipChildren(treeItem)) {
        return;
    }

    forEach_(treeItem.children, (child) => visitTreeItemsImpl(child, visitorFn, options));
}

export function openInNewTab(href: string) {
    // Safari specific hack to open new tab (not window)
    Object.assign(document.createElement('a'), {
        target: '_blank',
        href,
    }).click();
}

const previousProps: Record<string, any> = {};

export function showChangedProps(key: string, props: object, verbose?: boolean) {
    const prevProps = previousProps[key];
    if (prevProps === undefined) {
        // eslint-disable-next-line no-console
        console.log(key, Date.now(), Object.keys(props));
    } else {
        const changed: Array<string> = [];
        forEach_(props, (v, k) => {
            if (v !== prevProps[k]) {
                changed.push(k);
                if (verbose) {
                    // eslint-disable-next-line no-console
                    console.log(key, k, {prev: prevProps[k], v});
                }
            }
        });
        // eslint-disable-next-line no-console
        console.log(key, Date.now(), changed);
    }
    previousProps[key] = props;
}

export function updateIfChanged<T, K extends keyof T>(
    obj: T,
    key: K,
    value: T[K],
    isEqual?: (l: T[K], r: T[K]) => boolean,
) {
    if (isEqual ? !isEqual(obj[key], value) : obj[key] !== value) {
        obj[key] = value;
    }
}

export function updateByLocationParams<T extends object>(
    {draft, query}: {draft: WritableDraft<T>; query: T},
    params: LocationParameters,
) {
    Object.values(params).forEach(({stateKey}) => {
        const newValue = get_(query, stateKey);
        const currValue = get_(draft, stateKey);
        if (!isEqual_(newValue, currValue)) {
            set_(draft, stateKey, newValue);
        }
    });
}

export function toClassName(text?: string) {
    if ('string' !== typeof text) {
        return undefined;
    }

    return text.replace(/[^-_\w\d]/g, '_');
}
