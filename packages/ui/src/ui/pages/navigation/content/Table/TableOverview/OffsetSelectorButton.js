import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Icon from '../../../../../components/Icon/Icon';
import Button from '../../../../../components/Button/Button';

import {openOffsetSelectorModal} from '../../../../../store/actions/navigation/content/table/pagination';
import {
    selectAllColumns,
    selectVisibleColumns,
} from '../../../../../store/selectors/navigation/content/table';

import i18n from './i18n';

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
            title={i18n('title_edit-offset')}
            onClick={openOffsetSelectorModal}
            pin="round-clear"
        >
            <Icon awesome="key" />
            &nbsp; {i18n('action_keys')} &nbsp;
            <span className="elements-secondary-text">
                {visibleColumns.length + '/' + allColumns.length}
            </span>
        </Button>
    );
}

const mapStateToProps = (state) => {
    const {loading} = state.navigation.content.table;

    const visibleColumns = selectVisibleColumns(state).filter((column) => column.keyColumn);
    const allColumns = selectAllColumns(state).filter((column) => column.keyColumn);

    return {visibleColumns, loading, allColumns};
};

const mapDispatchToProps = {
    openOffsetSelectorModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(OffsetSelectorButton);
