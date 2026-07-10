import {connect} from 'react-redux';

import OperationSelectFilter from '../../../../../../pages/operations/OperationSelectFilter/OperationSelectFilter';
import {getActualValue, selectStateFilterValue} from '../../../../../../pages/operations/selectors';
import {updateListJobsFilter} from '../../../../../../store/actions/operations/jobs';
import {type RootState} from '../../../../../../store/reducers';

type NameType = 'taskName' | 'type' | 'state';

export type StateItem = {name: string; caption?: string};

export interface OwnProps {
    name: NameType;
    states?: Array<StateItem>;
    statesProvider?: (operations: RootState['operations']) => Array<StateItem>;
}

function mapStateToProps(state: RootState, ownProps: OwnProps) {
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
    updateFilter: (name: string, value: string | string[] | undefined) =>
        updateListJobsFilter({name: name as NameType, value: value as any}),
})(OperationSelectFilter);
