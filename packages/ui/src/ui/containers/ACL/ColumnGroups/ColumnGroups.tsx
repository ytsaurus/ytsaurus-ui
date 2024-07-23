import React, {useState} from 'react';

import cn from 'bem-cn-lite';

import {Power} from '@gravity-ui/icons';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';

import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import type {Column} from '@gravity-ui/react-data-table';
import Icon from '../../../components/Icon/Icon';
import Button from '../../../components/Button/Button';
import {renderText} from '../../../components/templates/utils';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import Select from '../../../components/Select/Select';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';

import EditColumnGroupModal, {Props as ModalProps} from './EditColumnGroupModal';
import {AclColumnGroup} from '../../../utils/acl/acl-types';
import UIFactory from '../../../UIFactory';

import './ColumnGroups.scss';
import TextInputWithDebounce from '../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {ACLReduxProps} from '../ACL-connect-helpers';

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
        path: string;
        loadAclDataFn: () => void;
        cluster: string;
        allowEdit?: boolean;
    };

export default function ColumnGroups({
    loaded,
    columnGroups,
    path,
    loadAclDataFn,
    cluster,
    allowEdit = false,
    updateAclFilters,
    columnsFilter,
    columnGroupNameFilter,
    userPermissionsAccessColumns,
}: Props) {
    const [modalProps, setModalProps] = useState({
        title: '',
        confirmText: '',
        disabledFields: [],
        initialData: undefined,
        visible: false,
        handleClose: () => {
            setModalProps((prevProps) => ({
                ...prevProps,
                visible: false,
            }));
        },
        handleSubmit: (_value: Partial<AclColumnGroup>) => Promise.resolve(),
    } as ModalProps);

    const handleAddClick = () => {
        setModalProps((prevProps) => ({
            ...prevProps,
            title: 'Add new column group',
            confirmText: 'Add',
            disabledFields: ['enabled'],
            visible: true,
            initialData: {
                name: '',
                columns: [],
                enabled: false,
            },
            handleSubmit: (value: Partial<AclColumnGroup>) => {
                return UIFactory.getAclApi()
                    .createColumnGroup(cluster, path, value)
                    .then(() => {
                        loadAclDataFn();
                    });
            },
        }));
    };

    const handleEditClick = (item: AclColumnGroup) => {
        setModalProps((prevProps) => ({
            ...prevProps,
            title: 'Edit column group',
            confirmText: 'Save',
            initialData: {...item},
            disabledFields: [],
            visible: true,
            handleSubmit: (value: Partial<AclColumnGroup>) => {
                return UIFactory.getAclApi()
                    .editColumnGroup(cluster, {...value, id: item.id})
                    .then(() => {
                        loadAclDataFn();
                    });
            },
        }));
    };

    const handleDeleteClick = (item: AclColumnGroup) => {
        setModalProps((prevProps) => ({
            ...prevProps,
            title: 'Delete column group',
            confirmText: 'Delete',
            initialData: {...item},
            disabledFields: ['name', 'columns', 'enabled'],
            visible: true,
            handleSubmit: () => {
                const {id} = item;
                return UIFactory.getAclApi()
                    .deleteColumnGroup(cluster, id)
                    .then(() => {
                        loadAclDataFn();
                    });
            },
        }));
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
            name: 'Name',
            render({row}) {
                return <span title={row.name}>{row.name}</span>;
            },
            align: 'left',
            className: block('name'),
        },
        {
            name: 'Columns',
            render({row}) {
                return renderText(row.columns?.map((column) => `"${column}"`).join(', '));
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
                    Column groups
                    {allowEdit && (
                        <Button className={block('button', {add: true})} onClick={handleAddClick}>
                            <Icon awesome={'plus'} />
                            Add
                        </Button>
                    )}
                </div>
                <WithStickyToolbar
                    padding="skip-vertical"
                    bottomMargin="regular"
                    toolbar={
                        <Toolbar
                            itemsToWrap={[
                                {
                                    node: (
                                        <TextInputWithDebounce
                                            placeholder="Filter by name"
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
                            noItemsText="There are not any column groups"
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
            {modalProps.visible ? <EditColumnGroupModal {...modalProps} /> : null}
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
            label="Columns"
            placeholder="filter"
            items={options}
            value={value}
            onUpdate={(columnsFilter) => updateAclFilters({columnsFilter})}
            maxVisibleValuesTextLength={60}
            width="max"
        />
    );
}
