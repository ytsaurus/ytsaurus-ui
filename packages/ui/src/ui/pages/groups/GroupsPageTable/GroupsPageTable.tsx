import React from 'react';
import cn from 'bem-cn-lite';
import {ConnectedProps, connect} from 'react-redux';
import DataTable from '@gravity-ui/react-data-table';

import {openAttributesModal} from '../../../store/actions/modals/attributes-modal';
import ColumnHeader from '../../../components/ColumnHeader/ColumnHeader';
import CommaSeparatedListWithRestCounter from '../../../components/CommaSeparateListWithRestCounter/CommaSeparateListWithRestCounter';
import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import {SubjectCard} from '../../../components/SubjectLink/SubjectLink';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import ExpandIcon from '../../../components/ExpandIcon/ExpandIcon';
import {Tooltip} from '../../../components/Tooltip/Tooltip';

import LoadDataHandler from '../../../components/LoadDataHandler/LoadDataHandler';

import {fetchGroups, setGroupsPageSorting, toggleGroupExpand} from '../../../store/actions/groups';
import {STICKY_TOOLBAR_BOTTOM} from '../../../components/WithStickyToolbar/WithStickyToolbar';
import GroupEditorDialog from '../../../pages/groups/GroupEditorDialog/GroupEditorDialog';
import {
    GroupsTreeNode,
    getGroupEditorVisible,
    getGroupsFlattenTree,
    getGroupsSort,
    getGroupsTableDataState,
} from '../../../store/selectors/groups';

import './GroupsPageTable.scss';
import {isIdmAclAvailable} from '../../../config';
import type {RootState} from '../../../store/reducers';
import type {OrderType} from '../../../utils/sort-helpers';
import {GroupActions} from '../GroupActions/GroupActions';

const block = cn('groups-page-table');

const TABLE_SETTINGS = {
    displayIndices: false,
    stickyHead: DataTable.MOVING,
    stickyTop: STICKY_TOOLBAR_BOTTOM,
    syncHeadOnResize: true,
    dynamicRender: true,
} as const;

const COLUMN_NAMES: Record<string, string> = {
    name: 'Name',
    idm: 'IDM',
    size: 'Size',
    responsibles: 'Responsible users',
    actions: '',
};

interface GroupsPageTableProps extends ConnectedProps<typeof connector> {
    className?: string;
}

class GroupsPageTable extends React.Component<GroupsPageTableProps> {
    componentDidMount() {
        const {fetchGroups} = this.props;
        fetchGroups();
    }

    renderColumnHeader(col: string, sortable: boolean) {
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
                onSort={this.onColumnSort}
            />
        );
    }

    onColumnSort = (colName: string, nextOrder: OrderType) => {
        const {setGroupsPageSorting} = this.props;
        setGroupsPageSorting(colName, nextOrder);
    };

    renderNameCell(col: string, {row}: {row: GroupsTreeNode}) {
        const {name, shift, hasChildren, expanded} = row;
        return (
            <div
                className={block('content', {
                    col,
                    shift: String(shift),
                    level: String(Math.min(10, shift!)),
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

    toggleExpand = (groupName: string) => {
        const {toggleGroupExpand} = this.props;
        toggleGroupExpand(groupName);
    };

    renderIdmCell(col: string, {row}: {row: GroupsTreeNode}) {
        const {idm} = row;
        return (
            <div className={block('content', {col})}>
                <div className={block(col)}>{idm && idm.toString()}</div>
            </div>
        );
    }

    renderUsersCell(col: 'members', {row}: {row: GroupsTreeNode}) {
        const {[col]: value} = row;
        return (
            <div className={block('content', {col})}>
                <CommaSeparatedListWithRestCounter
                    className={block('groups')}
                    items={value}
                    itemRenderer={(item: string) => {
                        if (item.startsWith('idm-group:')) {
                            return item;
                        } else {
                            return <SubjectCard name={item} />;
                        }
                    }}
                />
            </div>
        );
    }

    renderSizeCell(col: string, {row}: {row: GroupsTreeNode}) {
        const {members} = row;
        return (
            <div className={block('content', {col})}>
                <span>{members!.length}</span>
            </div>
        );
    }

    renderActionsCell(col: string, {row}: {row: GroupsTreeNode}) {
        const {name: groupname} = row;

        return <GroupActions className={block('content', {col})} groupname={groupname} />;
    }

    renderTable() {
        const {loaded, loading, groups} = this.props;

        const columnProps = (name: string, disableSorting = false) => {
            return {
                name,
                align: DataTable.LEFT,
                sortable: false,
                className: block('td', {col: name.toLowerCase()}),
                header: this.renderColumnHeader(name, !disableSorting),
            } as const;
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
            {
                ...columnProps('actions'),
                header: '',
                render: this.renderActionsCell.bind(this, 'actions'),
            },
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
                    <LoadDataHandler
                        loaded={true}
                        error={Boolean(error)}
                        errorData={error || undefined}
                    >
                        {this.renderTable()}
                    </LoadDataHandler>
                </div>
                {showEditor && <GroupEditorDialog />}
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = (state: RootState) => {
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
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(GroupsPageTable);
