import {TRASH_PATH} from '../../constants/navigation';

export function isTrashNode(path?: string) {
    return path === TRASH_PATH;
}
