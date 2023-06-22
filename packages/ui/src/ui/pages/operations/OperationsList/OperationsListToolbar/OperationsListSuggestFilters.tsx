import React from 'react';
import {connect, useDispatch, useSelector} from 'react-redux';

import OperationSuggestFilter from '../../../../pages/operations/OperationSuggestFilter/OperationSuggestFilter';
import {updateFilter} from '../../../../store/actions/operations/list';
import {getActualValue} from '../../../../pages/operations/selectors';
import {
    getOperationsListFilters,
    getOperationsListFixedStartedByFilter_FOR_YTFRONT_2838,
    getOperationsPoolSuggestions,
    getOperationsPoolTreeSuggestions,
    getOperationsUserSuggestions,
} from '../../../../store/selectors/operations';
import {RootState} from '../../../../store/reducers';
import {OperationsListFilterName} from '../../../../store/reducers/operations/list/list';
import UIFactory from '../../../../UIFactory';

const mapStateToPropsByFilterName = (state: RootState, name: OperationsListFilterName) => {
    const filters = getOperationsListFilters(state);
    const {defaultValue, value} = filters[name];

    return {
        name,
        value: getActualValue(value, defaultValue),
        defaultValue,
    };
};

const mapPoolTreeStateToProps = (state: RootState) => {
    return {
        ...mapStateToPropsByFilterName(state, 'poolTree'),
        states: getOperationsPoolTreeSuggestions(state),
        placeholder: 'Pool tree...',
    };
};

export const OperationsListPoolTreeSuggestFilter = connect(mapPoolTreeStateToProps, {updateFilter})(
    OperationSuggestFilter,
);

const mapPoolStateToProps = (state: RootState) => {
    return {
        ...mapStateToPropsByFilterName(state, 'pool'),
        states: getOperationsPoolSuggestions(state),
        placeholder: 'Filter pool...',
    };
};
export const OperationsListPoolSuggestFilter = connect(mapPoolStateToProps, {
    updateFilter,
})(OperationSuggestFilter);

const mapUserStateToProps = (state: RootState) => {
    const fixedStartedByFilter = getOperationsListFixedStartedByFilter_FOR_YTFRONT_2838(state);

    return {
        ...mapStateToPropsByFilterName(state, 'user'),
        states: getOperationsUserSuggestions(state),
        placeholder: fixedStartedByFilter || 'Started by...',
    };
};
export const OperationsListUserSuggestFilter = connect(mapUserStateToProps, {
    updateFilter,
})(OperationSuggestFilter);

function OperationsAccessibleForFilterImpl() {
    const dispatch = useDispatch();
    const {
        subject: {value, defaultValue},
    } = useSelector(getOperationsListFilters);

    const actualValue = getActualValue(value, defaultValue);

    return (
        <div>
            {UIFactory.renderUserSuggest({
                value: typeof actualValue === 'string' && actualValue ? [actualValue] : [],
                onUpdate: ([first] = []) => {
                    dispatch(updateFilter('subject', first));
                },
                width: 'max',
                pin: 'round-clear',
            })}
        </div>
    );
}

export const OperationsAccessibleForFilter = React.memo(OperationsAccessibleForFilterImpl);
