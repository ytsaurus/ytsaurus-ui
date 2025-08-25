import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import DataTable from '@gravity-ui/react-data-table';
import {Loader} from '@gravity-ui/uikit';

import {getSettingTableDisplayRawStrings} from '../../../../../store/selectors/settings';
import {getSchemaByName} from '../../../../../store/selectors/navigation/tabs/schema';
import {YsonSettings} from '../../../../../store/selectors/thor/unipika';
import {onCellPreview} from '../../../../../store/actions/navigation/modals/cell-preview';
import {NameWithSortOrder, prepareColumns} from '../../../../../utils/navigation/prepareColumns';
import {TypeArray} from '../../../../../components/SchemaDataType/dataTypes';

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

    const onShowPreview = React.useCallback(
        (columnName: string, rowIndex: number, tag?: string) => {
            return dispatch(onCellPreview({columnName, rowIndex, tag}));
        },
        [dispatch],
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
