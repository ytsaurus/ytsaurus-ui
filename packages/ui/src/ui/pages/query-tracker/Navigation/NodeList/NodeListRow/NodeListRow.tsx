import React, {type FC, type MouseEvent} from 'react';
import {type NavigationNode} from '@ytsaurus/components';
import './NodeListRow.scss';
import cn from 'bem-cn-lite';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import {isFolderNode} from '../../../../../utils/navigation/isFolderNode';
import {isTableNode} from '../../../../../utils/navigation/isTableNode';
import StarFillIcon from '@gravity-ui/icons/svgs/star-fill.svg';
import StarIcon from '@gravity-ui/icons/svgs/star.svg';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {useToggle} from 'react-use';
import {MapNodeIcon} from '../../../../../components/MapNodeIcon/MapNodeIcon';
import {NodeName} from '../NodeName';
import i18n from './i18n';
import {PathActionsMenu, type Props as PathActionsMenuProps} from '../../PathActionsMenu';

const b = cn('navigation-node-list-row');

type Props = {
    node: NavigationNode;
    onClick: (path: string, type: string | undefined) => void;
    onFavoriteToggle: (favoritePath: string) => void;
    onNewWindowOpen: (path: string) => void;
    onClipboardCopy: (path: string) => void;
} & Omit<PathActionsMenuProps, 'open' | 'onOpenToggle'>;

export const NodeListRow: FC<Props> = ({
    node,
    engine,
    onClick,
    onFavoriteToggle,
    onClipboardCopy,
    onNewWindowOpen,
}) => {
    const {type, name, path, targetPath, isFavorite} = node;
    const [pathMenuOpen, togglePathMenuOpen] = useToggle(false);
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

    return (
        <div
            className={b({unsupported: !isSupported, active: menuOpen || pathMenuOpen})}
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
                    <PathActionsMenu
                        node={node}
                        engine={engine}
                        open={pathMenuOpen}
                        onOpenToggle={togglePathMenuOpen}
                    />
                    <DropdownMenu
                        open={menuOpen}
                        onOpenToggle={toggleMenuOpen}
                        items={[
                            {
                                action: (e) => {
                                    e.stopPropagation();
                                    onClipboardCopy(path);
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
