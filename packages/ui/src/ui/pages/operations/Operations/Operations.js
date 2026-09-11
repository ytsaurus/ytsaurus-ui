import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {Route, Switch, withRouter} from 'react-router';

import {EditOperationDialog} from '../EditOperationDialog/EditOperationDialog';
import OperationsList from '../OperationsList/OperationsList';
import OperationDetail from '../OperationDetail/OperationDetail';
import {DASHBOARD_VIEW_CONTEXT} from '../../../constants/index';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {hideEditPoolsWeightsModal, updateOperationsList} from '../../../store/actions/operations';
import {getOperation} from '../../../store/actions/operations/detail';

import './Operations.scss';

const block = cn('operations');

function LegacyEditOperationDialog({isOperationsList}) {
    const dispatch = useDispatch();
    const {visible, operation} = useSelector((state) => state.operations.page.editWeightModal);
    const operationId = operation.$value;

    if (!operationId) {
        return null;
    }

    return (
        <EditOperationDialog
            operationId={operationId}
            visible={visible}
            onClose={() => dispatch(hideEditPoolsWeightsModal())}
            onSuccess={() =>
                dispatch(isOperationsList ? updateOperationsList() : getOperation(operationId))
            }
        />
    );
}

LegacyEditOperationDialog.propTypes = {
    isOperationsList: PropTypes.bool.isRequired,
};

function Operations(props) {
    const {location, match, viewContext} = props;
    const className = viewContext !== DASHBOARD_VIEW_CONTEXT ? 'elements-main-section' : '';
    const isOperationsList = location.pathname === match.url;

    return (
        <div className={block(null, className)}>
            <LegacyEditOperationDialog isOperationsList={isOperationsList} />
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
        url: PropTypes.string.isRequired,
    }).isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
    }).isRequired,
};

export default withRouter(Operations);
