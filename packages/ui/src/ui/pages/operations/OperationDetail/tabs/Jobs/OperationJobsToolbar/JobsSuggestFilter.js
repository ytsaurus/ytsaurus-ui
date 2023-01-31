import {connect} from 'react-redux';

import OperationSuggestFilter from '../../../../../../pages/operations/OperationSuggestFilter/OperationSuggestFilter';
import {updateFilter} from '../../../../../../store/actions/operations/jobs';
import {getActualValue} from '../../../../../../pages/operations/selectors';

function mapStateToProps({operations}, ownProps) {
    const filters = operations.jobs.filters;
    const {statesProvider, name} = ownProps;
    const {defaultValue, value, data} = filters[name];
    const states = statesProvider(data);

    return {
        value: getActualValue(value, defaultValue),
        states,
        defaultValue,
        placeholder: `Filter ${name}...`,
    };
}

export default connect(mapStateToProps, {updateFilter})(OperationSuggestFilter);
