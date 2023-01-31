import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {showErrorPopup} from '../../utils/utils';
import {INITIAL_STEP} from '../../constants/navigation/modals/restore-object';

function getNextObjectName(initialPath, step = INITIAL_STEP) {
    return `${initialPath}(${step})`;
}

function checkPathExists(initialPath, path, step = INITIAL_STEP) {
    return yt.v3
        .exists({path})
        .then((isExists) => {
            if (isExists) {
                const newPath = getNextObjectName(initialPath, ++step);

                return checkPathExists(initialPath, newPath, step);
            }

            return path;
        })
        .catch(showErrorPopup);
}

export function findCorrectObjectName(initialPath) {
    const path = getNextObjectName(initialPath);

    return checkPathExists(initialPath, path);
}

export function inTrash(path) {
    return path.startsWith('//tmp/trash/') || path.startsWith('//trash/');
}
