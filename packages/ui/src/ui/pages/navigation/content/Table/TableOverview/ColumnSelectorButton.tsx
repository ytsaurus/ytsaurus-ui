import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Icon from '../../../../../components/Icon/Icon';
import Button from '../../../../../components/Button/Button';

import {openColumnSelectorModal} from '../../../../../store/actions/navigation/content/table/table';
import {
    getAllColumns,
    getVisibleColumns,
} from '../../../../../store/selectors/navigation/content/table';
import {getSchemaStrict} from '../../../../../store/selectors/navigation/tabs/schema';
import {Secondary} from '../../../../../components/Text/Text';
import ColumnsPresetButton from './ColumnsPresetButton';
import {RootState} from '../../../../../store/reducers';
import {getConfigData} from '../../../../../config/ui-settings';

ColumnSelectorButton.propTypes = {
    // from parent
    block: PropTypes.func.isRequired,

    // from connect
    visibleColumns: PropTypes.array.isRequired,
    allColumns: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,

    openColumnSelectorModal: PropTypes.func.isRequired,
};

const actionStyle = {marginRight: 1};

interface Props {
    loading?: boolean;
    isStrict?: boolean;
    allColumns: Array<unknown>;
    visibleColumns: Array<unknown>;
    openColumnSelectorModal: () => void;
}

function ColumnSelectorButton({
    loading,
    isStrict,
    allColumns,
    visibleColumns,
    openColumnSelectorModal,
}: Props) {
    const allowPickColumns = !loading || isStrict;
    const showAllColumns = allColumns.length === visibleColumns.length;
    const view = showAllColumns ? 'outlined' : 'action';

    const {allowUserColumnPresets} = getConfigData();
    return (
        <React.Fragment>
            <Button
                size="m"
                disabled={!allowPickColumns}
                title="Choose columns"
                onClick={openColumnSelectorModal}
                view={view}
                pin={allowUserColumnPresets ? 'round-brick' : 'round-round'}
                style={showAllColumns ? undefined : actionStyle}
                qa="table-columns-button"
            >
                <Icon awesome="filter" face="solid" />
                Columns
                <Secondary disabled={!showAllColumns}>
                    {' '}
                    {visibleColumns.length + '/' + allColumns.length}
                </Secondary>
            </Button>
            {allowUserColumnPresets && (
                <ColumnsPresetButton view={view} disabled={!allowPickColumns} />
            )}
        </React.Fragment>
    );
}

const mapStateToProps = (state: RootState) => {
    const {loading} = state.navigation.content.table;

    const visibleColumns = getVisibleColumns(state);
    const allColumns = getAllColumns(state);
    const isStrict = getSchemaStrict(state);

    return {visibleColumns, loading, allColumns, isStrict};
};

const mapDispatchToProps = {
    openColumnSelectorModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(ColumnSelectorButton);
