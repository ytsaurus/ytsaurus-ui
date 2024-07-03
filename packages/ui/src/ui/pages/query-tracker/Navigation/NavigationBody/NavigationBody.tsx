import React, {FC} from 'react';
import {NavigationEmpty} from './NavigationEmpty';
import {useSelector} from 'react-redux';
import {selectNavigationNodeType} from '../../module/queryNavigation/selectors';
import {BodyType} from '../../module/queryNavigation/queryNavigationSlice';
import {ClusterList} from '../ClusterList';
import {NodeList} from '../NodeList';
import {NavigationTable} from '../NavigationTable';

export const NavigationBody: FC = () => {
    const nodeType = useSelector(selectNavigationNodeType);

    switch (nodeType) {
        case BodyType.Tree:
            return <NodeList />;
        case BodyType.Table:
            return <NavigationTable />;
        case BodyType.Cluster:
            return <ClusterList />;
        default:
            return <NavigationEmpty />;
    }
};
