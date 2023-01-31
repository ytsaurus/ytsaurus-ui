import _ from 'lodash';
import React from 'react';
import {Route} from 'react-router';
import UIFactory from '../../UIFactory';

export function makeExtraPageRoutes() {
    const res: Array<React.ReactNode> = [];
    UIFactory.getExtaClusterPages().forEach(({pageId, reactComponent}, index) => {
        res.push(<Route key={index} path={`/:cluster/${pageId}`} component={reactComponent} />);
    });
    return res;
}

export function makeExtraPageTopRowRoutes() {
    const res: Array<React.ReactNode> = [];
    UIFactory.getExtaClusterPages().forEach(({pageId, topRowComponent}, index) => {
        if (topRowComponent) {
            res.push(
                <Route key={index} path={`/:cluster/${pageId}`} component={topRowComponent} />,
            );
        }
    });
    return res;
}
