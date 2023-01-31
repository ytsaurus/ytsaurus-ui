import React from 'react';
import {TABLE_ERASE_MODAL_PARTIAL} from '../../../../constants/navigation/modals/table-erase-modal';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {RootState} from '../../../reducers';
import {ThunkAction} from 'redux-thunk';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {AppStoreProvider} from '../../../../containers/App/AppStoreProvider';
import {OperationShortInfo} from '../../../../pages/components/OperationShortInfo/OperationShortInfo';
import {makeUiMarker} from '../../../../utils/cypress-attributes';
import {Page} from '../../../../constants';

export function showTableEraseModal(path: string) {
    return {type: TABLE_ERASE_MODAL_PARTIAL, data: {visible: true, path}};
}

export function hideTableEraseModal() {
    return {
        type: TABLE_ERASE_MODAL_PARTIAL,
        data: {visible: false, path: undefined},
    };
}

type EraseThunkAction = ThunkAction<any, RootState, any, any>;

export function runTableErase(path: string, from?: number, to?: number): EraseThunkAction {
    return () => {
        if (!path) {
            throw Error('Path cannot be empty for "erase" operation');
        }
        let range = '';
        if (!isNaN(from!) && !isNaN(to!)) {
            range = `[#${from}:#${to}]`;
        } else if (!isNaN(from!)) {
            range = `[#${from}:]`;
        } else if (!isNaN(to!)) {
            range = `[:#${to}]`;
        }

        console.log({range});

        return wrapApiPromiseByToaster(
            yt.v3.erase({
                spec: {
                    table_path: path + range,
                },
                ...makeUiMarker(`${Page.NAVIGATION}:erase`),
            }),
            {
                toasterName: 'table_erase_' + path,
                successContent(res: string) {
                    const opId = JSON.parse(res);
                    return (
                        <AppStoreProvider>
                            <OperationShortInfo id={opId} type={'erase'} />
                        </AppStoreProvider>
                    );
                },
                successTitle: 'Erase operation is started',
                errorTitle: 'Erase operation is failed',
                autoHide: false,
            },
        );
    };
}
