import React, {type FC, type MouseEvent, useRef, useState} from 'react';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import TextIndentIcon from '@gravity-ui/icons/svgs/text-indent.svg';
import i18n from './i18n';
import {QueryEngine} from '../../../../../shared/constants/engines';
import type {NavigationNode} from '@ytsaurus/components';
import {isTableNode} from '../../../../utils/navigation/isTableNode';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectIsQueryDraftEditted} from '../../../../store/selectors/query-tracker/query';
import {NewQueryPromt} from '../../NewQueryButton/NewQueryButton';
import {useMonaco} from '../../hooks/useMonaco';
import {
    copyPathToClipboard,
    makeNewQueryWithTableSelect,
} from '../../../../store/actions/query-tracker/queryNavigation';
import {makePathByQueryEngine} from '../helpers/makePathByQueryEngine';
import {selectNavigationClusterConfig} from '../../../../store/selectors/query-tracker/queryNavigation';
import {createTableSelect} from '../helpers/createTableSelect';
import {insertTextWhereCursor} from '../helpers/insertTextWhereCursor';
import {selectQueryResultGlobalSettings} from '../../../../store/selectors/query-tracker/queryResult';

export type Props = {
    node: Pick<NavigationNode, 'path' | 'type' | 'dynamic'>;
    engine: QueryEngine;
    open: boolean;
    onOpenToggle: () => void;
};

export const PathActionsMenu: FC<Props> = ({node, engine, open, onOpenToggle}) => {
    const dispatch = useDispatch();
    const dirtyQuery = useSelector(selectIsQueryDraftEditted);
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const {getEditor} = useMonaco();
    const {pageSize} = selectQueryResultGlobalSettings();

    const [showPrompt, setShowPrompt] = useState(false);
    const newQueryParams = useRef<{path: string; engine: QueryEngine} | null>(null);
    const {dynamic, path, type} = node;
    const tableNode = isTableNode(type);

    const handleStop = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
    };

    const handlePromptConfirm = () => {
        const parameters = newQueryParams.current;
        if (!parameters) return;

        dispatch(makeNewQueryWithTableSelect(parameters.path, parameters.engine));
        setShowPrompt(false);
    };

    const handlePromptCancel = () => {
        newQueryParams.current = null;
        setShowPrompt(false);
    };

    const handleNewQuery = (queryPath: string, newEngine: QueryEngine) => {
        if (dirtyQuery) {
            setShowPrompt(true);
            newQueryParams.current = {path: queryPath, engine: newEngine};
            return;
        }

        newQueryParams.current = {path: queryPath, engine: newEngine};
        handlePromptConfirm();
    };

    const handleClipboardCopy = (nodePath: string) => {
        if (!clusterConfig || !clusterConfig.id) return;
        const pathString = makePathByQueryEngine({
            cluster: clusterConfig.id,
            path: nodePath,
            engine,
        });
        dispatch(copyPathToClipboard(pathString));
    };

    const handleEditorInsert = async (nodePath: string, insertMode: 'path' | 'select') => {
        if (!clusterConfig || !clusterConfig.id) return;
        const editor = getEditor('queryEditor');
        let text = '';
        if (insertMode === 'path') {
            text = makePathByQueryEngine({
                cluster: clusterConfig.id,
                path: nodePath,
                engine,
            });
        } else {
            text = await createTableSelect({
                clusterConfig,
                path: nodePath,
                engine,
                limit: pageSize,
            });
        }
        insertTextWhereCursor(text, editor);
    };

    return (
        <>
            <DropdownMenu
                open={open}
                onOpenToggle={onOpenToggle}
                renderSwitcher={(props) => (
                    <Button view="flat" {...props}>
                        <Icon data={TextIndentIcon} size={16} />
                    </Button>
                )}
                items={[
                    {
                        text: i18n('action_copy-to-clipboard'),
                        items: [
                            {
                                text: i18n('value_path'),
                                action: (e) => {
                                    e.stopPropagation();
                                    handleClipboardCopy(path);
                                },
                            },
                        ],
                    },
                    {
                        text: i18n('action_insert-into-editor'),
                        items: [
                            {
                                text: i18n('value_path'),
                                action: (e) => {
                                    e.stopPropagation();
                                    handleEditorInsert(path, 'path');
                                },
                            },
                            ...(tableNode && (dynamic || engine !== QueryEngine.YT_QL)
                                ? [
                                      {
                                          text: i18n('value_select'),
                                          action: (
                                              e: React.MouseEvent<HTMLElement> | KeyboardEvent,
                                          ) => {
                                              e.stopPropagation();
                                              handleEditorInsert(path, 'select');
                                          },
                                      },
                                  ]
                                : []),
                        ],
                    },
                    ...(tableNode
                        ? [
                              {
                                  text: i18n('action_create-new-query'),
                                  items: [
                                      ...(dynamic
                                          ? [
                                                {
                                                    text: i18n('value_select-yt-ql'),
                                                    action: (
                                                        e:
                                                            | React.MouseEvent<HTMLElement>
                                                            | KeyboardEvent,
                                                    ) => {
                                                        e.stopPropagation();
                                                        handleNewQuery(path, QueryEngine.YT_QL);
                                                    },
                                                },
                                            ]
                                          : []),
                                      {
                                          text: i18n('value_select-yql'),
                                          action: (
                                              e: React.MouseEvent<HTMLElement> | KeyboardEvent,
                                          ) => {
                                              e.stopPropagation();
                                              handleNewQuery(path, QueryEngine.YQL);
                                          },
                                      },
                                      {
                                          text: i18n('value_select-chyt'),
                                          action: (
                                              e: React.MouseEvent<HTMLElement> | KeyboardEvent,
                                          ) => {
                                              e.stopPropagation();
                                              handleNewQuery(path, QueryEngine.CHYT);
                                          },
                                      },
                                      {
                                          text: i18n('value_select-spyt'),
                                          action: (
                                              e: React.MouseEvent<HTMLElement> | KeyboardEvent,
                                          ) => {
                                              e.stopPropagation();
                                              handleNewQuery(path, QueryEngine.SPYT);
                                          },
                                      },
                                  ],
                              },
                          ]
                        : []),
                ]}
                onSwitcherClick={handleStop}
            />
            <NewQueryPromt
                confirm={handlePromptConfirm}
                cancel={handlePromptCancel}
                visible={showPrompt}
            />
        </>
    );
};
