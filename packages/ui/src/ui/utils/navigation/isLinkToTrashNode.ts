import {TRASH_PATH} from '../../constants/navigation';

export function isLinkToTrashNode(targetPath?: string) {
    return targetPath === TRASH_PATH;
}
