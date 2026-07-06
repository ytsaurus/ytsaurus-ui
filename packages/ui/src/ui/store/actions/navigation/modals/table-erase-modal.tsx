import React from 'react';
import {TABLE_ERASE_MODAL_PARTIAL} from '../../../../constants/navigation/modals/table-erase-modal';
import i18n from './i18n';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {type RootState} from '../../../reducers';
import {type ThunkAction} from 'redux-thunk';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {AppStoreProvider} from '../../../../containers/App/AppStoreProvider';
import {OperationShortInfo} from '../../../../pages/components/OperationShortInfo/OperationShortInfo';
import {makeUiMarker} from '../../../../utils/cypress-attributes';
import {Page} from '../../../../constants';
import {type TableWriterSettings} from './table-merge-sort-modal';

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

export function runTableErase({
    path,
    from,
    to,
    combine_chunks,
    job_io,
    auto_merge,
}: {
    path: string;
    from?: number;
    to?: number;
    combine_chunks?: boolean;
    job_io?: {table_writer: TableWriterSettings};
    auto_merge?: {job_io: {table_writer: TableWriterSettings}};
}): EraseThunkAction {
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

        const spec: Record<string, unknown> = {
            table_path: path + range,
            combine_chunks,
        };
        if (job_io) {
            spec.job_io = job_io;
        }
        if (auto_merge) {
            spec.auto_merge = auto_merge;
        }

        return wrapApiPromiseByToaster(
            yt.v3.erase({
                spec,
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
                successTitle: i18n('alert_erase-started'),
                errorTitle: i18n('alert_erase-failed'),
                autoHide: false,
            },
        );
    };
}
