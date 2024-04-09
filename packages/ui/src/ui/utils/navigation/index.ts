import unipika from '../../common/thor/unipika';
// @ts-ignore
import ypath from '../../common/thor/ypath';

import {CancelTokenSource} from 'axios';

import {Page} from '../../constants/index';
import {SUPPRESS_REDIRECT} from '../../constants/navigation/modals/delete-object';
import {Tab} from '../../constants/navigation';
import {YTError} from '../../../@types/types';
import {allowDirectDownload} from '../../config';
import checkContentIsSupported from '../../pages/navigation/Navigation/ContentViewer/helpers/checkContentIsSupported';

export function autoCorrectPath(path: string) {
    // 1) Strip slash from the end
    const length = path.length;
    const lastToken = path[length - 1];
    const secondToLastToken = path[length - 2];

    if (length > 1 && lastToken === '/' && secondToLastToken !== '\\') {
        path = path.slice(0, length - 1);
    }

    return path;
}

const requests: Array<CancelTokenSource> = [];

export function saveRequestCancellation(cancellation: CancelTokenSource) {
    requests.push(cancellation);
}

export function cancelRequests() {
    while (requests.length) {
        requests.pop()?.cancel();
    }
}

interface RelativePath {
    path: string;
    relativePath: string;
    transaction?: string;
}

export function prepareRequest(
    relativePath: string | RelativePath,
    parameters: Partial<RelativePath> = {},
) {
    if (typeof relativePath !== 'string') {
        parameters = relativePath;
        relativePath = parameters.relativePath!;
    }

    const {path, relativePath: _x, transaction, ...rest} = parameters;

    const restParameters: {transaction_id?: string} = rest;

    const resultPath = path + (relativePath ? relativePath : '');

    if (transaction?.length) {
        restParameters.transaction_id = transaction;
    }

    return {
        ...restParameters,
        path: resultPath,
    };
}

export function hasViewerForType(type: string): boolean {
    return checkContentIsSupported(type, Tab.CONTENT);
}

export function itemNavigationAllowed(item: {
    type: string;
    targetPathBroken: unknown;
    parsedPathError?: YTError;
}) {
    if (item) {
        if (
            item.parsedPathError ||
            (item.type === 'link' && ypath.getBoolean(item.targetPathBroken))
        ) {
            return false;
        }

        const noAccess = item.type === undefined;

        return hasViewerForType(item.type) || noAccess;
    }

    return false;
}

export interface ParsedPath {
    fragments: Array<any>;
    stringify: () => string;
}

export function prepareNavigationState(
    parsedPath: string | ParsedPath,
    transaction?: string,
    index?: number,
) {
    let path: string;

    if (typeof index === 'number' && typeof parsedPath === 'object') {
        path = ypath.YPath.clone(parsedPath).toSubpath(index).stringify();
    } else if (typeof parsedPath === 'object') {
        path = parsedPath.stringify();
    } else {
        path = parsedPath;
    }

    return {page: Page.NAVIGATION, t: transaction, path};
}

export function preparePath(path: string) {
    const lastChar = path.charAt(path.length - 1);

    if (lastChar !== SUPPRESS_REDIRECT) {
        return path + SUPPRESS_REDIRECT;
    }

    return path;
}

export function prepareDestinationPath(dirPath: string, name: string) {
    const lastChar = dirPath.charAt(dirPath.length - 1);
    const nextToLastChar = dirPath.charAt(dirPath.length - 2);

    if (lastChar === '/' && nextToLastChar !== '\\') {
        return dirPath + name;
    }

    return `${dirPath}/${name}`;
}

export function getParentPath(path: string): string {
    const parsedPath = ypath.YPath.create(path, 'absolute');
    const isObjectRootPath =
        parsedPath.fragments.length === 1 && parsedPath.fragments[0].root === 'object-root';
    const isLinkPath = path.charAt(path.length - 1) === '&';

    let nextPath;
    // if previous path was "#ewqe12-eqweqw-231ew" then go to "/"
    // if previous path was "/foo/bar&" then go to "foo"
    if (isObjectRootPath) {
        nextPath = '/';
    } else if (isLinkPath) {
        nextPath = ypath.YPath.clone(parsedPath).toSubpath(-3).stringify();
    } else {
        nextPath = ypath.YPath.clone(parsedPath).toSubpath(-2).stringify();
    }

    return nextPath;
}

export function decodeEscapedAbsPath(path: string) {
    const {fragments} = ypath.YPath.create(path, 'absolute') as {fragments: Array<{name: string}>};

    return (
        '//' +
        fragments
            .slice(1)
            .map(({name}) => {
                return unipika.utils.utf8.decode(ypath.YPath.fragmentToYSON(name));
            })
            .join('/')
    );
}

export function makeDirectDownloadPath(
    command:
        | 'read_file'
        | 'read_query_result'
        | 'read_table'
        | 'get_job_fail_context'
        | 'get_job_input'
        | 'get_job_stderr',
    {
        cluster,
        proxy,
        externalProxy,
        version = 'v3',
    }: {cluster: string; proxy: string; externalProxy: string | undefined; version?: 'v3' | 'v4'},
) {
    return allowDirectDownload()
        ? `//${externalProxy ?? proxy}/api/${version}/${command}`
        : `/api/yt/${cluster}/api/${version}/${command}`;
}
