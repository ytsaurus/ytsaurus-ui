import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import DataTable from '@gravity-ui/react-data-table';

import {fetchUsers, setUsersPageSorting} from '../../../store/actions/users';
import ColumnHeader from '../../../components/ColumnHeader/ColumnHeader';
import CommaSeparatedListWithRestCounter from '../../../components/CommaSeparateListWithRestCounter/CommaSeparateListWithRestCounter';
import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';
import {SubjectCard} from '../../../components/SubjectLink/SubjectLink';
import {STICKY_TOOLBAR_BOTTOM} from '../../../components/WithStickyToolbar/WithStickyToolbar';
import UsersPageEditor from '../../../pages/users/UsersPageEditor/UsersPageEditor';
import {DeleteUserModal} from '../../../pages/users/DeleteUserModal/DeleteUserModal';
import {getCluster} from '../../../store/selectors/global';
import {
    getUsersFilteredAndSorted,
    getUsersPageEditableUser,
    getUsersTableDataState,
} from '../../../store/selectors/users';
import {isIdmAclAvailable} from '../../../config';

import './UsersPageTable.scss';
import {UserActions} from '../UserActions/UserActions';

const block = cn('users-page-table');

const TABLE_SETTINGS = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
    syncHeadOnResize: true,
    dynamicRender: true,
};

const COLUMN_NAMES = {
    name: 'Name',
    banned: 'Banned',
    member_of: 'Groups',
    transitiveGroups: 'Transitive groups',
    request_queue_size_limit: 'Request queue',
    read_request_rate_limit: 'Read request rate',
    write_request_rate_limit: 'Write request rate',
    upravlyator_managed: 'IDM',

    // pseudo columns
    actions: '',
};

const SHOR_COLUMN_NAMES = {
    banned: 'B',
    request_queue_size_limit: 'RQ',
    read_request_rate_limit: 'RRR',
    write_request_rate_limit: 'WRR',
};

class UsersPageTable extends React.Component {
    static propTypes = {
        className: PropTypes.string,

        loading: PropTypes.bool,
        loaded: PropTypes.bool.isRequired,

        users: PropTypes.array.isRequired,
        cluster: PropTypes.string.isRequired,
        fetchUsers: PropTypes.func.isRequired,
        setUsersPageSorting: PropTypes.func.isRequired,

        sort: PropTypes.shape({
            column: PropTypes.string,
            order: PropTypes.string,
        }),

        showModal: PropTypes.bool,
        showUserEditorModal: PropTypes.func,
    };

    componentDidMount() {
        const {fetchUsers} = this.props;
        fetchUsers();
    }

    renderColumnHeader = (col, sortable) => {
        const {
            sort: {column, order},
        } = this.props;
        const isSorted = col === column;

        const title = COLUMN_NAMES[col];

        return (
            <ColumnHeader
                className={block('header-cell', {col, sortable}, 'data-table__head-cell')}
                column={col}
                title={title}
                shortTitle={SHOR_COLUMN_NAMES[col] || title}
                order={isSorted ? order : ''}
                onSort={this.onColumnSort}
                withUndefined
            />
        );
    };

    onColumnSort = (colName, nextOrder) => {
        const {setUsersPageSorting} = this.props;
        setUsersPageSorting({column: colName, order: nextOrder});
    };

    renderNameCell(col, {row} = {}) {
        const {name, upravlyator_managed: idm} = row;
        return (
            <div className={block('content', {col})}>
                <SubjectCard name={name} internal={!idm} />
            </div>
        );
    }

    renderBannedCell(col, {row} = {}) {
        const {banned, ban_message: banMessage} = row;
        return (
            <Tooltip content={banMessage}>
                <div className={block('content', {col})}>
                    {banned && <span className={block(col)}>B</span>}
                </div>
            </Tooltip>
        );
    }

    renderIdmCell = (col, {row} = {}) => {
        const {upravlyator_managed: idm} = row;
        return (
            <div className={block('content', {col})}>
                <div className={block(col)}>{idm && idm.toString()}</div>
            </div>
        );
    };

    renderGroupsCell(col, {row} = {}) {
        const {[col]: value} = row;
        return (
            <div className={block('content', {col})}>
                <CommaSeparatedListWithRestCounter className={block('groups')} items={value} />
            </div>
        );
    }

    renderNumberCell = (col, {row} = {}) => {
        const {[col]: value} = row;
        return (
            <div className={block('content', {col})}>
                <span>{value}</span>
            </div>
        );
    };

    renderActionsCell = (col, cluster, {row} = {}) => {
        const {name: username} = row;
        return (
            <UserActions
                className={block('content', {col})}
                username={username}
                cluster={cluster}
            />
        );
    };

    renderTable() {
        const {cluster, users, loaded, loading} = this.props;

        const columnProps = (name, disableSorting = false) => {
            return {
                name,
                align: DataTable.LEFT,
                sortable: false,
                className: block('td', {col: name.toLowerCase()}),
                header: this.renderColumnHeader(name, !disableSorting),
            };
        };

        const DISABLED_SORTING = true;

        const columns = [
            {
                ...columnProps('name'),
                render: this.renderNameCell.bind(this, 'name'),
            },
            {
                ...columnProps('banned'),
                render: this.renderBannedCell.bind(this, 'banned'),
                align: DataTable.CENTER,
            },
            ...(!isIdmAclAvailable()
                ? []
                : [
                      {
                          ...columnProps('upravlyator_managed'),
                          render: this.renderIdmCell.bind(this, 'upravlyator_managed'),
                      },
                  ]),
            {
                ...columnProps('member_of', DISABLED_SORTING),
                render: this.renderGroupsCell.bind(this, 'member_of'),
            },
            {
                ...columnProps('transitiveGroups', DISABLED_SORTING),
                render: this.renderGroupsCell.bind(this, 'transitiveGroups'),
            },
            {
                ...columnProps('request_queue_size_limit'),
                render: this.renderNumberCell.bind(this, 'request_queue_size_limit'),
                align: 'right',
            },
            {
                ...columnProps('read_request_rate_limit'),
                render: this.renderNumberCell.bind(this, 'read_request_rate_limit'),
                align: 'right',
            },
            {
                ...columnProps('write_request_rate_limit'),
                render: this.renderNumberCell.bind(this, 'write_request_rate_limit'),
                align: 'right',
            },
            {
                ...columnProps('actions'),
                header: '',
                render: this.renderActionsCell.bind(this, 'actions', cluster),
            },
        ];

        return (
            <DataTableYT
                loaded={loaded}
                loading={loading}
                className={block('table')}
                data={users}
                columns={columns}
                settings={TABLE_SETTINGS}
                theme={'yt-internal'}
            />
        );
    }

    render() {
        const {className, error, showModal} = this.props;
        return (
            <div className={block(null, className)}>
                <LoadDataHandler loaded={true} error={Boolean(error)} errorData={error || null}>
                    {this.renderTable()}
                    {showModal && <UsersPageEditor />}
                    <DeleteUserModal />
                </LoadDataHandler>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {loaded, loading, error, sort} = getUsersTableDataState(state);
    const {showModal} = getUsersPageEditableUser(state);
    return {
        loaded,
        loading,
        error,
        users: getUsersFilteredAndSorted(state),
        sort,
        cluster: getCluster(state),
        showModal,
    };
};

const mapDispatchToProps = {
    fetchUsers,
    setUsersPageSorting,
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersPageTable);
