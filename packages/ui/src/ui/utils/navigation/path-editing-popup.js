import {ErrorMessage, NetworkCode} from '../../constants/navigation/modals/path-editing-popup';

import filter_ from 'lodash/filter';
import find_ from 'lodash/find';
import some_ from 'lodash/some';
import values_ from 'lodash/values';

export function getOnlyFolders(suggestions) {
    return filter_(suggestions, (child) => child.type === 'map_node');
}

function getCorrectInnerError(innerErrors = []) {
    const correctErrorCodes = values_(NetworkCode);

    return find_(innerErrors, (error) => {
        return some_(correctErrorCodes, (code) => code === error.code);
    });
}

export function prepareErrorMessage(error) {
    return (
        ErrorMessage[error.code] ||
        ErrorMessage[getCorrectInnerError(error.inner_errors)?.code] ||
        ErrorMessage['DEFAULT']
    );
}
