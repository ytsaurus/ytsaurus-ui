import {type YTError} from '../../../../../../@types/types';
import ypath from '../../../../../common/thor/ypath';
import {getContentViewerType} from './contentTypes';

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

        return Boolean(getContentViewerType(item.type)) || noAccess;
    }

    return false;
}
