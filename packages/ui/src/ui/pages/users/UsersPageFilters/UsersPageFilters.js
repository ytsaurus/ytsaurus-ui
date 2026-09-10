import {connect} from 'react-redux';

import {
    setUsersBannedFilter,
    setUsersGroupFilter,
    setUsersNameFilter,
} from '../../../store/actions/users/index';
import {
    selectUsersBannedFilter,
    selectUsersGroupFilter,
    selectUsersNameFilter,
} from '../../../store/selectors/users';

import './UsersPageFilters.scss';

import {UsersPageFiltersBase} from './UsersPageFiltersBase';

const mapStateToProps = (state) => {
    return {
        bannedFilter: selectUsersBannedFilter(state),
        nameFilter: selectUsersNameFilter(state),
        groupFilter: selectUsersGroupFilter(state),
    };
};

const mapDispatchToProps = {
    setUsersBannedFilter,
    setUsersNameFilter,
    setUsersGroupFilter,
};

const UsersPageFilters = connect(mapStateToProps, mapDispatchToProps)(UsersPageFiltersBase);

export default UsersPageFilters;
