import React from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';

import {getMetrics} from '../../../../common/utils/metrics';

import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import Button from '../../../../components/Button/Button';
import Icon from '../../../../components/Icon/Icon';

import {inTrash} from '../../../../utils/navigation/restore-object';
import {getTransaction} from '../../../../store/selectors/navigation';

import ypath from '../../../../common/thor/ypath';
import {OPEN_MOVE_OBJECT_POPUP} from '../../../../constants/navigation/modals/move-object';
import {openEditingPopup} from '../../../../store/actions/navigation/modals/path-editing-popup';
import {OPEN_COPY_OBJECT_POPUP} from '../../../../constants/navigation/modals/copy-object';
import {openAttributesModal} from '../../../../store/actions/modals/attributes-modal';
import {showNavigationAttributesEditor} from '../../../../store/actions/navigation/modals/attributes-editor';
import {restoreObject} from '../../../../store/actions/navigation/modals/restore-object';
import {updateView} from '../../../../store/actions/navigation';
import {openDeleteModal} from '../../../../store/actions/navigation/modals/delete-object';
import {
    showTableMergeModal,
    showTableSortModal,
} from '../../../../store/actions/navigation/modals/table-merge-sort-modal';
import {showTableEraseModal} from '../../../../store/actions/navigation/modals/table-erase-modal';
import {getSelectedNodes} from '../../../../store/selectors/navigation/content/map-node';
import {showDynTablesStateModalByPaths} from '../../../../store/actions/navigation/modals/dyn-tables-state-modal';
import {DYN_TABLES_ALLOWED_ACTIONS_BY_STATE} from '../../../../store/selectors/navigation/content/map-node-ts';
import {TabletStateType} from '../../../../store/reducers/navigation/modals/dyn-tables-state-modal';
import {ButtonProps, DropdownMenu} from '@gravity-ui/uikit';
import {showLinkToModal} from '../../../../store/actions/navigation/modals/link-to-modal';
import {showRemoteCopyModal} from '../../../../store/actions/navigation/modals/remote-copy-modal';

interface Props {
    item: {
        name: string;
        type: string;
        dynamic: boolean;
        path: string;
        $attributes: Record<string, unknown>;
        $value: unknown;
        tabletState: TabletStateType;
    };

    onlyDropdown?: boolean;
    dropDownBtnClassName?: string;
    dropDownBtnTheme?: ButtonProps['view'];
    dropDownBtnSize?: ButtonProps['size'];
}

function PathActions(props: Props) {
    const {item} = props;
    const objectPath = item.path;

    const dispatch = useDispatch();
    const transaction = useSelector(getTransaction);

    const restorePath = ypath.getValue(item.$attributes, '/_restore_path');
    const hasRestoreButton = inTrash(item.path);

    const {
        onMove,
        onCopy,
        onLink,
        onShowAttributes,
        onEditAttributes,
        onRestoreClick,
        onDeleteClick,
        onCopyPathClick,
        onSort,
        onErase,
        onMerge,
        onMount,
        onUnmount,
        onFreeze,
        onUnfreeze,
        onTransfer,
    } = React.useMemo(() => {
        const handleUpdateView = (...args: any) => dispatch(updateView(...args));

        return {
            onMove(evt: React.MouseEvent) {
                dispatch(openEditingPopup(objectPath, objectPath, OPEN_MOVE_OBJECT_POPUP));
                evt.stopPropagation();
            },
            onCopy(evt: React.MouseEvent) {
                dispatch(openEditingPopup(objectPath, objectPath, OPEN_COPY_OBJECT_POPUP));
                evt.stopPropagation();
            },
            onShowAttributes(evt: React.MouseEvent) {
                getMetrics().countEvent('navigation_map-node_attributes');

                dispatch(
                    openAttributesModal({
                        title: item.$value,
                        path: item.path,
                    } as any),
                );
                evt.stopPropagation();
            },
            onEditAttributes(evt: React.MouseEvent) {
                getMetrics().countEvent('navigation_map-node_edit_attributes');

                dispatch(showNavigationAttributesEditor([item.path]));
                evt.stopPropagation();
            },
            onRestoreClick(evt: React.MouseEvent) {
                dispatch(restoreObject(objectPath, restorePath, handleUpdateView));
                evt.stopPropagation();
            },

            onDeleteClick(evt: React.MouseEvent) {
                getMetrics().countEvent('navigation_map-node_delete');
                dispatch(openDeleteModal(item));
                evt.stopPropagation();
            },
            onCopyPathClick(evt: React.MouseEvent) {
                getMetrics().countEvent('navigation_map-node_copy-path');
                evt.stopPropagation();
            },
            onSort(e: React.MouseEvent) {
                dispatch(showTableSortModal([item.path]));
                e.stopPropagation();
            },
            onErase(evt: React.MouseEvent) {
                dispatch(showTableEraseModal(item.path));
                evt.stopPropagation();
            },
            onMerge(evt: React.MouseEvent) {
                dispatch(showTableMergeModal([item.path]));
                evt.stopPropagation();
            },
            onMount(evt: React.MouseEvent) {
                dispatch(showDynTablesStateModalByPaths([item.path], 'mount'));
                evt.stopPropagation();
            },
            onUnmount(evt: React.MouseEvent) {
                dispatch(showDynTablesStateModalByPaths([item.path], 'unmount'));
                evt.stopPropagation();
            },
            onFreeze(evt: React.MouseEvent) {
                dispatch(showDynTablesStateModalByPaths([item.path], 'freeze'));
                evt.stopPropagation();
            },
            onUnfreeze(evt: React.MouseEvent) {
                dispatch(showDynTablesStateModalByPaths([item.path], 'unfreeze'));
                evt.stopPropagation();
            },
            onLink(evt: React.MouseEvent) {
                dispatch(showLinkToModal({target: item.path}));
                evt.stopPropagation();
            },
            onTransfer(evt: React.MouseEvent) {
                dispatch(showRemoteCopyModal([item.path]));
                evt.stopPropagation();
            },
        };
    }, [dispatch, objectPath, item, restorePath]);

    const selectedNodes = useSelector(getSelectedNodes);
    if (selectedNodes.length) {
        return null;
    }

    const secondGroup = [
        {
            text: 'Move',
            icon: <Icon awesome="file-export" face="solid" />,
            action: onMove,
        },
        {
            text: 'Copy',
            icon: <Icon awesome="copy" face="solid" />,
            action: onCopy,
        },
        {
            text: 'Link',
            icon: <Icon awesome="link" face="solid" />,
            action: onLink,
        },
        {
            text: 'Delete',
            icon: <Icon awesome="trash-alt" />,
            action: onDeleteClick,
        },
    ];

    const firstGroup: Array<{
        text: string;
        icon?: React.ReactNode;
        action: (evt: any) => void;
    }> = [
        {
            text: 'Attributes',
            icon: <Icon awesome="at" />,
            action: onShowAttributes,
        },
        {
            text: 'Edit',
            icon: <Icon awesome="pencil-alt" />,
            action: onEditAttributes,
        },
    ];

    if (hasRestoreButton) {
        firstGroup.unshift({
            text: 'Restore',
            icon: <Icon awesome="undo" />,
            action: onRestoreClick,
        });
    }
    const menuItems = [firstGroup];

    if (item.type === 'table') {
        const isDynamic = item.dynamic;
        if (isDynamic) {
            const {tabletState} = item;
            const {mount, unmount, freeze, unfreeze} =
                DYN_TABLES_ALLOWED_ACTIONS_BY_STATE[tabletState] || {};
            const items = [
                ...(mount
                    ? [
                          {
                              text: 'Mount',
                              icon: <Icon awesome={'link'} />,
                              action: onMount,
                          },
                      ]
                    : []),
                ...(unmount
                    ? [
                          {
                              text: 'Unmount',
                              icon: <Icon awesome={'unlink'} />,
                              action: onUnmount,
                          },
                      ]
                    : []),
                ...(freeze
                    ? [
                          {
                              text: 'Freeze',
                              icon: <Icon awesome={'snowflake'} />,
                              action: onFreeze,
                          },
                      ]
                    : []),
                ...(unfreeze
                    ? [
                          {
                              text: 'Unfreeze',
                              icon: <Icon awesome={'flame'} />,
                              action: onUnfreeze,
                          },
                      ]
                    : []),
            ];
            if (items.length) {
                menuItems.push(items);
            }
        }
        menuItems.push([
            {
                text: 'Sort',
                icon: <Icon awesome={'sort'} />,
                action: onSort,
            },
            ...(!isDynamic
                ? [
                      {
                          text: 'Erase',
                          icon: <Icon awesome={'eraser'} />,
                          action: onErase,
                      },
                  ]
                : []),
            {
                text: 'Merge',
                icon: <Icon awesome={'code-merge'} />,
                action: onMerge,
            },
        ]);
    }
    if (item.type === 'table' || item.type === 'file') {
        menuItems.push([
            {
                text: 'Remote copy',
                icon: <Icon awesome={'clone'} />,
                action: onTransfer,
            },
        ]);
    }

    menuItems.push(secondGroup);

    const commonProps = {
        view: 'flat-secondary' as const,
        size: 'm' as const,
    };

    const {
        onlyDropdown,
        dropDownBtnClassName,
        dropDownBtnTheme = 'flat-secondary',
        dropDownBtnSize = 'm',
    } = props;

    return (
        <React.Fragment>
            {!onlyDropdown && (
                <Button
                    {...commonProps}
                    title="Delete node"
                    disabled={Boolean(transaction)}
                    onClick={onDeleteClick}
                >
                    <Icon awesome="trash-alt" />
                </Button>
            )}

            {!onlyDropdown && (
                <ClipboardButton
                    {...commonProps}
                    text={item.path}
                    title="Copy path"
                    onCopy={onCopyPathClick}
                />
            )}

            <DropdownMenu
                switcher={
                    <Button
                        size={dropDownBtnSize}
                        className={dropDownBtnClassName}
                        view={dropDownBtnTheme}
                    >
                        <Icon awesome="ellipsis-h" />
                    </Button>
                }
                items={menuItems}
            />
        </React.Fragment>
    );
}

export default React.memo(PathActions);
