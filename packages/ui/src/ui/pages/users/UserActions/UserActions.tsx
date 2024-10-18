import React from 'react';
import UIFactory from '../../../UIFactory';
import ClickableAttributesButton from '../../../components/AttributesButton/ClickableAttributesButton';
import ChartLink from '../../../components/ChartLink/ChartLink';
import Link from '../../../components/Link/Link';
import Icon from '../../../components/Icon/Icon';
import {showUserEditorModal} from '../../../store/actions/users';
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
    const onEditClick = React.useCallback(() => {
        dispatch(showUserEditorModal(username));
    }, [username, dispatch]);

    return (
        <div className={className}>
            <ChartLink url={UIFactory.makeUrlForUserDashboard(cluster, username)} />
            <Link routed url={userOperationsLink(cluster, username)}>
                &lt;/&gt;
            </Link>
            <ClickableAttributesButton
                className={b('attrs-action')}
                title={username}
                path={`//sys/users/${username}`}
            />
            <Link onClick={onEditClick} className={b('edit-action')}>
                <Icon awesome="pencil-alt" />
            </Link>
        </div>
    );
};

function userOperationsLink(cluster: string, user: string) {
    return `/${cluster}/operations?mode=list&user=${user}&state=all`;
}
