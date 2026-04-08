import {Power} from '@gravity-ui/icons';
import type {Column} from '@gravity-ui/react-data-table';
import cn from 'bem-cn-lite';
import React from 'react';
import {DataTableYT} from '../../../components/DataTableYT';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Icon from '../../../components/Icon/Icon';
import TextInputWithDebounce from '../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';
import UIFactory from '../../../UIFactory';
import {AclRowGroup} from '../../../utils/acl/acl-types';
import {ACLReduxProps} from '../ACL-connect-helpers';
import {useEditColumnRowGroupModal} from '../EditGroupModal/EditGroupModal';
import './RowGroups.scss';
import i18n from './i18n';

const block = cn('acl-row-groups');

export type Props = Pick<
    ACLReduxProps,
    'loaded' | 'rowGroups' | 'rowGroupNameFilter' | 'updateAclFilters'
> & {
    path: string;
    loadAclDataFn: () => void;
    cluster: string;
    allowEdit?: boolean;
};

export function RowGroups({
    loaded,
    rowGroups,
    loadAclDataFn,
    cluster,
    allowEdit = false,
    rowGroupNameFilter,
    updateAclFilters,
}: Props) {
    const {editGroupModalNode, editGroup, deleteGroup} = useEditColumnRowGroupModal({
        groupType: 'row',
    });

    const handleEditClick = (item: AclRowGroup) => {
        editGroup({
            item,
            submit: (value) => {
                return UIFactory.getAclApi()
                    .editRowGroup(cluster, {...value, id: item.id})
                    .then(() => {
                        loadAclDataFn();
                    });
            },
        });
    };

    const handleDeleteClick = (item: AclRowGroup) => {
        deleteGroup({
            item,
            submit: () => {
                const {id} = item;
                return UIFactory.getAclApi()
                    .deleteRowGroup(cluster, id)
                    .then(() => {
                        loadAclDataFn();
                    });
            },
        });
    };

    const columns: Array<Column<AclRowGroup>> = [
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
            name: i18n('field_predicate'),
            render({row}) {
                return row.predicate;
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
                <div className="elements-heading elements-heading_size_xs">
                    {i18n('title_row-groups')}
                </div>
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
                                            value={rowGroupNameFilter}
                                            onUpdate={(rowGroupNameFilter) =>
                                                updateAclFilters({rowGroupNameFilter})
                                            }
                                        />
                                    ),
                                },
                            ]}
                        />
                    }
                    content={
                        <DataTableYT<AclRowGroup>
                            loaded={loaded}
                            noItemsText={i18n('alert_no-groups')}
                            data={rowGroups ?? []}
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
