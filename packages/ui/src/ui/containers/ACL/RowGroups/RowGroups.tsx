import {Power} from '@gravity-ui/icons';
import type {Column} from '@gravity-ui/react-data-table';
import cn from 'bem-cn-lite';
import React, {useState} from 'react';
import Button from '../../../components/Button/Button';
import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import Icon from '../../../components/Icon/Icon';
import TextInputWithDebounce from '../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import WithStickyToolbar from '../../../components/WithStickyToolbar/WithStickyToolbar';
import UIFactory from '../../../UIFactory';
import {AclRowGroup} from '../../../utils/acl/acl-types';
import {ACLReduxProps} from '../ACL-connect-helpers';
import {EditRowGroupModal, Props as ModalProps} from './EditRowGroupModal';
import './RowGroups.scss';

const block = cn('acl-row-groups');

type Props = Pick<
    ACLReduxProps,
    'loaded' | 'rowGroups' | 'rowGroupNameFilter' | 'updateAclFilters'
> & {
    path: string;
    loadAclDataFn: () => void;
    cluster: string;
    allowEdit?: boolean;
    allowEditNotice?: string;
};

export function RowGroups({
    loaded,
    rowGroups,
    path,
    loadAclDataFn,
    cluster,
    allowEdit = false,
    allowEditNotice,
    rowGroupNameFilter,
    updateAclFilters,
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
        handleSubmit: (_value: Partial<AclRowGroup>) => Promise.resolve(),
    } as ModalProps);

    const handleAddClick = () => {
        setModalProps((prevProps) => ({
            ...prevProps,
            title: 'Add new row group',
            confirmText: 'Add',
            disabledFields: ['enabled'],
            visible: true,
            initialData: {
                name: '',
                predicate: '',
                enabled: false,
            },
            handleSubmit: (value: Partial<AclRowGroup>) => {
                return UIFactory.getAclApi()
                    .createRowGroup(cluster, path, value)
                    .then(() => {
                        loadAclDataFn();
                    });
            },
        }));
    };

    const handleEditClick = (item: AclRowGroup) => {
        setModalProps((prevProps) => ({
            ...prevProps,
            title: 'Edit row group',
            confirmText: 'Save',
            initialData: {...item},
            disabledFields: [],
            visible: true,
            handleSubmit: (value: Partial<AclRowGroup>) => {
                return UIFactory.getAclApi()
                    .editRowGroup(cluster, {...value, id: item.id})
                    .then(() => {
                        loadAclDataFn();
                    });
            },
        }));
    };

    const handleDeleteClick = (item: AclRowGroup) => {
        setModalProps((prevProps) => ({
            ...prevProps,
            title: 'Delete row group',
            confirmText: 'Delete',
            initialData: {...item},
            disabledFields: ['name', 'predicate', 'enabled'],
            visible: true,
            handleSubmit: () => {
                const {id} = item;
                return UIFactory.getAclApi()
                    .deleteRowGroup(cluster, id)
                    .then(() => {
                        loadAclDataFn();
                    });
            },
            mode: 'delete',
        }));
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
            name: 'Name',
            render({row}) {
                return <span title={row.name}>{row.name}</span>;
            },
            align: 'left',
            className: block('name'),
        },
        {
            name: 'Predicate',
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
                    Row groups
                    <Button
                        className={block('button', {add: true})}
                        onClick={handleAddClick}
                        disabled={!allowEdit}
                        qa="acl:add-row-group"
                    >
                        <Icon awesome={'plus'} />
                        Add
                    </Button>
                    {Boolean(allowEditNotice) && (
                        <Tooltip content={allowEditNotice}>
                            &nbsp;
                            <Icon awesome="question-circle" color="secondary" />
                        </Tooltip>
                    )}
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
                                            placeholder="Filter by name"
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
                            noItemsText="There are no any row groups"
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
            {modalProps.visible ? <EditRowGroupModal {...modalProps} /> : null}
        </ErrorBoundary>
    );
}
