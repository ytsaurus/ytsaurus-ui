import React from 'react';
import {Route, Switch} from 'react-router';

import {Page} from '../../../shared/constants/settings';

import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';

import {ChytPageList} from './ChytPageList/ChytPageList';
import {ChytPageClique} from './ChytPageClique/ChytPageClique';

export default function ChytPage() {
    return (
        <div className="elements-main-section">
            <ErrorBoundary>
                <Switch>
                    <Route path={`/:cluster/${Page.CHYT}/:alias`} component={ChytPageClique} />
                    <Route path={`/:cluster/${Page.CHYT}`} component={ChytPageList} />
                </Switch>
            </ErrorBoundary>
        </div>
    );
}
