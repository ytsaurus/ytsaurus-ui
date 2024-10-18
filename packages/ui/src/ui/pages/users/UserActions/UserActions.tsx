import React, {useCallback} from 'react';
import UIFactory from '../../../UIFactory';
import ClickableAttributesButton from '../../../components/AttributesButton/ClickableAttributesButton';
import ChartLink from '../../../components/ChartLink/ChartLink';
import Link from '../../../components/Link/Link';
import Icon from '../../../components/Icon/Icon';
import Button from '../../../components/Button/Button';
import {showUserDeleteModal, showUserEditorModal} from '../../../store/actions/users';
import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';

import './UserActions.scss';

const b = block('yt-user-actions');

type UserActionsProps = {
    className?: string;
    cluster: string;
    username: string;
};

export const UserActions: React.FC<UserActionsProps> = ({className, cluster, username}) => {
    const dispatch = useDispatch();

    const onEditClick = useCallback(() => {
        dispatch(showUserEditorModal(username));
    }, [username, dispatch]);

    const onDeleteClick = useCallback(() => {
        dispatch(showUserDeleteModal(username));
    }, [username, dispatch]);

    return (
        <div className={b(null, className)}>
            <ChartLink url={UIFactory.makeUrlForUserDashboard(cluster, username)} />
            <Link routed url={userOperationsLink(cluster, username)}>
                &lt;/&gt;
            </Link>
            <ClickableAttributesButton title={username} path={`//sys/users/${username}`} />
            <Button view="flat-secondary" size="m" onClick={onEditClick}>
                <Icon awesome="pencil-alt" />
            </Button>
            <Button view="flat-secondary" size="m" onClick={onDeleteClick}>
                <Icon awesome="trash-bin" />
            </Button>
        </div>
    );
};

function userOperationsLink(cluster: string, user: string) {
    return `/${cluster}/operations?mode=list&user=${user}&state=all`;
}
