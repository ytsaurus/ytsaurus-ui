import React, {FC} from 'react';
import {useSelector} from 'react-redux';
import {
    selectNavigationCluster,
    selectNavigationError,
    selectNavigationPath,
} from '../../module/queryNavigation/selectors';
import {NavigationError as PrettyError} from '../../../navigation/Navigation/NavigationError/NavigationError';
import './NavigationError.scss';
import cn from 'bem-cn-lite';

const b = cn('yt-qt-navigation-error');

export const NavigationError: FC = () => {
    const error = useSelector(selectNavigationError);
    const cluster = useSelector(selectNavigationCluster);
    const path = useSelector(selectNavigationPath);

    if (!cluster || !error) return null;

    return (
        <div className={b()}>
            <PrettyError
                message={error.message}
                details={error}
                cluster={cluster}
                path={path}
                vertical
            />
        </div>
    );
};
