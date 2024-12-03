/* eslint-disable react/prop-types */
import {StickyContainer} from 'react-sticky';
import React, {useEffect} from 'react';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import cn from 'bem-cn-lite';

import DataTableWrapper from '../../../../pages/navigation/content/Table/DataTableWrapper/DataTableWrapper';
import TableOverview from '../../../../pages/navigation/content/Table/TableOverview/TableOverview';
import ColumnSelectorModal from '../../../../components/ColumnSelectorModal/ColumnSelectorModal';
import OffsetSelectorModal from '../../../../pages/navigation/content/Table/OffsetSelectorModal/OffsetSelectorModal';
import TableMeta from '../../../../pages/navigation/content/Table/TableMeta/TableMeta';
import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import FullScreen from '../../../../components/FullScreen/FullScreen';
import Yson from '../../../../components/Yson/Yson';

import {OVERVIEW_HEIGHT} from '../../../../constants/navigation/content/table';
import {getPath} from '../../../../store/selectors/navigation';
import {HEADER_HEIGHT} from '../../../../constants/index';
import {
    abortAndReset,
    closeColumnSelectorModal,
    getTableData,
    handleScreenChanged,
    updateColumns,
} from '../../../../store/actions/navigation/content/table/table';
import {
    getAllColumns,
    getOffsetValue,
    getSrcColumns,
    getVisibleColumns,
    getVisibleRows,
} from '../../../../store/selectors/navigation/content/table';
import {
    getColumns,
    getIsDynamic,
    getKeyColumns,
    getNavigationTableLoadingState,
    getYqlTypes,
} from '../../../../store/selectors/navigation/content/table-ts';
import {getCluster} from '../../../../store/selectors/global';
import {getTableYsonSettings} from '../../../../store/selectors/thor/unipika';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {isFinalLoadingStatus} from '../../../../utils/utils';

import './Table.scss';
import TableColumnsPresetNotice from './TableOverview/TableColumnsPresetNotice';
import {makeTableRumId} from '../../../../store/actions/navigation/content/table/table-rum-id';

const block = cn('navigation-table');

Table.columnsProps = PropTypes.arrayOf(
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

Table.propTypes = {
    // from connect
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    errorData: PropTypes.object.isRequired,

    path: PropTypes.string.isRequired,
    isSplit: PropTypes.bool.isRequired,
    isDynamic: PropTypes.bool.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    settings: Yson.settingsProps.isRequired,
    isColumnSelectorOpen: PropTypes.bool.isRequired,
    visibleRows: PropTypes.arrayOf(PropTypes.object).isRequired,

    columns: Table.columnsProps.isRequired,
    allColumns: Table.columnsProps.isRequired,
    srcColumns: Table.columnsProps.isRequired,
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
                emptyDataMessage="No items to show"
                startIndex={!isDynamic ? offsetValue : undefined}
            />
        </LoadDataHandler>
    );
};

function Table(props) {
    const {path, getTableData, abortAndReset} = props;
    useEffect(() => {
        getTableData();
        return abortAndReset;
    }, [path]);

    const {isFullScreen, handleScreenChanged, isDynamic} = props;
    return (
        <div className={block()}>
            <TableMeta />
            <TableColumnsPresetNotice />
            <FullScreen
                className={block('fullscreen')}
                enabled={isFullScreen}
                onChange={handleScreenChanged}
            >
                <StickyContainer>
                    <TableOverview />
                    {renderTable(props)}
                </StickyContainer>
            </FullScreen>
            {renderColumnSelectorModal(props)}
            {isDynamic && <OffsetSelectorModal />}
        </div>
    );
}

const mapStateToProps = (state) => {
    const {loading, loaded, error, errorData, isColumnSelectorOpen, isFullScreen} =
        state.navigation.content.table;
    const settings = getTableYsonSettings(state);
    const {isSplit} = state.global.splitScreen;

    const path = getPath(state);
    const columns = getColumns(state);
    const yqlTypes = getYqlTypes(state);
    const isDynamic = getIsDynamic(state);
    const keyColumns = getKeyColumns(state);
    const allColumns = getAllColumns(state);
    const srcColumns = getSrcColumns(state);
    const visibleRows = getVisibleRows(state);
    const offsetValue = getOffsetValue(state);
    const visibleColumns = getVisibleColumns(state);

    return {
        loading,
        loaded,
        error,
        errorData,
        columns,
        keyColumns,
        allColumns,
        srcColumns,
        visibleColumns,
        isSplit,
        path,
        isDynamic,
        visibleRows,
        yqlTypes,
        settings,
        offsetValue,
        isColumnSelectorOpen,
        isFullScreen,
    };
};

const mapDispatchToProps = {
    updateColumns,
    getTableData,
    abortAndReset,
    handleScreenChanged,
    closeColumnSelectorModal,
};

const TableConnected = compose(connect(mapStateToProps, mapDispatchToProps))(Table);

export default function TableWithRum() {
    const loadState = useSelector(getNavigationTableLoadingState);
    const isDynamic = useSelector(getIsDynamic);
    const cluster = useSelector(getCluster);

    const measureId = makeTableRumId({cluster, isDynamic}).getMeasureId();

    useAppRumMeasureStart({
        type: measureId,
        startDeps: [loadState, measureId],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: measureId,
        stopDeps: [loadState, measureId],
        sybType: isDynamic ? 'dynamic' : 'static',
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <TableConnected />;
}
