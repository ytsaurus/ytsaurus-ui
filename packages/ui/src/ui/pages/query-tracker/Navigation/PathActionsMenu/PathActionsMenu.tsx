import React, {type FC, type MouseEvent} from 'react';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import TextIndentIcon from '@gravity-ui/icons/svgs/text-indent.svg';
import type {NavigationNode} from '@ytsaurus/components';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {useNavigationQueryActions} from '../useNavigationQueryActions';
import {getNavigationQueryEngines} from '../helpers/queryActions';
import i18n from './i18n';

const selectLabels = {
    [QueryEngine.YT_QL]: 'value_select-yt-ql',
    [QueryEngine.YQL]: 'value_select-yql',
    [QueryEngine.CHYT]: 'value_select-chyt',
    [QueryEngine.SPYT]: 'value_select-spyt',
} as const;

export type Props = {
    node: Pick<NavigationNode, 'path' | 'type' | 'dynamic'>;
    engine: QueryEngine;
    open: boolean;
    disabled?: boolean;
    onOpenToggle: () => void;
};

export const PathActionsMenu: FC<Props> = ({node, engine, open, onOpenToggle, disabled}) => {
    const {createQuery, insertPath, insertSelect, copyPath, modal} =
        useNavigationQueryActions(engine);
    const engines = getNavigationQueryEngines(node);
    const {path} = node;
    const handleStop = (event: MouseEvent<HTMLButtonElement>) => event.stopPropagation();
    return (
        <>
            <DropdownMenu
                disabled={disabled}
                open={open && !disabled}
                onOpenToggle={onOpenToggle}
                renderSwitcher={(props) => (
                    <Button
                        view="flat"
                        {...props}
                        disabled={disabled}
                        aria-label={i18n('action_insert-into-editor')}
                    >
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
                                    copyPath(path);
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
                                    insertPath(path);
                                },
                            },
                            ...(engines.includes(engine)
                                ? [
                                      {
                                          text: i18n('value_select'),
                                          action: (
                                              e: React.MouseEvent<HTMLElement> | KeyboardEvent,
                                          ) => {
                                              e.stopPropagation();
                                              insertSelect(node);
                                          },
                                      },
                                  ]
                                : []),
                        ],
                    },
                    ...(engines.length
                        ? [
                              {
                                  text: i18n('action_create-new-query'),
                                  items: engines.map((nextEngine) => ({
                                      text: i18n(selectLabels[nextEngine]),
                                      action: (
                                          event: React.MouseEvent<HTMLElement> | KeyboardEvent,
                                      ) => {
                                          event.stopPropagation();
                                          createQuery(node, nextEngine);
                                      },
                                  })),
                              },
                          ]
                        : []),
                ]}
                onSwitcherClick={handleStop}
            />
            {modal}
        </>
    );
};
