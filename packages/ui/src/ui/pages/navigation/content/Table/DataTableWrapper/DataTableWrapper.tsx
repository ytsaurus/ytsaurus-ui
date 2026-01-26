import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';
import DataTable from '@gravity-ui/react-data-table';

import {Loader} from '@gravity-ui/uikit';

import {TypeArray} from '../../../../../components/SchemaDataType/dataTypes';
import {useResizeEventForTable} from '../../../../../components/UseResizeEventForTable/UseResizeEventForTable';

import {injectTableCellData} from '../../../../../store/actions/navigation/content/table/table-ts';
import {getOffsetValue} from '../../../../../store/selectors/navigation/content/table';
import {getSchemaByName} from '../../../../../store/selectors/navigation/tabs/schema';
import {getSettingTableDisplayRawStrings} from '../../../../../store/selectors/settings';
import {shouldUseYqlTypes} from '../../../../../store/selectors/settings/settings-development';
import {YsonSettings} from '../../../../../store/selectors/thor/unipika';
import {onCellPreview} from '../../../../../store/actions/navigation/modals/cell-preview';
import {NameWithSortOrder, prepareColumns} from '../../../../../utils/navigation/prepareColumns';
import {
    CellDataHandlerNavigation,
    isInlinePreviewAllowed,
    onErrorTableCellPreview,
} from '../../../../../types/navigation/table-cell-preview';
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
    const useRawStrings = useSelector(getSettingTableDisplayRawStrings);
    const useYqlTypes = useSelector(shouldUseYqlTypes);
    const schemaByName = useSelector(getSchemaByName);

    const {columns, keyColumns, ysonSettings, yqlTypes, loading, loaded, isFullScreen, ...rest} =
        props;

    const {onShowPreview} = useShowPrevewHandler();

    const dtColumns = prepareColumns({
        columns,
        keyColumns,
        yqlTypes,
        ysonSettings,
        useRawStrings,
        schemaByName,
        onShowPreview,
        useYqlTypes,
    });
    const initialLoading = loading && !loaded;
    const updating = loading && loaded;

    useResizeEventForTable({length: !loading && loaded ? rest.data.length : undefined});

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

function useShowPrevewHandler() {
    const dispatch = useDispatch();
    const offsetValue = useSelector(getOffsetValue);

    const {dataHandler, onShowPreview} = React.useMemo(() => {
        const cancelHelper = new CancelHelper();

        const dataHandler = {
            cancelHelper,
            saveCancellation: (token) => {
                cancelHelper.saveCancelToken(token);
            },
            onStartLoading: () => {},
            onError: onErrorTableCellPreview,
            onSuccess: ({data, columnName, rowIndex}) => {
                dispatch(injectTableCellData({data, offsetValue, columnName, rowIndex}));
            },
        } as CellDataHandlerNavigation & {cancelHelper: CancelHelper};

        const onShowPreview = (columnName: string, rowIndex: number, tag?: string) => {
            const allowInjectData = isInlinePreviewAllowed(tag);
            return dispatch(
                onCellPreview({
                    columnName,
                    rowIndex,
                    tag,
                    dataHandler: allowInjectData ? dataHandler : undefined,
                }),
            );
        };

        return {onShowPreview, dataHandler};
    }, [dispatch, offsetValue]);

    React.useEffect(() => {
        return () => {
            dataHandler.cancelHelper.removeAllRequests();
        };
    }, [dataHandler]);

    return {onShowPreview};
}
