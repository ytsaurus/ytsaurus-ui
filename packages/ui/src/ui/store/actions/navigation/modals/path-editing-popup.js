import {prepareErrorMessage} from '../../../../utils/navigation/path-editing-popup';
import {
    HIDE_ERROR,
    SET_PATH,
    SHOW_ERROR,
} from '../../../../constants/navigation/modals/path-editing-popup';

export function showErrorInModal(error) {
    const message = prepareErrorMessage(error);

    return {
        type: SHOW_ERROR,
        data: {message, error},
    };
}

export function setPath(newPath) {
    return {
        type: SET_PATH,
        data: {newPath},
    };
}

export function hideError() {
    return {
        type: HIDE_ERROR,
    };
}

export function openEditingPopup(objectPath, path, type, multipleMode = false, items = []) {
    return {
        type,
        data: {path, objectPath, items, multipleMode},
    };
}

export function closeEditingPopup(type) {
    return {type};
}
