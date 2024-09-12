import getComponentByContentType from './getComponentByContentType';
import {Tab} from '../../../../../constants/navigation';
import {YTError} from '../../../../../../@types/types';
import ypath from '../../../../../common/thor/ypath';
import getComponentByMode from './getComponentByMode';

export function checkContentIsSupported(type: string, mode: string) {
    if (mode === Tab.CONTENT) return Boolean(getComponentByContentType(type));
    return Boolean(getComponentByMode(mode));
}

function hasViewerForType(type: string): boolean {
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
