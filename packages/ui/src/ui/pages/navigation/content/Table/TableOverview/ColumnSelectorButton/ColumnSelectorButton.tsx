import {connect} from 'react-redux';

import {openColumnSelectorModal} from '../../../../../../store/actions/navigation/content/table/table';
import {
    selectAllColumns,
    selectVisibleColumns,
} from '../../../../../../store/selectors/navigation/content/table';
import {selectSchemaStrict} from '../../../../../../store/selectors/navigation/tabs/schema';
import {type RootState} from '../../../../../../store/reducers';

import {ColumnSelectorButtonBase} from './ColumnSelectorButtonBase';

const mapStateToProps = (state: RootState) => {
    const {loading} = state.navigation.content.table;

    const visibleColumns = selectVisibleColumns(state);
    const allColumns = selectAllColumns(state);
    const isStrict = selectSchemaStrict(state);

    return {visibleColumns, loading, allColumns, isStrict};
};

const mapDispatchToProps = {
    openColumnSelectorModal,
};

export const ColumnSelectorButton = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ColumnSelectorButtonBase);
