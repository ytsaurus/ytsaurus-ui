import React, {useState} from 'react';

import _ from 'lodash';
import cn from 'bem-cn-lite';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';

import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import type {Column} from '@yandex-cloud/react-data-table';
import Icon from '../../../components/Icon/Icon';
import Button from '../../../components/Button/Button';
import StatusBulb from '../../../components/StatusBulb/StatusBulb';

import EditColumnGroupModal, {Props as ModalProps} from './EditColumnGroupModal';
import {ColumnGroup} from '../../../utils/acl/acl-types';
import UIFactory from '../../../UIFactory';

import './ColumnGroups.scss';
import {renderText} from '../../templates/utils';

const block = cn('column-groups');

interface Props {
    columnGroups: Array<ColumnGroup>;
    path: string;
    loadAclDataFn: () => void;
    cluster: string;
}

export default function ColumnGroups({columnGroups, path, loadAclDataFn, cluster}: Props) {
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
        handleSubmit: (_value: Partial<ColumnGroup>) => Promise.resolve(),
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
            handleSubmit: (value: Partial<ColumnGroup>) => {
                return UIFactory.getAclApi()
                    .createColumnGroup(cluster, path, value)
                    .then(() => {
                        loadAclDataFn();
                    });
            },
        }));
    };

    const handleEditClick = (item: ColumnGroup) => {
        setModalProps((prevProps) => ({
            ...prevProps,
            title: 'Edit column group',
            confirmText: 'Save',
            initialData: {...item},
            disabledFields: [],
            visible: true,
            handleSubmit: (value: Partial<ColumnGroup>) => {
                return UIFactory.getAclApi()
                    .editColumnGroup(cluster, {...value, id: item.id})
                    .then(() => {
                        loadAclDataFn();
                    });
            },
        }));
    };

    const handleDeleteClick = (item: ColumnGroup) => {
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

    const columns: Array<Column<ColumnGroup>> = [
        {
            name: 'Empty',
            className: block('empty'),
            header: null,
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
            name: 'Enabled',
            className: block('enabled'),
            render({row}) {
                const theme = row.enabled ? 'enabled' : 'unknown';
                return <StatusBulb theme={theme} />;
            },
            align: 'center',
        },
        {
            name: '',
            className: block('actions'),
            render({row}) {
                return (
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
                );
            },
            align: 'right',
        },
    ];

    return (
        <>
            <ErrorBoundary>
                <div className={block()}>
                    <div className="elements-heading elements-heading_size_xs">
                        Column Groups
                        <Button className={block('button', {add: true})} onClick={handleAddClick}>
                            <Icon awesome={'plus'} />
                            Add
                        </Button>
                    </div>
                    {columnGroups.length === 0 ? undefined : (
                        <DataTableYT<ColumnGroup>
                            data={columnGroups}
                            columns={columns}
                            theme={'yt-borderless'}
                            settings={{
                                sortable: false,
                                displayIndices: false,
                            }}
                        />
                    )}
                </div>
                {modalProps.visible ? <EditColumnGroupModal {...modalProps} /> : null}
            </ErrorBoundary>
        </>
    );
}
