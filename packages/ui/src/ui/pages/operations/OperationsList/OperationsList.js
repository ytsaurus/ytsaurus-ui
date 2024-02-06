import React, {Component} from 'react';
import {connect, useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import moment from 'moment';

import Error from '../../../components/Error/Error';

import OperationsListTable from './OperationsListTable/OperationsListTable';
import OperationsListToolbar from './OperationsListToolbar/OperationsListToolbar';
import {updateOperationsByParams} from '../../../store/actions/operations/list';
import {useMemoizedIfEqual, useUpdater} from '../../../hooks/use-updater';
import {useAppRumMeasureStart} from '../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {useRumMeasureStop} from '../../../rum/RumUiContext';
import {getOperationsListIsFinalState} from '../../../store/selectors/operations/operations-list';
import {getCluster} from '../../../store/selectors/global';
import {getListRequestParameters} from '../../../store/actions/operations/utils';

const block = cn('operations-list');

function OperationListUpdater({timeRange}) {
    const dispatch = useDispatch();

    const cluster = useSelector(getCluster);
    const parameters = useSelector(getListRequestParameters);

    const params = useMemoizedIfEqual(cluster, parameters);

    const updateFn = React.useCallback(() => {
        dispatch(updateOperationsByParams(...params));
    }, [dispatch, params]);

    useUpdater(updateFn, {onlyOnce: isBigTimeRange(timeRange)});

    return null;
}

function isBigTimeRange(timeRange) {
    const {from, to} = timeRange;
    if (typeof from === 'string' && typeof to === 'string') {
        const dateFrom = moment(from);
        const dateTo = moment(to);
        const diff = dateTo.diff(dateFrom);

        return moment.duration(diff).asDays() >= 1;
    }

    return false;
}

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
        // from props
        inDashboard: PropTypes.bool,
    };

    static defaultProps = {
        inDashboard: false,
    };

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
        const {hasError, inDashboard, timeRange} = this.props;

        return (
            <div className={block()}>
                <OperationListUpdater timeRange={timeRange} />
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

const OperationsListConnected = connect(mapStateToProps)(OperationsList);

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
