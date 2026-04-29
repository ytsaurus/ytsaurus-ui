import {YTApiSetup, ytApiV3} from '../rum-wrap-api';
import {ypath} from '../../utils';
import {NavigationNode} from '../../types/navigation';

export const loadFolderByPath = async (
    path: string,
    setup: YTApiSetup,
    favorites: string[] = [],
) => {
    const response = await ytApiV3.list({
        setup,
        parameters: {
            path,
            attributes: ['type', 'broken', 'dynamic', 'sorted', 'target_path'],
        },
    });

    return response
        .map((item: unknown) => {
            const name = ypath.getValue(item);
            const newPath = path + '/' + name;
            const attributes = ypath.getAttributes(item);
            const {target_path: targetPath, ...restAttributes} = attributes;

            return {
                name,
                ...restAttributes,
                path: newPath,
                targetPath,
                isFavorite: favorites.includes(newPath),
            };
        })
        .sort((a: NavigationNode, b: NavigationNode) => a.name.localeCompare(b.name));
};
