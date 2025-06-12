import {BaseQueryApi} from '@reduxjs/toolkit/query';
import map_ from 'lodash/map';

import {RootState} from '../../../reducers';
import {getFavouritePaths, getLastVisitedPaths} from '../../../selectors/favourites';
import {ytApiV3} from '../../../../rum/rum-wrap-api';

function makePathsAttributesRequests(paths: string[]) {
    return map_(paths, (path) => ({
        command: 'get' as const,
        parameters: {
            path: `${path}/@`,
            attributes: [
                'path',
                'treat_as_queue_consumer',
                'treat_as_queue_producer',
                'type',
                'dynamic',
                'sorted',
            ],
        },
    }));
}

type PathsType = 'last_visited' | 'favourite';

export async function fetchPaths(args: {cluster: string; type: PathsType}, api: BaseQueryApi) {
    try {
        const {type} = args;
        const state = api.getState() as RootState;
        const lastVisited = getLastVisitedPaths(state);
        const favourites = getFavouritePaths(state);

        const paths = type === 'last_visited' ? lastVisited : favourites;

        const response = await ytApiV3.executeBatch<{type: string; target_path?: string}>({
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
