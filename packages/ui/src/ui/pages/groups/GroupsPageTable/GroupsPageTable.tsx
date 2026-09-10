import {connect} from 'react-redux';

import {openAttributesModal} from '../../../store/actions/modals/attributes-modal';

import {fetchGroups, setGroupsPageSorting, toggleGroupExpand} from '../../../store/actions/groups';
import {
    selectGroupEditorVisible,
    selectGroupsFlattenTree,
    selectGroupsSort,
    selectGroupsTableDataState,
} from '../../../store/selectors/groups';

import './GroupsPageTable.scss';
import {type RootState} from '../../../store/reducers';

import {GroupsPageTableBase} from './GroupsPageTableBase';

const mapStateToProps = (state: RootState) => {
    const {loaded, loading, error} = selectGroupsTableDataState(state);
    const groups = selectGroupsFlattenTree(state);
    const sort = selectGroupsSort(state);
    const showEditor = selectGroupEditorVisible(state);

    return {
        loaded,
        loading,
        error,

        groups,
        sort,
        showEditor,
    };
};

const mapDispatchToProps = {
    fetchGroups,
    setGroupsPageSorting,
    toggleGroupExpand,
    openAttributesModal,
};

const GroupsPageTable = connect(mapStateToProps, mapDispatchToProps)(GroupsPageTableBase);

export default GroupsPageTable;
