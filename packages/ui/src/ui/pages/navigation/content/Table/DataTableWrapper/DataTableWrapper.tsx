import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import DataTable from '@gravity-ui/react-data-table';

import {Loader} from '@gravity-ui/uikit';

import {TypeArray} from '../../../../../components/SchemaDataType/dataTypes';

import {injectTableCellData} from '../../../../../store/actions/navigation/content/table/table-ts';
import {getOffsetValue} from '../../../../../store/selectors/navigation/content/table';
import {getSchemaByName} from '../../../../../store/selectors/navigation/tabs/schema';
import {getSettingTableDisplayRawStrings} from '../../../../../store/selectors/settings';
import {YsonSettings} from '../../../../../store/selectors/thor/unipika';
import {
    CellDataHandler,
    onCellPreview,
} from '../../../../../store/actions/navigation/modals/cell-preview';
import {NameWithSortOrder, prepareColumns} from '../../../../../utils/navigation/prepareColumns';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import CancelHelper from '../../../../../utils/cancel-helper';

import './DataTableWrapper.scss';

const block = cn('data-table-wrapper');

const rowKey = (_row: unknown, index: number) => index;

DataTableWrapper.propTypes = {};

export type DataTableWrapperProps = {
    isFullScreen: boolean;
    loading: boolean;
    loaded: boolean;
    columns: Array<NameWithSortOrder>;
    keyColumns: Array<string>;
    ysonSettings: YsonSettings;
    yqlTypes?: Array<TypeArray>;

    data: Array<unknown>;
};

export default function DataTableWrapper(props: DataTableWrapperProps) {
    const dispatch = useDispatch();
    const useRawStrings = useSelector(getSettingTableDisplayRawStrings);
    const schemaByName = useSelector(getSchemaByName);

    const {columns, keyColumns, ysonSettings, yqlTypes, loading, loaded, isFullScreen, ...rest} =
        props;

    const offsetValue = useSelector(getOffsetValue);
    const dataHandler = React.useMemo(() => {
        const cancelHelper = new CancelHelper();
        return {
            cancelHelper,
            saveCancellation: (token) => {
                cancelHelper.saveCancelToken(token);
            },
            onStartLoading: () => {},
            onError: ({error, columnName, rowIndex}) => {
                wrapApiPromiseByToaster(Promise.reject(error), {
                    toasterName: `incomplete_cell_${columnName}_${rowIndex}`,
                    errorContent: `Failed to load cell data: ${JSON.stringify({columnName, rowIndex})}`,
                });
            },
            onSuccess: ({data, columnName, rowIndex}) => {
                dispatch(injectTableCellData({data, offsetValue, columnName, rowIndex}));
            },
        } as CellDataHandler & {cancelHelper: CancelHelper};
    }, [offsetValue]);

    React.useEffect(() => {
        return () => {
            dataHandler.cancelHelper.removeAllRequests();
        };
    }, [dataHandler]);

    const onShowPreview = React.useCallback(
        (columnName: string, rowIndex: number, tag?: string) => {
            const allowInjectData = tag?.startsWith('image/') || tag?.startsWith('audio/');
            return dispatch(
                onCellPreview({
                    columnName,
                    rowIndex,
                    tag,
                    dataHandler: allowInjectData ? dataHandler : undefined,
                }),
            );
        },
        [dispatch, dataHandler],
    );
    const dtColumns = prepareColumns({
        columns,
        keyColumns,
        yqlTypes,
        ysonSettings,
        useRawStrings,
        schemaByName,
        onShowPreview,
    });
    const initialLoading = loading && !loaded;
    const updating = loading && loaded;

    React.useEffect(() => {
        if (!loading && loaded && rest.data.length > 0) {
            setTimeout(
                () =>
                    requestAnimationFrame(() => {
                        window.dispatchEvent(new Event('resize'));
                    }),
                300,
            );
        }
    }, [loading, loaded, rest.data.length]);

    return (
        <div
            className={block({
                fullscreen: isFullScreen,
                loading: initialLoading,
                updating,
            })}
        >
            {updating && (
                <div className={block('updating-loader')}>
                    <Loader />
                </div>
            )}
            {initialLoading ? (
                <Loader />
            ) : (
                <DataTable theme="yt-internal" columns={dtColumns} rowKey={rowKey} {...rest} />
            )}
        </div>
    );
}
