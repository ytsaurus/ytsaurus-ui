import React from 'react';
import {Route, Switch, useRouteMatch} from 'react-router';

import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import JobDetails from '../../pages/job/JobDetails/JobDetails';

export interface RouteInfo {
    operationID: string;
    jobID: string;
}

export default function Job() {
    const match = useRouteMatch<RouteInfo>();

    return (
        <div className="elements-main-section">
            <ErrorBoundary>
                <Switch>
                    <Route path={`${match.path}/:operationID/:jobID`}>
                        <JobDetails />
                    </Route>
                </Switch>
            </ErrorBoundary>
        </div>
    );
}
