import React, {FC, MouseEvent} from 'react';
import {NavigationNode} from '../../../../../store/reducers/query-tracker/queryNavigationSlice';
import './NodeListRow.scss';
import cn from 'bem-cn-lite';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import {isFolderNode} from '../../../../../utils/navigation/isFolderNode';
import {isTableNode} from '../../../../../utils/navigation/isTableNode';
import StarFillIcon from '@gravity-ui/icons/svgs/star-fill.svg';
import StarIcon from '@gravity-ui/icons/svgs/star.svg';
import TextIndentIcon from '@gravity-ui/icons/svgs/text-indent.svg';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {useToggle} from 'react-use';
import {QueryEngine} from '../../../../../../shared/constants/engines';
import {MapNodeIcon} from '../../../../../components/MapNodeIcon/MapNodeIcon';
import {NodeName} from '../NodeName';
import i18n from './i18n';

const b = cn('navigation-node-list-row');

type Props = {
    node: NavigationNode;
    queryEngine: QueryEngine;
    onClick: (path: string, type: string | undefined) => void;
    onFavoriteToggle: (favoritePath: string) => void;
    onClipboardCopy: (path: string, type: 'url' | 'path') => void;
    onEditorInsert: (path: string, type: 'path' | 'select') => void;
    onNewQuery: (path: string, engine: QueryEngine) => void;
    onNewWindowOpen: (path: string) => void;
};

export const NodeListRow: FC<Props> = ({
    node,
    queryEngine,
    onClick,
    onFavoriteToggle,
    onClipboardCopy,
    onEditorInsert,
    onNewQuery,
    onNewWindowOpen,
}) => {
    const {type, dynamic, name, path, targetPath, isFavorite} = node;
    const [tableMenuOpen, toggleTapleMenuOpen] = useToggle(false);
    const [menuOpen, toggleMenuOpen] = useToggle(false);
    const isSupported = isFolderNode(type) || isTableNode(type);
    const showActions = isSupported && name !== '...';

    const handleClick = () => {
        if (!isSupported) return;
        onClick(path, type);
    };

    const handleStop = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
    };

    const handleFavoriteClick = (e: MouseEvent<HTMLButtonElement>) => {
        handleStop(e);
        onFavoriteToggle(path);
    };

    const handlePastePathClick = (e: MouseEvent<HTMLButtonElement>) => {
        handleStop(e);
        onEditorInsert(path, 'path');
    };

    return (
        <div
            className={b({unsupported: !isSupported, active: menuOpen || tableMenuOpen})}
            onClick={handleClick}
        >
            <div className={b('icon-wrap')}>
                <MapNodeIcon node={{$attributes: node}} />
                {isFavorite && (
                    <Icon data={StarFillIcon} className={b('favorite-icon')} size={10} />
                )}
            </div>
            <NodeName type={type} name={name} targetPath={targetPath} />
            {showActions && (
                <div className={b('actions')}>
                    <Button view="flat" onClick={handleFavoriteClick}>
                        <Icon data={isFavorite ? StarFillIcon : StarIcon} size={16} />
                    </Button>
                    {isTableNode(type) ? (
                        <DropdownMenu
                            open={tableMenuOpen}
                            onOpenToggle={toggleTapleMenuOpen}
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
                                                onClipboardCopy(path, 'path');
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
                                                onEditorInsert(path, 'path');
                                            },
                                        },
                                        ...(dynamic || queryEngine !== QueryEngine.YT_QL
                                            ? [
                                                  {
                                                      text: i18n('value_select'),
                                                      action: (
                                                          e:
                                                              | React.MouseEvent<HTMLElement>
                                                              | KeyboardEvent,
                                                      ) => {
                                                          e.stopPropagation();
                                                          onEditorInsert(path, 'select');
                                                      },
                                                  },
                                              ]
                                            : []),
                                    ],
                                },
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
                                                          onNewQuery(path, QueryEngine.YT_QL);
                                                      },
                                                  },
                                              ]
                                            : []),
                                        {
                                            text: i18n('value_select-yql'),
                                            action: (e) => {
                                                e.stopPropagation();
                                                onNewQuery(path, QueryEngine.YQL);
                                            },
                                        },
                                        {
                                            text: i18n('value_select-chyt'),
                                            action: (e) => {
                                                e.stopPropagation();
                                                onNewQuery(path, QueryEngine.CHYT);
                                            },
                                        },
                                        {
                                            text: i18n('value_select-spyt'),
                                            action: (e) => {
                                                e.stopPropagation();
                                                onNewQuery(path, QueryEngine.SPYT);
                                            },
                                        },
                                    ],
                                },
                            ]}
                            onSwitcherClick={handleStop}
                        />
                    ) : (
                        <Button view="flat" onClick={handlePastePathClick}>
                            <Icon data={TextIndentIcon} size={16} />
                        </Button>
                    )}
                    <DropdownMenu
                        open={menuOpen}
                        onOpenToggle={toggleMenuOpen}
                        items={[
                            {
                                action: (e) => {
                                    e.stopPropagation();
                                    onClipboardCopy(path, 'url');
                                },
                                text: i18n('action_copy-link'),
                            },
                            {
                                action: () => {
                                    onNewWindowOpen(path);
                                },
                                text: i18n('action_open-in-cluster'),
                                iconEnd: <Icon data={ArrowUpRightFromSquareIcon} />,
                            },
                        ]}
                        onSwitcherClick={handleStop}
                    />
                </div>
            )}
        </div>
    );
};
