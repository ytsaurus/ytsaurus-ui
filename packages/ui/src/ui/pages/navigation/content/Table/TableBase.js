import React, {useEffect} from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import DataTableWrapper from '../../../../pages/navigation/content/Table/DataTableWrapper/DataTableWrapper';
import TableOverview from '../../../../pages/navigation/content/Table/TableOverview/TableOverview';
import ColumnSelectorModal from '../../../../components/ColumnSelectorModal/ColumnSelectorModal';
import OffsetSelectorModal from '../../../../pages/navigation/content/Table/OffsetSelectorModal/OffsetSelectorModal';
import TableMeta from '../../../../pages/navigation/content/Table/TableMeta/TableMeta';
import LoadDataHandler from '../../../../containers/LoadDataHandler/LoadDataHandler';
import FullScreen from '../../../../components/FullScreen/FullScreen';
import {YsonSettingsPropTypes} from '../../../../components/Yson/Yson';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';

import {OVERVIEW_HEIGHT} from '../../../../constants/navigation/content/table';
import {HEADER_HEIGHT} from '../../../../constants/index';
import {selectIsYqlTypesEnabled} from '../../../../store/selectors/navigation/content/table';
import TableColumnsPresetNotice from './TableOverview/TableColumnsPresetNotice';
import i18n from './i18n';

const block = cn('navigation-table');

TableBase.columnsProps = PropTypes.arrayOf(
    PropTypes.shape({
        name: PropTypes.string.isRequired,
        data: PropTypes.shape({
            caption: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
        }).isRequired,
        keyColumn: PropTypes.bool.isRequired,
        checked: PropTypes.bool.isRequired,
        disabled: PropTypes.bool.isRequired,

        accessor: PropTypes.func,
        label: PropTypes.string,
    }),
);

TableBase.propTypes = {
    // from connect
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    errorData: PropTypes.object.isRequired,

    path: PropTypes.string.isRequired,
    isSplit: PropTypes.bool.isRequired,
    isDynamic: PropTypes.bool.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    settings: YsonSettingsPropTypes.isRequired,
    isColumnSelectorOpen: PropTypes.bool.isRequired,
    visibleRows: PropTypes.arrayOf(PropTypes.object).isRequired,

    columns: TableBase.columnsProps.isRequired,
    allColumns: TableBase.columnsProps.isRequired,
    srcColumns: TableBase.columnsProps.isRequired,
    keyColumns: PropTypes.arrayOf(PropTypes.string).isRequired,

    offsetValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    yqlTypes: PropTypes.array,

    updateColumns: PropTypes.func.isRequired,
    getTableData: PropTypes.func.isRequired,
    abortAndReset: PropTypes.func.isRequired,
    handleScreenChanged: PropTypes.func.isRequired,
    closeColumnSelectorModal: PropTypes.func.isRequired,
};

const renderColumnSelectorModal = (props) => {
    const {updateColumns, allColumns, srcColumns, isColumnSelectorOpen, closeColumnSelectorModal} =
        props;

    return (
        <ColumnSelectorModal
            items={allColumns}
            srcItems={srcColumns}
            onConfirm={updateColumns}
            isVisible={isColumnSelectorOpen}
            onCancel={closeColumnSelectorModal}
        />
    );
};

const renderTable = (props) => {
    const {
        visibleColumns,
        keyColumns,
        yqlTypes,
        settings,
        visibleRows,
        isDynamic,
        isFullScreen,
        offsetValue,
        loading,
        loaded,
        isSplit,
    } = props;

    let stickyTop;
    if (isSplit) {
        stickyTop = 0; // TODO: add sticky for the Overview in the split mode https://github.com/captivationsoftware/react-sticky/issues/282
    } else if (isFullScreen) {
        stickyTop = 0;
    } else {
        stickyTop = HEADER_HEIGHT + OVERVIEW_HEIGHT;
    }

    const tableSettings = {
        stickyTop,
        stickyHead: 'moving',
        syncHeadOnResize: true,
        sortable: false,
        stripedRows: true,
        displayIndices: !isDynamic,
    };

    return (
        <LoadDataHandler {...props} loaded={false}>
            <DataTableWrapper
                data={visibleRows}
                loaded={loaded}
                loading={loading}
                yqlTypes={yqlTypes}
                keyColumns={keyColumns}
                ysonSettings={settings}
                settings={tableSettings}
                columns={visibleColumns}
                isFullScreen={isFullScreen}
                emptyDataMessage={i18n('alert_no-items-to-show')}
                startIndex={!isDynamic ? offsetValue : undefined}
            />
        </LoadDataHandler>
    );
};

export function TableBase(props) {
    const {path, getTableData, abortAndReset, isSplit} = props;
    const isYqlV3Types = useSelector(selectIsYqlTypesEnabled);

    useEffect(() => {
        getTableData();
        return abortAndReset;
    }, [path, isYqlV3Types, abortAndReset]);

    const {isFullScreen, handleScreenChanged, isDynamic} = props;

    const toolbar = <TableOverview />;
    return (
        <div className={block()}>
            <TableMeta />
            <TableColumnsPresetNotice />
            <FullScreen
                className={block('fullscreen')}
                enabled={isFullScreen}
                onChange={handleScreenChanged}
            >
                {isSplit && !isFullScreen ? (
                    <React.Fragment>
                        {toolbar}
                        {renderTable(props)}
                    </React.Fragment>
                ) : (
                    <WithStickyToolbar
                        hideToolbarShadow
                        toolbarClassName={block('toolbar', {fullscreen: isFullScreen})}
                        toolbar={toolbar}
                        content={({sticky}) => renderTable({...props, sticky})}
                    />
                )}
            </FullScreen>
            {renderColumnSelectorModal(props)}
            {isDynamic && <OffsetSelectorModal />}
        </div>
    );
}
