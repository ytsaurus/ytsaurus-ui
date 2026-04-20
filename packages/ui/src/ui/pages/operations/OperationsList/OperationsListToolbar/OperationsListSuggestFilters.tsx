import React from 'react';
import {connect} from 'react-redux';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';

import OperationSuggestFilter from '../../../../pages/operations/OperationSuggestFilter/OperationSuggestFilter';
import {updateFilter} from '../../../../store/actions/operations/list';
import {getActualValue} from '../../../../pages/operations/selectors';
import {
    selectOperationsListFilters,
    selectOperationsListFixedStartedByFilter_FOR_YTFRONT_2838,
    selectOperationsPoolSuggestions,
    selectOperationsPoolTreeSuggestions,
    selectOperationsUserSuggestions,
} from '../../../../store/selectors/operations';
import {type RootState} from '../../../../store/reducers';
import {type OperationsListFilterName} from '../../../../store/reducers/operations/list/list';
import UIFactory from '../../../../UIFactory';

const mapStateToPropsByFilterName = (state: RootState, name: OperationsListFilterName) => {
    const filters = selectOperationsListFilters(state);
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
        states: selectOperationsPoolTreeSuggestions(state),
        placeholder: 'Pool tree...',
    };
};

export const OperationsListPoolTreeSuggestFilter = connect(mapPoolTreeStateToProps, {updateFilter})(
    OperationSuggestFilter,
);

const mapPoolStateToProps = (state: RootState) => {
    return {
        ...mapStateToPropsByFilterName(state, 'pool'),
        states: selectOperationsPoolSuggestions(state),
        placeholder: 'Filter pool...',
    };
};
export const OperationsListPoolSuggestFilter = connect(mapPoolStateToProps, {
    updateFilter,
})(OperationSuggestFilter);

const mapUserStateToProps = (state: RootState) => {
    const fixedStartedByFilter = selectOperationsListFixedStartedByFilter_FOR_YTFRONT_2838(state);

    return {
        ...mapStateToPropsByFilterName(state, 'user'),
        states: selectOperationsUserSuggestions(state),
        placeholder: fixedStartedByFilter || 'Started by...',
    };
};
export const OperationsListUserSuggestFilter = connect(mapUserStateToProps, {
    updateFilter,
})(OperationSuggestFilter);

function OperationsAccessibleForFilterImpl() {
    const dispatch = useDispatch();
    const {
        subject: {value},
    } = useSelector(selectOperationsListFilters);

    return (
        <div>
            {UIFactory.renderUserSuggest({
                value: typeof value === 'string' && value ? [value] : [],
                onUpdate: ([first] = []) => {
                    dispatch(updateFilter('subject', first));
                },
                width: 'max',
                pin: 'round-clear',
                placeholder: 'Accessible for...',
                hasClear: true,
            })}
        </div>
    );
}

export const OperationsAccessibleForFilter = React.memo(OperationsAccessibleForFilterImpl);
