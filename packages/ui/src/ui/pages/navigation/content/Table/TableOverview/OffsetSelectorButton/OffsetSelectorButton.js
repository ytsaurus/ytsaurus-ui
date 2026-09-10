import {connect} from 'react-redux';

import {openOffsetSelectorModal} from '../../../../../../store/actions/navigation/content/table/pagination';
import {
    selectAllColumns,
    selectVisibleColumns,
} from '../../../../../../store/selectors/navigation/content/table';

import {OffsetSelectorButtonBase} from './OffsetSelectorButtonBase';

const mapStateToProps = (state) => {
    const {loading} = state.navigation.content.table;

    const visibleColumns = selectVisibleColumns(state).filter((column) => column.keyColumn);
    const allColumns = selectAllColumns(state).filter((column) => column.keyColumn);

    return {visibleColumns, loading, allColumns};
};

const mapDispatchToProps = {
    openOffsetSelectorModal,
};

export const OffsetSelectorButton = connect(
    mapStateToProps,
    mapDispatchToProps,
)(OffsetSelectorButtonBase);
