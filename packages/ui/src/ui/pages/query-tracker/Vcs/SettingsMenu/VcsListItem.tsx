import React, {FC} from 'react';
import Button from '../../../../components/Button/Button';
import {Icon} from '@gravity-ui/uikit';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import './VcsListItem.scss';
import cn from 'bem-cn-lite';

const block = cn('vcs-list-item');

type Props = {
    name: string;
    vcsId: string;
    onClick: (vcsId: string) => void;
};

export const VcsListItem: FC<Props> = ({vcsId, name, onClick}) => {
    const [isSending, setIsSending] = React.useState(false);
    const handleOnClick = async () => {
        setIsSending(true);
        await onClick(vcsId);
        setIsSending(false);
    };

    return (
        <div className={block()}>
            <span>{name}</span>{' '}
            <Button onClick={handleOnClick} view="flat" loading={isSending}>
                <Icon data={TrashBinIcon} size={16} />
            </Button>
        </div>
    );
};
