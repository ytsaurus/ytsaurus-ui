import React, {type FC, useState} from 'react';
import Button from '../../../../../components/Button/Button';
import Icon from '../../../../../components/Icon/Icon';
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
        <Button onClick={handleClick} loading={loading} view="outlined-info">
            <Icon awesome="external-link" size={13} />
            {i18n('action_open-in-qt')}
        </Button>
    );
};
