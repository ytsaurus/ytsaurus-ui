import {loadFolderByPath} from './loadFolderByPath';
import {loadTableAttributesByPath} from './loadTableAttributesByPath';
import {isFolderNode, isTableNode} from './helpers';
import {YTApiSetup, ytApiV3} from '../rum-wrap-api';

export const loadNodeByPath =
    (
        path: string,
        setup: YTApiSetup,
        config: {
            favorites: string[];
            login: string;
            limit: number;
            clusterId: string;
            docsUrls?: Record<string, string>;
        },
    ) =>
    async () => {
        const {favorites = [], login, limit, clusterId, docsUrls} = config;

        const type = await ytApiV3.get({
            setup,
            parameters: {
                path: `${path}/@type`,
            },
        });

        if (isTableNode(type)) {
            return loadTableAttributesByPath(path, setup, {login, limit, clusterId, docsUrls});
        } else if (isFolderNode(type)) {
            return loadFolderByPath(path, setup, favorites);
        } else {
            throw new Error("Can't open this type of node");
        }
    };
