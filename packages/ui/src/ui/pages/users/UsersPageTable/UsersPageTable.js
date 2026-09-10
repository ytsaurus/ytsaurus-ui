import {connect} from 'react-redux';

import {fetchUsers, setUsersPageSorting} from '../../../store/actions/users/index';
import {selectCluster} from '../../../store/selectors/global';
import {
    selectUsersFilteredAndSorted,
    selectUsersPageEditableUser,
    selectUsersTableDataState,
} from '../../../store/selectors/users';

import './UsersPageTable.scss';

import {UsersPageTableBase} from './UsersPageTableBase';

const mapStateToProps = (state) => {
    const {loaded, loading, error, sort} = selectUsersTableDataState(state);
    const {showModal} = selectUsersPageEditableUser(state);
    return {
        loaded,
        loading,
        error,
        users: selectUsersFilteredAndSorted(state),
        sort,
        cluster: selectCluster(state),
        showModal,
    };
};

const mapDispatchToProps = {
    fetchUsers,
    setUsersPageSorting,
};

const UsersPageTable = connect(mapStateToProps, mapDispatchToProps)(UsersPageTableBase);

export default UsersPageTable;
