import {connect} from 'react-redux';

import {updateFilter} from '../../../../../../store/actions/operations/jobs';
import {getActualValue} from '../../../../../../pages/operations/selectors';
import OperationSelectFilter from '../../../../../../pages/operations/OperationSelectFilter/OperationSelectFilter';

function mapStateToProps({operations}, ownProps) {
    const filters = operations.jobs.filters;
    const {name, states: initialStates, statesProvider} = ownProps;
    const {defaultValue, value, counters} = filters[name];

    const states =
        typeof statesProvider === 'function' ? statesProvider(operations) : initialStates;

    return {
        value: getActualValue(value, defaultValue),
        states,
        counters,
    };
}

export default connect(mapStateToProps, {updateFilter})(OperationSelectFilter);
