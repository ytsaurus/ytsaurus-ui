import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import map_ from 'lodash/map';
import split_ from 'lodash/split';
import trim_ from 'lodash/trim';

import CancelHelper from '../../utils/cancel-helper';
import {
    CHANGE_PARAMETERS,
    COMMAND,
    LOAD_DATA,
    TOGGLE_PARAMETERS,
} from '../../constants/path-viewer';

const requests = new CancelHelper();
const prepareAttributes = (attributes) => {
    if (!trim_(attributes)) {
        return;
    }

    return map_(split_(attributes, ','), (name) => trim_(name));
};

export function loadData() {
    return (dispatch, getState) => {
        const {path, attributes, command, maxSize, encodeUTF8, stringify, annotateWithTypes} =
            getState().pathViewer;

        if (path) {
            dispatch({type: LOAD_DATA.REQUEST});
            requests.removeAllRequests();

            const outputFormatAttributes = {
                stringify: stringify,
                encode_utf8: encodeUTF8,
                annotate_with_types: annotateWithTypes,
            };

            const commandParameters = {
                path,
                attributes: prepareAttributes(attributes),
                output_format: {
                    $value: 'json',
                    $attributes: outputFormatAttributes,
                },
            };

            if (command === COMMAND.LIST) {
                commandParameters.max_size = maxSize ? Number(maxSize) : undefined;
            }

            return yt.v3[command](commandParameters, requests.saveCancelToken)
                .then((data) => {
                    dispatch({
                        type: LOAD_DATA.SUCCESS,
                        data: {data},
                    });
                })
                .catch((error) => {
                    if (error.code !== yt.codes.CANCELLED) {
                        dispatch({
                            type: LOAD_DATA.FAILURE,
                            data: {error},
                        });
                    }
                });
        }
    };
}

export function changeParameters(param, value, reload = false) {
    return (dispatch) => {
        dispatch({
            type: CHANGE_PARAMETERS,
            data: {param, value},
        });

        if (reload) {
            dispatch(loadData());
        }
    };
}

export function toggleParameters(param) {
    return (dispatch) => {
        dispatch({
            type: TOGGLE_PARAMETERS,
            data: {param},
        });
        dispatch(loadData());
    };
}

export function abortAndReset() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: LOAD_DATA.CANCELLED});
    };
}
