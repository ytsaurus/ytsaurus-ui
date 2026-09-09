import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {updateFilter} from '../../../../../store/actions/operations';

import {OperationsTextFilterBase} from './OperationsTextFilterBase';

function mapStateToProps({operations}) {
    return {
        filter: operations.list.filters.text,
        activePreset: operations.list.activePreset,
    };
}

const mapDispatchToProps = {updateFilter};

export const OperationsTextFilter = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(OperationsTextFilterBase),
);
