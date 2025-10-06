import React, {FC, useEffect} from 'react';
import './Navigation.scss';
import {NavigationHeader} from './NavigationHeader';
import {NavigationBody} from './NavigationBody';
import cn from 'bem-cn-lite';
import {useDispatch} from 'react-redux';
import {initNavigation} from '../../../store/actions/query-tracker/queryNavigation';

const b = cn('query-navigation');

export const Navigation: FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initNavigation());
    }, [dispatch]);

    return (
        <div className={b()}>
            <NavigationHeader />
            <NavigationBody />
        </div>
    );
};
