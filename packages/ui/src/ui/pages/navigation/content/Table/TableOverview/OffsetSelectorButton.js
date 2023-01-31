import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Icon from '../../../../../components/Icon/Icon';
import Button from '../../../../../components/Button/Button';

import {openOffsetSelectorModal} from '../../../../../store/actions/navigation/content/table/pagination';
import {
    getAllColumns,
    getVisibleColumns,
} from '../../../../../store/selectors/navigation/content/table';

OffsetSelectorButton.propTypes = {
    // from parent
    disabled: PropTypes.bool,

    // from connect
    visibleColumns: PropTypes.array.isRequired,
    allColumns: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,

    openOffsetSelectorModal: PropTypes.func.isRequired,
};

function OffsetSelectorButton({
    loading,
    disabled,
    allColumns,
    visibleColumns,
    openOffsetSelectorModal,
}) {
    return (
        <Button
            size="m"
            disabled={loading || disabled}
            title="Edit offset"
            onClick={openOffsetSelectorModal}
            pin="round-clear"
        >
            <Icon awesome="key" />
            &nbsp; Keys &nbsp;
            <span className="elements-secondary-text">
                {visibleColumns.length + '/' + allColumns.length}
            </span>
        </Button>
    );
}

const mapStateToProps = (state) => {
    const {loading} = state.navigation.content.table;

    const visibleColumns = getVisibleColumns(state).filter((column) => column.keyColumn);
    const allColumns = getAllColumns(state).filter((column) => column.keyColumn);

    return {visibleColumns, loading, allColumns};
};

const mapDispatchToProps = {
    openOffsetSelectorModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(OffsetSelectorButton);
