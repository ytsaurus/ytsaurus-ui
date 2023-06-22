import {connect} from 'react-redux';

import OperationSelectFilter from '../../../../pages/operations/OperationSelectFilter/OperationSelectFilter';
import {updateFilter} from '../../../../store/actions/operations/list';
import {getActualValue, getCounters} from '../../../../pages/operations/selectors';

function mapStateToProps({operations}, ownProps) {
    const filters = operations.list.filters;
    const {name, states} = ownProps;
    const {defaultValue, value, counters: rawCounters} = filters[name];

    const counters = getCounters(name, states, rawCounters);

    return {
        value: getActualValue(value, defaultValue),
        defaultValue,
        counters,
    };
}

export default connect(mapStateToProps, {updateFilter})(OperationSelectFilter);
