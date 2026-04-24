import React, {useCallback, useMemo} from 'react';

import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';
import some_ from 'lodash/some';

import copyToClipboard from 'copy-to-clipboard';
import {DropdownMenu, Icon as UIKitIcon} from '@gravity-ui/uikit';
import {CircleQuestion} from '@gravity-ui/icons';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import block from 'bem-cn-lite';

import Icon from '../../../../components/Icon/Icon';
import Button from '../../../../components/Button/Button';
import {ClipboardButton, Tooltip} from '@ytsaurus/components';

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
import {
    showTableMergeModal,
    showTableSortModal,
} from '../../../../store/actions/navigation/modals/table-merge-sort-modal';

import {ClickableText} from '../../../../components/ClickableText/ClickableText';
import {selectAll} from '../../../../store/actions/navigation/content/map-node';
import {showDynTablesStateModalByNodes} from '../../../../store/actions/navigation/modals/dyn-tables-state-modal';
import {showRemoteCopyModal} from '../../../../store/actions/navigation/modals/remote-copy-modal';
import './MultipleActions.scss';

const b = block('multiple-actions');

const MAX_ITEMS_PER_REQUEST = 1000;

export default function MultipleActions(props: {className?: string}) {
    const {className} = props;

    const dispatch = useDispatch();
    const path = useSelector(getPath);
    const isOneSelected = useSelector(isSelected);
    const selectedNodes = useSelector(getSelectedNodes);
    const isTooLarge = selectedNodes.length > MAX_ITEMS_PER_REQUEST;

    const dynTablesActions = useSelector(getSelectedNodesAllowedDynTablesActions);

    const hasRestoreButton = useMemo(() => {
        return !some_(selectedNodes, ({path}) => !inTrash(path));
    }, [selectedNodes]);

    const handleDeleteClick = useCallback(() => {
        dispatch(openDeleteModal(selectedNodes, true));
    }, [dispatch, selectedNodes]);

    const disableActions = !isOneSelected || isTooLarge;

    const dropdownButton = useMemo(
        () => <Button disabled={disableActions}>More actions</Button>,
        [disableActions],
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
                    dispatch(showRemoteCopyModal(map_(selectedNodes, 'path')));
                },
            },
        ];
    }, [selectedNodes, dispatch]);

    const editItem = useMemo(() => {
        return {
            text: 'Edit selected',
            icon: <Icon awesome={'pencil-alt'} />,
            action: () => {
                const paths = map_(selectedNodes, 'path');
                dispatch(showNavigationAttributesEditor(paths));
            },
        };
    }, [selectedNodes, dispatch]);

    const mergeSortSection = useMemo(() => {
        const allowSortMerge = !some_(selectedNodes, (node) => {
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
                    const paths = map_(selectedNodes, 'path');
                    dispatch(showTableSortModal(paths));
                },
            },
            {
                text: 'Merge selected',
                icon: <Icon awesome={'code-merge'} />,
                action: () => {
                    const paths = map_(selectedNodes, 'path');
                    dispatch(showTableMergeModal(paths));
                },
            },
        ];
    }, [dispatch, selectedNodes]);

    const dynTablesSection = useMemo(() => {
        if (isEmpty_(dynTablesActions)) {
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
                          icon: <Icon awesome={'flame'} />,
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
        return [
            [editItem],
            mergeSortSection,
            restoreMoveCopy,
            transferItem,
            dynTablesSection,
        ].filter((e) => e.length);
    }, [restoreMoveCopy, transferItem, dynTablesSection, editItem, mergeSortSection]);

    const onCopyPathClick = React.useCallback(() => {
        const res = map_(selectedNodes, 'path').join('\n');
        copyToClipboard(res);
    }, [selectedNodes]);

    const handleClearAll = React.useCallback(() => {
        dispatch(selectAll(true));
    }, [dispatch]);

    return (
        <span className={b(null, className)}>
            {isTooLarge && (
                <Tooltip
                    className={b('item')}
                    content={
                        <span>
                            It is not allowed to handle more than {MAX_ITEMS_PER_REQUEST} items per
                            request. Use SHIFT+Click to select ranges.
                        </span>
                    }
                    useFlex
                >
                    <span>Too many items selected</span>
                    &nbsp;
                    <UIKitIcon data={CircleQuestion} />
                </Tooltip>
            )}

            {!isTooLarge && (
                <Button title="Delete selected nodes" onClick={handleDeleteClick}>
                    <Icon awesome="trash-alt" />
                    &nbsp;Remove selected
                </Button>
            )}

            <span className={b('item')}>
                <ClipboardButton
                    buttonText={'Copy paths'}
                    title="Copy selected paths"
                    onCopy={onCopyPathClick}
                />
            </span>

            {!disableActions && (
                <span className={b('item')}>
                    <DropdownMenu switcher={dropdownButton} items={items} />
                </span>
            )}

            <span className={b('item')}>
                <ClickableText onClick={handleClearAll}>Clear all</ClickableText>
            </span>
        </span>
    );
}
