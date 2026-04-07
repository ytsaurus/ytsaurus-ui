import {Power} from '@gravity-ui/icons';
import type {Column} from '@gravity-ui/react-data-table';
import cn from 'bem-cn-lite';
import React from 'react';
import {DataTableYT} from '../../../components/DataTableYT';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Icon from '../../../components/Icon/Icon';
import Select from '../../../components/Select/Select';
import TextInputWithDebounce from '../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';
import UIFactory from '../../../UIFactory';
import {AclColumnGroup} from '../../../utils/acl/acl-types';
import {ACLReduxProps} from '../ACL-connect-helpers';
import {useEditColumnRowGroupModal} from '../EditGroupModal/EditGroupModal';
import './ColumnGroups.scss';
import i18n from './i18n';

const block = cn('column-groups');

type Props = ColumnGropsToolbarProps &
    Pick<
        ACLReduxProps,
        | 'loaded'
        | 'columnGroups'
        | 'columnsFilter'
        | 'columnGroupNameFilter'
        | 'updateAclFilters'
        | 'userPermissionsAccessColumns'
    > & {
        loadAclDataFn: () => void;
        cluster: string;
        allowEdit?: boolean;
    };

export default function ColumnGroups({
    loaded,
    columnGroups,
    loadAclDataFn,
    cluster,
    allowEdit = false,
    updateAclFilters,
    columnsFilter,
    columnGroupNameFilter,
    userPermissionsAccessColumns,
}: Props) {
    const {editGroupModalNode, editGroup, deleteGroup} = useEditColumnRowGroupModal({
        groupType: 'column',
    });

    const handleEditClick = (item: AclColumnGroup) => {
        editGroup({
            item,
            submit: (value: Partial<AclColumnGroup>) => {
                return UIFactory.getAclApi()
                    .editColumnGroup(cluster, {...value, id: item.id})
                    .then(() => {
                        loadAclDataFn();
                    });
            },
        });
    };

    const handleDeleteClick = (item: AclColumnGroup) => {
        deleteGroup({
            item,
            submit: () => {
                const {id} = item;
                return UIFactory.getAclApi()
                    .deleteColumnGroup(cluster, id)
                    .then(() => {
                        loadAclDataFn();
                    });
            },
        });
    };

    const columns: Array<Column<AclColumnGroup>> = [
        {
            name: 'Empty',
            className: block('empty'),
            header: null,
            render({row}) {
                return <Power className={block('active-icon', {enabled: row.enabled})} />;
            },
        },
        {
            name: i18n('field_name'),
            render({row}) {
                return <span title={row.name}>{row.name}</span>;
            },
            align: 'left',
            className: block('name'),
        },
        {
            name: i18n('field_columns'),
            render({row}) {
                return row.columns?.map((column) => `"${column}"`).join(', ');
            },
            className: block('columns'),
            align: 'left',
        },
        {
            name: '',
            className: block('actions'),
            render({row}) {
                return allowEdit ? (
                    <>
                        <span
                            className={block('icon', {delete: true})}
                            onClick={() => handleDeleteClick(row)}
                        >
                            <Icon awesome="trash-alt" />
                        </span>
                        <span
                            className={block('icon', {edit: true})}
                            onClick={() => handleEditClick(row)}
                        >
                            <Icon awesome="pencil" />
                        </span>
                    </>
                ) : null;
            },
            align: 'right',
        },
    ];

    return (
        <ErrorBoundary>
            <div>
                <div className="elements-heading elements-heading_size_xs">{i18n('title_column-groups')}</div>
                <WithStickyToolbar
                    topMargin="none"
                    bottomMargin="regular"
                    toolbar={
                        <Toolbar
                            itemsToWrap={[
                                {
                                    node: (
                                        <TextInputWithDebounce
                                            placeholder={i18n('context_filter-by-name')}
                                            className={block('filter')}
                                            value={columnGroupNameFilter}
                                            onUpdate={(columnGroupNameFilter) =>
                                                updateAclFilters({columnGroupNameFilter})
                                            }
                                        />
                                    ),
                                },
                                {
                                    node: (
                                        <ColumnGroupsFilter
                                            {...{
                                                columnsFilter,
                                                updateAclFilters,
                                                userPermissionsAccessColumns,
                                            }}
                                        />
                                    ),
                                    shrinkable: true,
                                },
                            ]}
                        />
                    }
                    content={
                        <DataTableYT<AclColumnGroup>
                            loaded={loaded}
                            noItemsText={i18n('alert_no-groups')}
                            data={columnGroups}
                            columns={columns}
                            theme={'yt-borderless'}
                            settings={{
                                sortable: false,
                                displayIndices: false,
                            }}
                        />
                    }
                />
            </div>
            {editGroupModalNode}
        </ErrorBoundary>
    );
}

interface ColumnGropsToolbarProps
    extends Pick<
        ACLReduxProps,
        'updateAclFilters' | 'columnsFilter' | 'userPermissionsAccessColumns'
    > {}

export function ColumnGroupsFilter({
    columnsFilter: value,
    userPermissionsAccessColumns,
    updateAclFilters,
}: ColumnGropsToolbarProps) {
    const options = React.useMemo(() => {
        return userPermissionsAccessColumns?.map((value) => {
            return {value, title: value};
        });
    }, [userPermissionsAccessColumns]);
    return (
        <Select
            className={block('columns-filter')}
            multiple
            hasClear
            filterable
            label={i18n('field_columns')}
            placeholder={i18n('context_filter-placeholder')}
            items={options}
            value={value}
            onUpdate={(columnsFilter) => updateAclFilters({columnsFilter})}
            maxVisibleValuesTextLength={60}
            width="max"
        />
    );
}
