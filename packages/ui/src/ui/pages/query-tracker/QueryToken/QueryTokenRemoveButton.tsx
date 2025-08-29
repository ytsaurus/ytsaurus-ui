import React, {FC} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import {useDispatch} from 'react-redux';
import {removeQueryToken} from '../../../store/actions/settings/settings';

type Props = {
    name: string;
};

export const QueryTokenRemoveButton: FC<Props> = ({name}) => {
    const dispatch = useDispatch();

    const handleClick = () => {
        dispatch(removeQueryToken(name));
    };

    return (
        <Button onClick={handleClick}>
            <Icon data={TrashBinIcon} size={16} />
        </Button>
    );
};
