import {NetworkCode, ErrorMessage} from '../../constants/navigation/modals/path-editing-popup';
import _ from 'lodash';

export function getOnlyFolders(suggestions) {
    return _.filter(suggestions, (child) => child.type === 'map_node');
}

function getCorrectInnerError(innerErrors = []) {
    const correctErrorCodes = _.values(NetworkCode);

    return _.find(innerErrors, (error) => {
        return _.some(correctErrorCodes, (code) => code === error.code);
    });
}

export function prepareErrorMessage(error) {
    return (
        ErrorMessage[error.code] ||
        ErrorMessage[getCorrectInnerError(error.inner_errors)?.code] ||
        ErrorMessage['DEFAULT']
    );
}
