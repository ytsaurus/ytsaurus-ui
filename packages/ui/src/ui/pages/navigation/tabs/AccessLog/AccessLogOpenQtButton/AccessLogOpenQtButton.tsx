import AbbrSqlIcon from '@gravity-ui/icons/svgs/abbr-sql.svg';
import {Button, Icon} from '@gravity-ui/uikit';
import React, {type FC, useState} from 'react';
import {fetchAccessLogQtId} from '../../../../../store/actions/navigation/tabs/access-log/access-log';
import {useDispatch} from '../../../../../store/redux-hooks';
import i18n from './i18n';

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
            {i18n('action_open-in-qt')}
        </Button>
    );
};
