import React, {Component} from 'react';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import moment from 'moment';

import Error from '../../../components/Error/Error';

import {POLLING_INTERVAL} from '../../../constants/operations/list';
import OperationsListTable from './OperationsListTable/OperationsListTable';
import OperationsListToolbar from './OperationsListToolbar/OperationsListToolbar';
import {updateOperations} from '../../../store/actions/operations/list';
import Updater from '../../../utils/hammer/updater';
import {useAppRumMeasureStart} from '../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {useRumMeasureStop} from '../../../rum/RumUiContext';
import {getOperationsListIsFinalState} from '../../../store/selectors/operations/operations-list';

const block = cn('operations-list');
const updater = new Updater();

class OperationsList extends Component {
    static propTypes = {
        // from connect
        isLoading: PropTypes.bool.isRequired,
        hasLoaded: PropTypes.bool.isRequired,
        hasError: PropTypes.bool.isRequired,
        error: PropTypes.shape({
            message: PropTypes.string,
            details: PropTypes.object,
        }),
        timeRange: PropTypes.shape({
            from: PropTypes.string,
            to: PropTypes.string,
        }).isRequired,
        updateOperations: PropTypes.func.isRequired,
        // from props
        inDashboard: PropTypes.bool,
    };

    static defaultProps = {
        inDashboard: false,
    };

    componentDidMount() {
        this.props.updateOperations();
        this.handlePolling();
    }

    componentDidUpdate(prevProps) {
        const {timeRange: prevTimeRange} = prevProps;

        if (this.isTimeRangeChanged(prevTimeRange)) {
            this.handlePolling();
        }
    }

    componentWillUnmount() {
        updater.remove('operation.list');
    }

    get isBigTimeRange() {
        const {from, to} = this.props.timeRange;
        if (typeof from === 'string' && typeof to === 'string') {
            const dateFrom = moment(from);
            const dateTo = moment(to);
            const diff = dateTo.diff(dateFrom);

            return moment.duration(diff).asDays() >= 1;
        }

        return false;
    }

    handlePolling() {
        const {updateOperations} = this.props;

        if (this.isBigTimeRange) {
            updater.remove('operation.list');
        } else {
            updater.add('operation.list', updateOperations, POLLING_INTERVAL, {
                skipInitialCall: true,
            });
        }
    }

    isTimeRangeChanged(prevTimeRange) {
        const {timeRange} = this.props;

        return timeRange.from !== prevTimeRange.from || timeRange.to !== prevTimeRange.to;
    }

    renderError() {
        const {
            error: {message, details},
        } = this.props;
        return <Error message={message} error={details} />;
    }

    firstTimeError() {
        const {hasLoaded, hasError} = this.props;
        return hasError && !hasLoaded;
    }

    render() {
        const {hasError, inDashboard} = this.props;

        return (
            <div className={block()}>
                {inDashboard && (
                    <div className={cn('elements-heading')({size: 'l'})}>Operations</div>
                )}
                <OperationsListToolbar />
                {hasError && this.renderError()}
                {!this.firstTimeError() && <OperationsListTable />}
            </div>
        );
    }
}

function mapStateToProps({operations}) {
    const {isLoading, hasLoaded, hasError, error, timeRange} = operations.list;

    return {
        timeRange,
        isLoading,
        hasLoaded,
        hasError,
        error,
    };
}

const mapDispatchToProps = {
    updateOperations,
};

const OperationsListConnected = connect(mapStateToProps, mapDispatchToProps)(OperationsList);

function OperationsListWithRum() {
    const isFinalStatus = useSelector(getOperationsListIsFinalState);

    useAppRumMeasureStart({
        type: RumMeasureTypes.OPERATIONS_LIST,
        startDeps: [isFinalStatus],
        allowStart: ([isFinal]) => {
            return !isFinal;
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.OPERATIONS_LIST,
        stopDeps: [isFinalStatus],
        allowStop: ([isFinal]) => {
            return isFinal;
        },
    });

    return <OperationsListConnected />;
}

export default React.memo(OperationsListWithRum);
