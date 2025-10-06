import React, {FC} from 'react';
import {NavigationEmpty} from './NavigationEmpty';
import {useSelector} from 'react-redux';
import {selectNavigationNodeType} from '../../../../store/selectors/query-tracker/queryNavigation';
import {BodyType} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import {ClusterList} from '../ClusterList';
import {NodeList} from '../NodeList';
import {NavigationTable} from '../NavigationTable';
import {LoadingPlaceholder} from './LoadingPlaceholder';
import {NavigationError} from './NavigationError';

export const NavigationBody: FC = () => {
    const nodeType = useSelector(selectNavigationNodeType);

    switch (nodeType) {
        case BodyType.Tree:
            return <NodeList />;
        case BodyType.Table:
            return <NavigationTable />;
        case BodyType.Cluster:
            return <ClusterList />;
        case BodyType.Loading:
            return <LoadingPlaceholder />;
        case BodyType.Error:
            return <NavigationError />;
        default:
            return <NavigationEmpty />;
    }
};
