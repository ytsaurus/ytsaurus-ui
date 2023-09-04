import React, {useCallback, useMemo} from 'react';
import _ from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import block from 'bem-cn-lite';

import Icon from '../../../../components/Icon/Icon';
import Button from '../../../../components/Button/Button';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';

import {getPath} from '../../../../store/selectors/navigation';
import {inTrash} from '../../../../utils/navigation/restore-object';
import {restoreObjects} from '../../../../store/actions/navigation/modals/restore-object';
import {openDeleteModal} from '../../../../store/actions/navigation/modals/delete-object';
import {OPEN_MOVE_OBJECT_POPUP} from '../../../../constants/navigation/modals/move-object';
import {OPEN_COPY_OBJECT_POPUP} from '../../../../constants/navigation/modals/copy-object';
import {openEditingPopup} from '../../../../store/actions/navigation/modals/path-editing-popup';
import {
    getSelectedNodes,
    getSelectedNodesAllowedDynTablesActions,
    isSelected,
} from '../../../../store/selectors/navigation/content/map-node';
import {showNavigationAttributesEditor} from '../../../../store/actions/navigation/modals/attributes-editor';
import {DropdownMenu} from '@gravity-ui/uikit';
import copyToClipboard from 'copy-to-clipboard';
import {
    showTableMergeModal,
    showTableSortModal,
} from '../../../../store/actions/navigation/modals/table-merge-sort-modal';

import Link from '../../../../components/Link/Link';
import {selectAll} from '../../../../store/actions/navigation/content/map-node';
import {showDynTablesStateModalByNodes} from '../../../../store/actions/navigation/modals/dyn-tables-state-modal';
import {showRemoteCopyModal} from '../../../../store/actions/navigation/modals/remote-copy-modal';
import './MultipleActions.scss';

const b = block('multiple-actions');

export default function MultipleActions(props: {className: string}) {
    const {className} = props;

    const dispatch = useDispatch();
    const path = useSelector(getPath);
    const isOneSelected = useSelector(isSelected);
    const selectedNodes = useSelector(getSelectedNodes);
    const isTooLarge = selectedNodes.length > 1000;

    const dynTablesActions = useSelector(getSelectedNodesAllowedDynTablesActions);

    const hasRestoreButton = useMemo(() => {
        return !_.some(selectedNodes, ({path}) => !inTrash(path));
    }, [selectedNodes]);

    const handleDeleteClick = useCallback(() => {
        dispatch(openDeleteModal(selectedNodes, true));
    }, [dispatch, selectedNodes]);

    const allowModifyActions = !isOneSelected || isTooLarge;

    const dropdownButton = useMemo(
        () => <Button disabled={allowModifyActions}>More actions</Button>,
        [isOneSelected, isTooLarge],
    );

    const restoreMoveCopy = useMemo(() => {
        const res = [
            {
                text: 'Copy selected',
                icon: <Icon awesome="copy" face="solid" />,
                action: () => {
                    dispatch(
                        openEditingPopup(
                            path,
                            path + '/',
                            OPEN_COPY_OBJECT_POPUP,
                            true,
                            selectedNodes,
                        ),
                    );
                },
            },
            {
                text: 'Move selected',
                icon: <Icon awesome="file-export" face="solid" />,
                action: () => {
                    dispatch(
                        openEditingPopup(
                            path,
                            path + '/',
                            OPEN_MOVE_OBJECT_POPUP,
                            true,
                            selectedNodes,
                        ),
                    );
                },
            },
        ];
        if (hasRestoreButton) {
            res.splice(0, 0, {
                text: 'Restore selected',
                icon: <Icon awesome="undo" />,
                action: () => {
                    dispatch(restoreObjects(selectedNodes));
                },
            });
        }
        return res;
    }, [dispatch, hasRestoreButton, path, selectedNodes]);

    const transferItem = useMemo(() => {
        if (selectedNodes.length !== 1) {
            return [];
        }

        const [{type}] = selectedNodes;
        if (type !== 'table') {
            return [];
        }

        return [
            {
                text: 'Remote copy selected',
                icon: <Icon awesome="clone" />,
                action: () => {
                    dispatch(showRemoteCopyModal(_.map(selectedNodes, 'path')));
                },
            },
        ];
    }, [selectedNodes]);

    const editItem = useMemo(() => {
        return {
            text: 'Edit selected',
            icon: <Icon awesome={'pencil-alt'} />,
            action: () => {
                const paths = _.map(selectedNodes, 'path');
                dispatch(showNavigationAttributesEditor(paths));
            },
        };
    }, [selectedNodes]);

    const mergeSortSection = useMemo(() => {
        const allowSortMerge = !_.some(selectedNodes, (node) => {
            return node.type !== 'table';
        });
        if (!allowSortMerge) {
            return [];
        }
        return [
            {
                text: 'Sort selected',
                icon: <Icon awesome={'sort'} />,
                action: () => {
                    const paths = _.map(selectedNodes, 'path');
                    dispatch(showTableSortModal(paths));
                },
            },
            {
                text: 'Merge selected',
                icon: <Icon awesome={'code-merge'} />,
                action: () => {
                    const paths = _.map(selectedNodes, 'path');
                    dispatch(showTableMergeModal(paths));
                },
            },
        ];
    }, [dispatch, selectedNodes]);

    const dynTablesSection = useMemo(() => {
        if (_.isEmpty(dynTablesActions)) {
            return [];
        }

        const {mount, unmount, freeze, unfreeze} = dynTablesActions;
        const items = [
            ...(!mount
                ? []
                : [
                      {
                          text: 'Mount',
                          icon: <Icon awesome={'link'} />,
                          action: () => {
                              dispatch(showDynTablesStateModalByNodes('mount', selectedNodes));
                          },
                      },
                  ]),
            ...(!unmount
                ? []
                : [
                      {
                          text: 'Unmount',
                          icon: <Icon awesome={'unlink'} />,
                          action: () => {
                              dispatch(showDynTablesStateModalByNodes('unmount', selectedNodes));
                          },
                      },
                  ]),
            ...(!freeze
                ? []
                : [
                      {
                          text: 'Freeze',
                          icon: <Icon awesome={'snowflake'} />,
                          action: () => {
                              dispatch(showDynTablesStateModalByNodes('freeze', selectedNodes));
                          },
                      },
                  ]),
            ...(!unfreeze
                ? []
                : [
                      {
                          text: 'Unfreeze',
                          icon: <Icon awesome={'fire'} />,
                          action: () => {
                              dispatch(showDynTablesStateModalByNodes('unfreeze', selectedNodes));
                          },
                      },
                  ]),
        ];

        if (!items.length) {
            return [];
        }

        return items;
    }, [dispatch, selectedNodes, dynTablesActions]);

    const items = useMemo(() => {
        return [[editItem], mergeSortSection, restoreMoveCopy, transferItem, dynTablesSection];
    }, [restoreMoveCopy, editItem, mergeSortSection]);

    const onCopyPathClick = React.useCallback(() => {
        const res = _.map(selectedNodes, 'path').join('\n');
        copyToClipboard(res);
    }, [selectedNodes]);

    const handleClearAll = React.useCallback(() => {
        dispatch(selectAll(true));
    }, [dispatch]);

    return (
        <span className={b(null, className)}>
            <span className={b('item')}>
                <Button
                    title="Delete selected nodes"
                    disabled={allowModifyActions}
                    onClick={handleDeleteClick}
                >
                    <Icon awesome="trash-alt" />
                    &nbsp;Remove selected
                </Button>
            </span>

            <span className={b('item')}>
                <ClipboardButton
                    buttonText={'Copy paths'}
                    title="Copy selected paths"
                    onCopy={onCopyPathClick}
                />
            </span>

            <span className={b('item')}>
                <DropdownMenu
                    disabled={allowModifyActions}
                    switcher={dropdownButton}
                    items={items}
                />
            </span>

            <span className={b('item')}>
                <Link onClick={handleClearAll}>Clear all</Link>
            </span>
        </span>
    );
}
