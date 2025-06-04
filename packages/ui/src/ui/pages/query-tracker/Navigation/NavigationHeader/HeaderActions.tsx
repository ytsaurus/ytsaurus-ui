import React, {FC} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import StarIcon from '@gravity-ui/icons/svgs/star.svg';
import StarFillIcon from '@gravity-ui/icons/svgs/star-fill.svg';
import TextIndentIcon from '@gravity-ui/icons/svgs/text-indent.svg';
import CopyIcon from '@gravity-ui/icons/svgs/copy.svg';
import './HeaderActions.scss';
import cn from 'bem-cn-lite';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';

const b = cn('navigation-header-actions');

type Props = {
    showCopyBtn: boolean;
    isFavorite: boolean;
    navigationUrl: string;
    onFavoriteToggle: () => void;
    onPathCopy: () => void;
    onPastePath: () => void;
};

export const HeaderActions: FC<Props> = ({
    isFavorite,
    showCopyBtn,
    navigationUrl,
    onFavoriteToggle,
    onPathCopy,
    onPastePath,
}) => {
    return (
        <div className={b()}>
            <Button view="flat" href={navigationUrl} target="_blank">
                <Icon data={ArrowUpRightFromSquareIcon} size={16} />
            </Button>
            <Button view="flat" onClick={onFavoriteToggle}>
                <Icon data={isFavorite ? StarFillIcon : StarIcon} size={16} />
            </Button>
            <Button view="flat" onClick={onPastePath}>
                <Icon data={TextIndentIcon} size={16} />
            </Button>
            {showCopyBtn && (
                <Button view="flat" onClick={onPathCopy}>
                    <Icon data={CopyIcon} size={16} />
                </Button>
            )}
        </div>
    );
};
