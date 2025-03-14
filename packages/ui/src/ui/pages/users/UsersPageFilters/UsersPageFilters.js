import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Checkbox} from '@gravity-ui/uikit';

import Filter from '../../../components/Filter/Filter';

import {
    setUsersBannedFilter,
    setUsersGroupFilter,
    setUsersNameFilter,
} from '../../../store/actions/users';
import GroupSuggest from '../../../pages/components/GroupSuggest/GroupSuggest';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {
    getUsersBannedFilter,
    getUsersGroupFilter,
    getUsersNameFilter,
} from '../../../store/selectors/users';
import {GroupsLoader} from '../../../hooks/global';
import {ShowCreateUserModalButton} from '../CreateUserModal/CreateUserModal';

import './UsersPageFilters.scss';

const block = cn('users-page-filters');

class UsersPageFilters extends React.Component {
    static propTypes = {
        className: PropTypes.string,

        bannedFilter: PropTypes.bool.isRequired,
        setUsersBannedFilter: PropTypes.func.isRequired,

        groupFilter: PropTypes.string.isRequired,
        setUsersGroupFilter: PropTypes.func.isRequired,

        nameFilter: PropTypes.string.isRequired,
        setUsersNameFilter: PropTypes.func.isRequired,
    };

    toggleBannedFilter = () => {
        const {bannedFilter, setUsersBannedFilter} = this.props;
        setUsersBannedFilter(!bannedFilter);
    };

    render() {
        const {className, nameFilter, groupFilter, bannedFilter} = this.props;

        return (
            <Toolbar
                className={block(null, className)}
                itemsToWrap={[
                    {
                        name: 'name',
                        node: (
                            <Filter
                                className={block('username-filter')}
                                hasClear
                                size="m"
                                type="text"
                                value={nameFilter}
                                placeholder="User name filter..."
                                onChange={this.props.setUsersNameFilter}
                            />
                        ),
                        shrinkable: true,
                        growable: true,
                        wrapperClassName: block('item'),
                    },
                    {
                        name: 'group',
                        node: (
                            <GroupsLoader>
                                <GroupSuggest
                                    className={block('group-suggest')}
                                    value={groupFilter ? [groupFilter] : undefined}
                                    placeholder="Group name filter..."
                                    onChange={(vals) => this.props.setUsersGroupFilter(vals[0])}
                                    disablePortal={false}
                                />
                            </GroupsLoader>
                        ),
                        shrinkable: true,
                        growable: true,
                        wrapperClassName: block('item'),
                    },
                    {
                        name: 'banned',
                        node: (
                            <Checkbox
                                size="l"
                                checked={bannedFilter}
                                content="Banned"
                                onChange={this.toggleBannedFilter}
                            />
                        ),
                    },
                ]}
            >
                <ShowCreateUserModalButton />
            </Toolbar>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        bannedFilter: getUsersBannedFilter(state),
        nameFilter: getUsersNameFilter(state),
        groupFilter: getUsersGroupFilter(state),
    };
};

const mapDispatchToProps = {
    setUsersBannedFilter,
    setUsersNameFilter,
    setUsersGroupFilter,
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersPageFilters);
