import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import DataTable from '@gravity-ui/react-data-table';

import {openAttributesModal} from '../../../store/actions/modals/attributes-modal';
import ClickableAttributesButton from '../../../components/AttributesButton/ClickableAttributesButton';
import ColumnHeader from '../../../components/ColumnHeader/ColumnHeader';
import CommaSeparatedListWithRestCounter from '../../../components/CommaSeparateListWithRestCounter/CommaSeparateListWithRestCounter';
import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import {UserCard} from '../../../components/UserLink/UserLink';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import ExpandIcon from '../../../components/ExpandIcon/ExpandIcon';
import Icon from '../../../components/Icon/Icon';
import Link from '../../../components/Link/Link';
import {Tooltip} from '../../../components/Tooltip/Tooltip';

import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';

import {
    fetchGroups,
    openGroupEditorModal,
    setGroupsPageSorting,
    toggleGroupExpand,
} from '../../../store/actions/groups';
import {STICKY_TOOLBAR_BOTTOM} from '../../../components/WithStickyToolbar/WithStickyToolbar';
import GroupEditorDialog from '../../../pages/groups/GroupEditorDialog/GroupEditorDialog';
import {
    getGroupEditorVisible,
    getGroupsFlattenTree,
    getGroupsSort,
    getGroupsTableDataState,
} from '../../../store/selectors/groups';

import './GroupsPageTable.scss';
import {isIdmAclAvailable} from '../../../config';

const block = cn('groups-page-table');

const TABLE_SETTINGS = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
    syncHeadOnResize: true,
    dynamicRender: true,
};

const COLUMN_NAMES = {
    name: 'Name',
    idm: 'IDM',
    size: 'Size',
    responsibles: 'Responsible users',
    actions: '',
};

GroupActions.propTypes = {
    className: PropTypes.string,
    groupname: PropTypes.string.isRequired,
    edit: PropTypes.func,
    showAttributes: PropTypes.func.isRequired,
};

function GroupActions({className, groupname, edit, showAttributes}) {
    const onEdit = React.useCallback(() => {
        edit(groupname);
    }, [groupname, edit]);

    return (
        <div className={className}>
            <ClickableAttributesButton
                title={groupname}
                path={`//sys/groups/${groupname}`}
                openAttributesModal={showAttributes}
            />
            {edit && (
                <Link onClick={onEdit} className={block('edit-action')}>
                    <Icon awesome="pencil-alt" />
                </Link>
            )}
        </div>
    );
}

class GroupsPageTable extends React.Component {
    static GroupPropType = {
        name: PropTypes.string.isRequired,
        memberOf: PropTypes.arrayOf(PropTypes.string.isRequired),
        responsibles: PropTypes.arrayOf(PropTypes.string.isRequired),
        idm: PropTypes.any, // boolean | string | undefined
        shift: PropTypes.number,
        hasChildren: PropTypes.bool,
    };

    static propTypes = {
        className: PropTypes.string,
        loading: PropTypes.bool,
        loaded: PropTypes.bool.isRequired,
        error: PropTypes.object,

        groups: PropTypes.arrayOf(PropTypes.shape(GroupsPageTable.GroupPropType)),
        sort: PropTypes.shape({
            column: PropTypes.string,
            order: PropTypes.string,
        }),

        currentUserName: PropTypes.string,

        showEditor: PropTypes.bool,
        fetchGroups: PropTypes.func.isRequired,
        toggleGroupExpand: PropTypes.func.isRequired,
        setGroupsPageSorting: PropTypes.func.isRequired,
        openAttributesModal: PropTypes.func.isRequired,
        openGroupEditorModal: PropTypes.func,
    };

    componentDidMount() {
        const {fetchGroups} = this.props;
        fetchGroups();
    }

    renderColumnHeader(col, sortable) {
        const {
            sort: {column, order},
        } = this.props;
        const isSorted = col === column;

        return (
            <ColumnHeader
                className={block('header-cell', {col, sortable}, 'data-table__head-cell')}
                column={col}
                title={COLUMN_NAMES[col]}
                order={isSorted ? order : ''}
                toggleSort={this.onColumnSort}
                sortable={sortable}
            />
        );
    }

    onColumnSort = (colName, nextOrder) => {
        const {setGroupsPageSorting} = this.props;
        setGroupsPageSorting(colName, nextOrder);
    };

    renderNameCell(col, {row}) {
        const {name, shift, hasChildren, expanded} = row;
        return (
            <div
                className={block('content', {
                    col,
                    shift,
                    level: Math.min(10, shift),
                })}
            >
                <ExpandIcon
                    data={name}
                    visible={hasChildren}
                    onClick={this.toggleExpand}
                    expanded={expanded}
                />
                <Tooltip content={name}>
                    <span className={block('group-name')}>{name}</span>
                </Tooltip>
            </div>
        );
    }

    toggleExpand = (groupName) => {
        const {toggleGroupExpand} = this.props;
        toggleGroupExpand(groupName);
    };

    renderIdmCell(col, {row}) {
        const {idm} = row;
        return (
            <div className={block('content', {col})}>
                <div className={block(col)}>{idm && idm.toString()}</div>
            </div>
        );
    }

    renderUsersCell(col, {row}) {
        const {[col]: value} = row;
        return (
            <div className={block('content', {col})}>
                <CommaSeparatedListWithRestCounter
                    className={block('groups')}
                    items={value}
                    itemRenderer={(item) => {
                        if (item.startsWith('idm-group:')) {
                            return item;
                        } else {
                            return <UserCard userName={item} />;
                        }
                    }}
                />
            </div>
        );
    }

    renderSizeCell(col, {row}) {
        const {members} = row;
        return (
            <div className={block('content', {col})}>
                <span>{members.length}</span>
            </div>
        );
    }

    renderActionsCell(col, {row}) {
        const {openGroupEditorModal} = this.props;
        const {name: groupname, idm} = row;
        const allowEdit = idm;
        return (
            <GroupActions
                className={block('content', {col})}
                showAttributes={openGroupEditorModal}
                edit={allowEdit ? this.onEdit : undefined}
                groupname={groupname}
            />
        );
    }

    onEdit = (groupName) => {
        const {openGroupEditorModal} = this.props;
        openGroupEditorModal(groupName);
    };

    renderTable() {
        const {loaded, loading, groups} = this.props;

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
            ...(!isIdmAclAvailable()
                ? []
                : [
                      {
                          ...columnProps('idm'),
                          render: this.renderIdmCell.bind(this, 'idm'),
                      },
                  ]),
            {
                ...columnProps('members', DISABLED_SORTING),
                render: this.renderUsersCell.bind(this, 'members'),
            },
            {
                ...columnProps('size'),
                render: this.renderSizeCell.bind(this, 'size'),
            },
            ...(!isIdmAclAvailable()
                ? []
                : [
                      {
                          ...columnProps('actions'),
                          header: '',
                          render: this.renderActionsCell.bind(this, 'actions'),
                      },
                  ]),
        ];

        return (
            <DataTableYT
                loaded={loaded}
                loading={loading}
                data={groups}
                columns={columns}
                settings={TABLE_SETTINGS}
                theme={'yt-internal'}
            />
        );
    }

    render() {
        const {className, error, showEditor} = this.props;
        return (
            <ErrorBoundary>
                <div className={block(null, className)}>
                    <LoadDataHandler loaded={true} error={Boolean(error)} errorData={error || null}>
                        {this.renderTable()}
                    </LoadDataHandler>
                </div>
                {showEditor && <GroupEditorDialog />}
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state) => {
    const {loaded, loading, error} = getGroupsTableDataState(state);
    const groups = getGroupsFlattenTree(state);
    const sort = getGroupsSort(state);
    const showEditor = getGroupEditorVisible(state);

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
    openGroupEditorModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupsPageTable);
