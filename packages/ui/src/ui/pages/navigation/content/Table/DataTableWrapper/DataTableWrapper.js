import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import DataTable from '@gravity-ui/react-data-table';
import {Loader} from '@gravity-ui/uikit';
import {getSettingTableDisplayRawStrings} from '../../../../../store/selectors/settings';
import {getSchemaByName} from '../../../../../store/selectors/navigation/tabs/schema';
import {onCellPreview} from '../../../../../store/actions/navigation/modals/cell-preview';
import {prepareColumns} from '../../../../../utils/navigation/prepareColumns';

import './DataTableWrapper.scss';

const block = cn('data-table-wrapper');

const rowKey = (row, index) => index;

DataTableWrapper.propTypes = {
    isFullScreen: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    columns: PropTypes.array.isRequired,
    keyColumns: PropTypes.arrayOf(PropTypes.string),
    ysonSettings: PropTypes.object,
    yqlTypes: PropTypes.array,
};

export default function DataTableWrapper(props) {
    const dispatch = useDispatch();
    const useRawStrings = useSelector(getSettingTableDisplayRawStrings);
    const schemaByName = useSelector(getSchemaByName);

    const {columns, keyColumns, ysonSettings, yqlTypes, loading, loaded, isFullScreen, ...rest} =
        props;

    const onShowPreview = React.useCallback(
        (columnName, rowIndex, tag) => {
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
