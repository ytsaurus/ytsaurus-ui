import React, {type FC, useEffect} from 'react';
import './Navigation.scss';
import {NavigationHeader} from './NavigationHeader';
import {NavigationBody} from './NavigationBody';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {initNavigation} from '../../../store/actions/query-tracker/queryNavigation';
import {selectSettingsQueryTrackerNewQueriesView} from '../../../store/selectors/settings/settings-ts';
import {QueriesNavigationAdapter} from './QueriesNavigationAdapter/QueriesNavigationAdapter';

const b = cn('query-navigation');

export const Navigation: FC = () => {
    const dispatch = useDispatch();
    const useNewQueriesView = useSelector(selectSettingsQueryTrackerNewQueriesView);

    useEffect(() => {
        dispatch(initNavigation());
    }, [dispatch]);

    return useNewQueriesView ? (
        <QueriesNavigationAdapter />
    ) : (
        <div className={b()}>
            <NavigationHeader />
            <NavigationBody />
        </div>
    );
};
