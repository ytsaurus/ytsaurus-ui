import React, {useCallback, useMemo} from 'react';

import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';
import some_ from 'lodash/some';

import {DropdownMenu, Icon as UIKitIcon} from '@gravity-ui/uikit';
import {CircleQuestion} from '@gravity-ui/icons';

import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import block from 'bem-cn-lite';

import Icon from '../../../../../../components/Icon/Icon';
import Button from '../../../../../../components/Button/Button';
import {ClipboardButton, Tooltip} from '@ytsaurus/components';

import {selectPath} from '../../../../../../store/selectors/navigation';
import {inTrash} from '../../../../../../utils/navigation/restore-object';
import {restoreObjects} from '../../../../../../store/actions/navigation/modals/restore-object';
import {openDeleteModal} from '../../../../../../store/actions/navigation/modals/delete-object';
import {OPEN_MOVE_OBJECT_POPUP} from '../../../../../../constants/navigation/modals/move-object';
import {OPEN_COPY_OBJECT_POPUP} from '../../../../../../constants/navigation/modals/copy-object';
import {openEditingPopup} from '../../../../../../store/actions/navigation/modals/path-editing-popup';
import {
    selectIsSelected,
    selectSelectedNodes,
    selectSelectedNodesAllowedDynTablesActions,
} from '../../../../../../store/selectors/navigation/content/map-node';
import {showNavigationAttributesEditor} from '../../../../../../store/actions/navigation/modals/attributes-editor';
import {
    showTableMergeModal,
    showTableSortModal,
} from '../../../../../../store/actions/navigation/modals/table-merge-sort-modal';

import {ClickableText} from '../../../../../../components/ClickableText/ClickableText';
import {selectAll} from '../../../../../../store/actions/navigation/content/map-node';
import {showDynTablesStateModalByNodes} from '../../../../../../store/actions/navigation/modals/dyn-tables-state-modal';
import {showRemoteCopyModal} from '../../../../../../store/actions/navigation/modals/remote-copy-modal';
import './MultipleActions.scss';
import i18n from '../i18n';

const b = block('multiple-actions');

const MAX_ITEMS_PER_REQUEST = 1000;

export default function MultipleActions(props: {className?: string}) {
    const {className} = props;

    const dispatch = useDispatch();
    const path = useSelector(selectPath);
    const isOneSelected = useSelector(selectIsSelected);
    const selectedNodes = useSelector(selectSelectedNodes);
    const isTooLarge = selectedNodes.length > MAX_ITEMS_PER_REQUEST;

    const dynTablesActions = useSelector(selectSelectedNodesAllowedDynTablesActions);

    const hasRestoreButton = useMemo(() => {
        return !some_(selectedNodes, ({path}) => !inTrash(path));
    }, [selectedNodes]);

    const handleDeleteClick = useCallback(() => {
        dispatch(openDeleteModal(selectedNodes, true));
    }, [dispatch, selectedNodes]);

    const disableActions = !isOneSelected || isTooLarge;

    const dropdownButton = useMemo(
        () => <Button disabled={disableActions}>{i18n('action_more-actions')}</Button>,
        [disableActions],
    );

    const restoreMoveCopy = useMemo(() => {
        const res = [
            {
                text: i18n('action_copy-selected'),
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
                text: i18n('action_move-selected'),
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
                text: i18n('action_restore-selected'),
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
                text: i18n('action_remote-copy-selected'),
                icon: <Icon awesome="clone" />,
                action: () => {
                    dispatch(showRemoteCopyModal(map_(selectedNodes, 'path')));
                },
            },
        ];
    }, [selectedNodes, dispatch]);

    const editItem = useMemo(() => {
        return {
            text: i18n('action_edit-selected'),
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
                text: i18n('action_sort-selected'),
                icon: <Icon awesome={'sort'} />,
                action: () => {
                    const paths = map_(selectedNodes, 'path');
                    dispatch(showTableSortModal(paths));
                },
            },
            {
                text: i18n('action_merge-selected'),
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
                          text: i18n('action_mount'),
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
                          text: i18n('action_unmount'),
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
                          text: i18n('action_freeze'),
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
                          text: i18n('action_unfreeze'),
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

    const selectedNodesPaths = useMemo(() => {
        return map_(selectedNodes, 'path').join('\n');
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
                        <span>{i18n('alert_too-many-items', {count: MAX_ITEMS_PER_REQUEST})}</span>
                    }
                    useFlex
                >
                    <span>{i18n('alert_too-many-items-selected')}</span>
                    &nbsp;
                    <UIKitIcon data={CircleQuestion} />
                </Tooltip>
            )}

            {!isTooLarge && (
                <Button title={i18n('action_delete-selected')} onClick={handleDeleteClick}>
                    <Icon awesome="trash-alt" />
                    &nbsp;{i18n('action_remove-selected')}
                </Button>
            )}

            <span className={b('item')}>
                <ClipboardButton
                    text={selectedNodesPaths}
                    buttonText={i18n('action_copy-paths')}
                    title={i18n('action_copy-selected-paths')}
                />
            </span>

            {!disableActions && (
                <span className={b('item')}>
                    <DropdownMenu switcher={dropdownButton} items={items} />
                </span>
            )}

            <span className={b('item')}>
                <ClickableText onClick={handleClearAll}>{i18n('action_clear-all')}</ClickableText>
            </span>
        </span>
    );
}
