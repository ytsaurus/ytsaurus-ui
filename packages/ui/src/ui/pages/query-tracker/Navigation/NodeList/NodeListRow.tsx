import React, {FC, MouseEvent} from 'react';
import {NavigationNode} from '../../module/queryNavigation/queryNavigationSlice';
import './NodeListRow.scss';
import cn from 'bem-cn-lite';
import {getIconNameForType} from '../../../../utils/navigation/path-editor';
import AwesomeIcon from '../../../../components/Icon/Icon';
import {Button, DropdownMenu, Icon, Text} from '@gravity-ui/uikit';
import {isFolderNode} from '../helpers/isFolderNode';
import {isTableNode} from '../helpers/isTableNode';
import StarFillIcon from '@gravity-ui/icons/svgs/star-fill.svg';
import StarIcon from '@gravity-ui/icons/svgs/star.svg';
import TextIndentIcon from '@gravity-ui/icons/svgs/text-indent.svg';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {useToggle} from 'react-use';
import {QueryEngine} from '../../module/engines';

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
    node: {type, broken, dynamic, name, path, isFavorite},
    queryEngine,
    onClick,
    onFavoriteToggle,
    onClipboardCopy,
    onEditorInsert,
    onNewQuery,
    onNewWindowOpen,
}) => {
    const [tableMenuOpen, toggleTapleMenuOpen] = useToggle(false);
    const [menuOpen, toggleMenuOpen] = useToggle(false);
    const iconType = type === 'table' && dynamic ? 'table_dynamic' : type;
    const iconName = getIconNameForType(iconType, broken);
    const isSupported = isFolderNode(type) || isTableNode(type);
    const showActions = isSupported && name !== '...';

    const handleClick = () => {
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
                <AwesomeIcon awesome={iconName} size={16} />
                {isFavorite && (
                    <Icon data={StarFillIcon} className={b('favorite-icon')} size={10} />
                )}
            </div>
            <Text ellipsis>{name}</Text>
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
                                    text: 'Copy to clipboard',
                                    items: [
                                        {
                                            text: 'Path',
                                            action: (e) => {
                                                e.stopPropagation();
                                                onClipboardCopy(path, 'path');
                                            },
                                        },
                                    ],
                                },
                                {
                                    text: 'Insert into editor',
                                    items: [
                                        {
                                            text: 'Path',
                                            action: (e) => {
                                                e.stopPropagation();
                                                onEditorInsert(path, 'path');
                                            },
                                        },
                                        ...(dynamic || queryEngine !== QueryEngine.YT_QL
                                            ? [
                                                  {
                                                      text: 'SELECT',
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
                                    text: 'Create new query',
                                    items: [
                                        ...(dynamic
                                            ? [
                                                  {
                                                      text: 'SELECT (YT QL)',
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
                                            text: 'SELECT (YQL)',
                                            action: (e) => {
                                                e.stopPropagation();
                                                onNewQuery(path, QueryEngine.YQL);
                                            },
                                        },
                                        {
                                            text: 'SELECT (CHYT)',
                                            action: (e) => {
                                                e.stopPropagation();
                                                onNewQuery(path, QueryEngine.CHYT);
                                            },
                                        },
                                        {
                                            text: 'SELECT (SPYT)',
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
                                text: 'Copy link',
                            },
                            {
                                action: () => {
                                    onNewWindowOpen(path);
                                },
                                text: 'Open in cluster',
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
