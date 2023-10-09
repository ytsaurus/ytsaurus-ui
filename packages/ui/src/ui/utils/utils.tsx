import React from 'react';
import _ from 'lodash';

import {TypedKeys, YTError} from '../types';
import {Link, ProgressProps, Toaster} from '@gravity-ui/uikit';
import {
    ThemeThreshold,
    computeProgress,
    defaultThemeThresholds,
    getProgressTheme,
} from '../utils/progress';
import hammer from '../common/hammer';
import {LOADING_STATUS} from '../constants';
import {ErrorInfo} from '../store/reducers/modals/errors';
import {showErrorModal} from '../store/actions/modals/errors';
import {BatchResultsItem} from '../../shared/yt-types';
import axios, {AxiosError} from 'axios';

const BATCH_ERROR_MESSAGE = 'The following sub-requests are failed:';

export function getBatchError<T = unknown>(
    batchResults: Array<BatchResultsItem<T>>,
    message: string = BATCH_ERROR_MESSAGE,
): YTError | undefined {
    return splitBatchResults(batchResults, message).error;
}

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
        : _.map(results, (itemData, index) => {
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

export interface SplitedBatchResults<T> {
    error: YTError | undefined;
    results: Array<T>;
    outputs: Array<T | undefined>;
    errorIndices: Array<number>;
    resultIndices: Array<number>;
}

export function splitBatchResults<T = unknown>(
    batchResults: Array<BatchResultsItem<T>>,
    message: string = BATCH_ERROR_MESSAGE,
): SplitedBatchResults<T> {
    const innerErrors: Array<YTError> = [];
    const results: Array<T> = [];
    const outputs: Array<T | undefined> = [];
    const errorIndices: Array<number> = [];
    const resultIndices: Array<number> = [];
    _.forEach(batchResults, (res, index) => {
        const {error, output} = res;
        outputs.push(output);
        if (error) {
            innerErrors.push(error);
            errorIndices.push(index);
        } else {
            results.push(output!);
            resultIndices.push(index);
        }
    });

    const error = !innerErrors.length ? undefined : {inner_errors: innerErrors, message, results};
    return {error, results, outputs, errorIndices, resultIndices};
}

export function getBatchErrorIndices<T>(results: Array<BatchResultsItem<T>>) {
    return _.reduce(
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

interface WrapApiOptions<T> {
    toasterName: string;
    successContent?: React.ReactNode | ((res: T) => React.ReactNode);
    skipSuccessToast?: boolean;
    errorContent?: React.ReactNode | ((e: YTError) => React.ReactNode);
    skipErrorToast?: boolean;
    successTitle?: string;
    errorTitle?: string;
    timeout?: number;
    autoHide?: boolean;

    isBatch?: boolean;
    batchError?: string;
}

const toaster = new Toaster();

export function wrapBatchPromise<T>(p: Promise<T>): Promise<T> {
    return p.then((res) => {
        const error = getBatchError(res as any, 'Batch-request is failed');
        if (error) {
            throw error;
        }

        return res;
    });
}

export function wrapApiPromiseByToaster<T>(p: Promise<T>, options: WrapApiOptions<T>): Promise<T> {
    const {errorContent, successContent} = options;
    return p
        .then((res) => {
            if (options.isBatch) {
                const error = getBatchError(
                    res as any,
                    options.batchError || 'Batch-request is failed',
                );
                if (error) {
                    throw error;
                }
            }

            if (!options.skipSuccessToast) {
                toaster.add({
                    name: options.toasterName,
                    type: 'success',
                    title: options.successTitle || 'Success',
                    content:
                        'function' === typeof successContent ? successContent(res) : successContent,
                    autoHiding: options.autoHide === false ? false : options.timeout ?? 10000,
                });
            }
            return res;
        })
        .catch((error) => {
            if (axios.isCancel(error)) {
                return Promise.reject(error);
            }

            const data = error?.response?.data || error;
            const {code, message} = data;

            if (!options.skipErrorToast) {
                toaster.add({
                    name: options.toasterName,
                    type: 'error',
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
        value,
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
        type: 'error',
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
    error: YTError | AxiosError,
    options: Omit<ErrorInfo, 'error'> = {},
) {
    (window as any).store.dispatch(showErrorModal(error, options));
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

    _.forEach(treeItem.children, (child) => visitTreeItemsImpl(child, visitorFn, options));
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
        console.log(key, Date.now(), Object.keys(props));
    } else {
        const changed: Array<string> = [];
        _.forEach(props, (v, k) => {
            if (v !== prevProps[k]) {
                changed.push(k);
                if (verbose) {
                    console.log(key, k, {prev: prevProps[k], v});
                }
            }
        });
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
