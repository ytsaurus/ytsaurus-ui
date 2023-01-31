import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {Route, Switch, withRouter} from 'react-router';

import PoolsWeightsEditModal from '../PoolsWeightsEditModal/PoolsWeightsEditModal';
import OperationsList from '../OperationsList/OperationsList';
import OperationDetail from '../OperationDetail/OperationDetail';
import {DASHBOARD_VIEW_CONTEXT} from '../../../constants/index';

const block = cn('operations');

function Operations(props) {
    const {match, viewContext} = props;
    const className = viewContext !== DASHBOARD_VIEW_CONTEXT ? 'elements-main-section' : '';

    return (
        <div className={block(null, className)}>
            <PoolsWeightsEditModal />
            <Switch>
                <Route path={match.path} exact render={() => <OperationsList />} />
                <Route path={`${match.path}/:operationId/:tab?`} component={OperationDetail} />
            </Switch>
        </div>
    );
}

Operations.propTypes = {
    // from parent
    viewContext: PropTypes.string,

    // from react-router
    match: PropTypes.shape({
        path: PropTypes.string.isRequired,
    }).isRequired,
};

export default withRouter(Operations);
