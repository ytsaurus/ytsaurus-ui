import React from 'react';
import {Route, Switch} from 'react-router';

import map_ from 'lodash/map';

import ClusterPage from '../ClusterPage/ClusterPage';
import UIFactory from '../../UIFactory';
import {odinRootPageInfo} from '../../pages/odin/lazy';
import {hasOdinPage} from '../../config';

export default class ClusterPageWrapper extends React.PureComponent {
    render() {
        return (
            <Switch>
                {map_(UIFactory.getExtraRootPages(), ({pageId, reactComponent}, index) => {
                    return reactComponent ? (
                        <Route key={index} path={`/${pageId}`} component={reactComponent} />
                    ) : null;
                })}
                {hasOdinPage() && (
                    <Route
                        path={`/${odinRootPageInfo.pageId}`}
                        component={odinRootPageInfo.reactComponent}
                    />
                )}

                <Route
                    path="/:cluster/"
                    render={(props) => {
                        const {cluster} = props.match.params;
                        return <ClusterPage key={cluster} cluster={cluster} />;
                    }}
                />
            </Switch>
        );
    }
}
