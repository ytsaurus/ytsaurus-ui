import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, withRouter} from 'react-router';

import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import TabletDetails from '../../pages/tablet/TabletDetails/TabletDetails';

Tablet.propTypes = {
    // from react-router
    match: PropTypes.shape({
        path: PropTypes.string.isRequired,
    }).isRequired,
};

function Tablet({match}) {
    return (
        <div className="elements-main-section">
            <ErrorBoundary>
                <Switch>
                    <Route path={`${match.path}/:id/`} component={TabletDetails} />
                </Switch>
            </ErrorBoundary>
        </div>
    );
}

export default withRouter(Tablet);
