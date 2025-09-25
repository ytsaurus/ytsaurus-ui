import {BaseQueryApi} from '@reduxjs/toolkit/query';
import map_ from 'lodash/map';

import {ytApiV3} from '../../../../rum/rum-wrap-api';
import {attributesForNodeIcon} from '../../../../constants/navigation/map-node';

function makePathsAttributesRequests(paths: string[]) {
    return map_(paths, (path) => ({
        command: 'get' as const,
        parameters: {
            path: `${path}/@`,
            attributes: ['path', ...attributesForNodeIcon],
        },
    }));
}

type PathsType = 'last_visited' | 'favourite';

type FetchPathsArgs = {
    cluster: string;
    type: PathsType;
    id: string;
    favouritePaths: Array<{item: string; path: string}>;
    lastVisitedPaths: Array<{item: string; path: string}>;
};

export type DashboardNavigationResponse = {
    path: string;
    type: string;
    target_path?: string;
    sorted?: boolean;
    dynamic?: boolean;
    treat_as_queue_consumer?: boolean;
    treat_as_queue_producer?: boolean;
};

export async function fetchPaths(args: FetchPathsArgs, _api: BaseQueryApi) {
    try {
        const {type, lastVisitedPaths, favouritePaths} = args;

        const paths = type === 'last_visited' ? lastVisitedPaths : favouritePaths;

        const response = await ytApiV3.executeBatch<DashboardNavigationResponse>({
            parameters: {
                requests: makePathsAttributesRequests(map_(paths, (item) => item?.path)),
            },
        });

        const data = map_(response, (item, idx) => {
            if (item.output) {
                const itemData = item.output;
                return {
                    type: itemData?.type,
                    path: paths?.[idx]?.path,
                    targetPath: itemData?.target_path,
                    iconType: itemData?.type,
                    attributes: itemData,
                };
            }

            return {
                type: 'unknown',
                path: paths?.[idx]?.path,
            };
        });

        return {data};
    } catch (error) {
        return {error};
    }
}
