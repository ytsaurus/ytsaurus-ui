import axios, {AxiosError} from 'axios';
import {YTErrorRaw} from '../../@types/types';
import {isYTError} from '../../shared/utils';
import {UIBatchError} from '../../shared/utils/error';
import {YTErrors} from './constants';
import {getYtErrorCode} from '../utils/errors';

const RUM = getRumInstance();

function getRumInstance(): RumCounter {
    const res = (window as any).Ya?.Rum as RumCounter;
    if (!res) {
        return {
            getTime() {
                return Date.now();
            },
            sendDelta() {},
            sendTimeMark() {},
            logError() {},
            makeSubPage(): SubPage {
                return {};
            },

            sendTrafficData() {},
            finalizeLayoutShiftScore() {},
            finalizeLargestContentfulPaint() {},
        } as RumCounter;
    }
    return res;
}

interface RumCounter {
    getTime(): number;
    sendDelta(id: string, deltaTime: number, subPage?: SubPage): void;
    sendTimeMark(
        counterId: string,
        time?: number,
        addPerfMark?: boolean,
        params?: string | object,
    ): void;
    logError(params: LogErrorParams, error?: Error): void;
    makeSubPage(pageName: string, start?: number): SubPage;

    sendTrafficData(): void;
    finalizeLayoutShiftScore(): void;
    finalizeLargestContentfulPaint(): void;
}

export interface SubPage {}

interface LogErrorParams {
    message?: string; // 'parse data',
    block?: string; // 'stream',
    method?: string; // '_getData',
    source?: string; // 'ugc_backend', // Source of error
    sourceMethod?: string; // 'set_reactions', // Method of error sources
    type?: string; // 'logic', // Type of error: network, logic
    page?: string; // 'product',
    service?: string; // 'ether',
    level?: 'info' | 'debug' | 'warn' | 'error' | 'fatal';
    additional?: any /* { // key-value Additional information withot nesting. Do not send application state.
        morda: // 'big'
    },
    */;
    // eslint-disable-next-line camelcase
    coordinates_gp?: string; //'43_2959023:76_9437790:140_0000000:1:1425279224', // User coordinates from gp_auto
}

export function rumGetTime() {
    return RUM.getTime();
}

/**
 * Field params.additional.href is handled in a special way: the value is sent only when it is not equal to window.location.href,
 * additionaly the prefix that equeal to window.location.origin is
 * @param params
 * @param error
 * @param silent
 */
export function rumLogError(params: LogErrorParams, error?: Error, silent = false) {
    const {level} = params;
    if (!silent) {
        switch (level) {
            case 'warn':
                // eslint-disable-next-line no-console
                console.warn(params, error);
                break;
            case 'info':
                // eslint-disable-next-line no-console
                console.info(params, error);
                break;
            case 'debug':
                // eslint-disable-next-line no-console
                console.info(params, error);
                break;
            default:
                // eslint-disable-next-line no-console
                console.error(params, error);
        }
    }

    if (!isAllowSendError(error!)) {
        return;
    }

    const {href, ...rest} = params.additional || {};

    const additional = {
        ...rest,
        ...wrappedErrorOrNull(error),
        ...wrappedHrefOrNull(href),
    };

    const p: object = Object.assign(
        {},
        params,
        Object.keys(additional).length ? {additional} : undefined,
    );

    return RUM.logError(p, error);
}

export function rumMakeSubPage(...args: Parameters<RumCounter['makeSubPage']>) {
    return RUM.makeSubPage(...args);
}

export function rumSendDelta(...args: Parameters<RumCounter['sendDelta']>) {
    rumDebugLog2('sendDelta', ...args);
    return RUM.sendDelta(...args);
}

export function rumFinalizeSpa() {
    RUM.sendTrafficData();
    RUM.finalizeLayoutShiftScore();
    RUM.finalizeLargestContentfulPaint();
}

export function rumSendFrameworkInited() {
    return RUM.sendTimeMark('3036');
}

const ENABLE_RUM_DEBUG_2 =
    -1 !== window.location?.search?.slice(1).split('&').indexOf('rumdebug=2');
const ENABLE_RUM_DEBUG =
    ENABLE_RUM_DEBUG_2 || -1 !== window.location?.search?.slice(1).split('&').indexOf('rumdebug=1');

const startTime = Date.now();

rumDebugLog('Start time', startTime);

export function rumDebugLog(...args: any) {
    if (ENABLE_RUM_DEBUG) {
        // eslint-disable-next-line no-console
        console.log('RUM:', Date.now() - startTime, ...args);
    }
}

export function rumDebugLog2(...args: any) {
    if (ENABLE_RUM_DEBUG_2) {
        // eslint-disable-next-line no-console
        console.log('RUM:', Date.now() - startTime, ...args);
    }
}

function wrappedErrorOrNull(error?: Error) {
    return !error ? null : {error: stringifyError(error)};
}

function stringifyError(error?: Error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {stack, ...rest} = error || {};
    return JSON.stringify(rest);
}

function wrappedHrefOrNull(href?: string) {
    if (!href || window.location.href === href) {
        return undefined;
    }

    const {origin} = window.location;
    return {
        href: href.startsWith(origin) ? href.substr(origin.length) : href,
    };
}

function isAllowSendError(error: Error | AxiosError): boolean {
    const err = axios.isAxiosError(error) ? (error.response?.data as YTErrorRaw) : error;

    if (!isYTError(err) && !(error instanceof UIBatchError)) {
        return true;
    }

    const filteredError = removeErrorsToIgnore(err);
    return Boolean(filteredError);
}

const RUM_IGNORE_ERRORS = new Set([
    YTErrors.NODE_DOES_NOT_EXIST,
    YTErrors.NO_SUCH_TRANSACTION,
    YTErrors.PERMISSION_DENIED, // User transaction * has expired or was aborted
    YTErrors.OPERATION_FAILED_TO_PREPARE,
    YTErrors.OPERATION_JOBS_LIMIT_EXEEDED,
]);

function removeErrorsToIgnore<T extends YTErrorRaw>(error: T): T | undefined {
    if (RUM_IGNORE_ERRORS.has(getYtErrorCode(error))) {
        return undefined;
    }

    if (error instanceof UIBatchError) {
        const res = Object.assign(
            {...error},
            {
                inner_errors: error.inner_errors?.filter(
                    (e) => !RUM_IGNORE_ERRORS.has(getYtErrorCode(e)),
                ),
            },
        );
        if (!res.inner_errors?.length) {
            return undefined;
        } else {
            return res;
        }
    }

    return error;
}
