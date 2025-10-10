import React, {FC, useState} from 'react';
import {useDispatch} from '../../../../store/redux-hooks';
import {fetchAccessLogQtId} from '../../../../store/actions/navigation/tabs/access-log/access-log';
import {Button, Icon} from '@gravity-ui/uikit';
import AbbrSqlIcon from '@gravity-ui/icons/svgs/abbr-sql.svg';

export const AccessLogOpenQtButton: FC = () => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleClick = async () => {
        try {
            setLoading(true);
            await dispatch(fetchAccessLogQtId());
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleClick} loading={loading}>
            <Icon data={AbbrSqlIcon} size={16} />
            Open in QT
        </Button>
    );
};
