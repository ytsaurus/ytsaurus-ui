import {connect} from 'react-redux';

import {updateListJobsFilter} from '../../../../../../store/actions/operations/jobs';
import {getActualValue, selectStateFilterValue} from '../../../../../../pages/operations/selectors';
import OperationSelectFilter from '../../../../../../pages/operations/OperationSelectFilter/OperationSelectFilter';

function mapStateToProps(state, ownProps) {
    const operations = state.operations;
    const filters = operations.jobs.filters;
    const {name, states: initialStates, statesProvider} = ownProps;
    const {defaultValue, value, counters} = filters[name];

    const states =
        typeof statesProvider === 'function' ? statesProvider(operations) : initialStates;

    const displayValue =
        name === 'state' ? selectStateFilterValue(state) : getActualValue(value, defaultValue);

    return {
        value: displayValue,
        states,
        counters,
    };
}

export default connect(mapStateToProps, {
    updateFilter: (name, value) => updateListJobsFilter({name, value}),
})(OperationSelectFilter);
