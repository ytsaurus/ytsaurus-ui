import React, {Component} from 'react';
import {connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import AlertEvents from '../../../../../../components/AlertEvents/AlertEvents';
import OperationDescription from '../../../../../../pages/operations/OperationDetail/tabs/details/Description';
import CollapsibleSection from '../../../../../../components/CollapsibleSection/CollapsibleSection';
import Button from '../../../../../../components/Button/Button';
import {YTErrorBlock} from '../../../../../../components/Error/Error';
import Icon from '../../../../../../components/Icon/Icon';

import DataFlow, {intermediateResourcesProps, resourcesProps} from '../DataFlow/DataFlow';
import Specification, {specificationProps} from '../Specification/Specification';
import Runtime, {operationProps, runtimeProps} from '../Runtime/Runtime';
import Events, {eventsProps} from '../Events/Events';
import Tasks from '../Tasks/Tasks';

import {showEditPoolsWeightsModal} from '../../../../../../store/actions/operations';

import {useRumMeasureStop} from '../../../../../../rum/RumUiContext';
import {RumMeasureTypes} from '../../../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../../../utils/utils';
import {
    getOperationAlertEvents,
    getOperationDetailsLoadingStatus,
} from '../../../../../../store/selectors/operations/operation';
import {useAppRumMeasureStart} from '../../../../../../rum/rum-app-measures';

import './Details.scss';
import {UI_COLLAPSIBLE_SIZE} from '../../../../../../constants/global';

export {operationProps} from '../Runtime/Runtime';

const block = cn('operation-details');

class Details extends Component {
    static propTypes = {
        error: PropTypes.object,
        specification: specificationProps.isRequired,
        operation: operationProps.isRequired,
        cluster: PropTypes.string.isRequired,
        result: PropTypes.shape({
            error: PropTypes.object.isRequired,
        }),
        runtime: runtimeProps,
        events: eventsProps,
        resources: resourcesProps,
        intermediateResources: intermediateResourcesProps,
        showEditPoolsWeightsModal: PropTypes.func.isRequired,
    };

    handleEditClick = () => {
        const {operation, showEditPoolsWeightsModal} = this.props;
        showEditPoolsWeightsModal(operation);
    };

    renderDescription() {
        const {description, collapsibleSize} = this.props.operation;

        return (
            description && (
                <CollapsibleSection
                    name="Description"
                    className={block('description')}
                    size={collapsibleSize}
                    marginDirection="bottom"
                >
                    <OperationDescription description={description} />
                </CollapsibleSection>
            )
        );
    }

    renderSpecification() {
        const {specification, cluster, collapsibleSize} = this.props;

        return (
            <CollapsibleSection
                name="Specification"
                className={block('specification')}
                size={collapsibleSize}
                marginDirection="bottom"
            >
                <Specification specification={specification} cluster={cluster} />
            </CollapsibleSection>
        );
    }

    renderAlerts() {
        const {alertEvents, collapsibleSize} = this.props;
        return !alertEvents?.length ? null : (
            <CollapsibleSection name="Alerts" size={collapsibleSize} marginDirection="bottom">
                <AlertEvents items={alertEvents} />
            </CollapsibleSection>
        );
    }

    renderError() {
        const {error} = this.props;

        return (
            error && (
                <div className={block('result')}>
                    <YTErrorBlock {...error} disableLogger />
                </div>
            )
        );
    }

    renderRuntimeOverview() {
        return (
            <Button
                size="s"
                onClick={this.handleEditClick}
                title="Edit pools and weights"
                className={block('edit-button')}
            >
                <Icon awesome="pencil" />
                &nbsp;Edit
            </Button>
        );
    }

    renderRuntime() {
        const {runtime, operation, cluster, collapsibleSize} = this.props;

        return (
            runtime?.length > 0 && (
                <CollapsibleSection
                    name="Runtime"
                    className={block('runtime')}
                    overview={this.renderRuntimeOverview()}
                    size={collapsibleSize}
                    marginDirection="bottom"
                >
                    <Runtime runtime={runtime} operation={operation} cluster={cluster} />
                </CollapsibleSection>
            )
        );
    }

    renderJobs() {
        const {collapsibleSize} = this.props;
        return <Tasks className={block('jobs')} size={collapsibleSize} />;
    }

    renderResources() {
        const {resources, intermediateResources, operation, collapsibleSize} = this.props;

        return (
            resources &&
            operation.type !== 'vanilla' && (
                <CollapsibleSection
                    name="Data flow"
                    className={block('resources')}
                    size={collapsibleSize}
                    marginDirection="bottom"
                >
                    <DataFlow
                        operation={operation}
                        resources={resources}
                        intermediateResources={intermediateResources}
                    />
                </CollapsibleSection>
            )
        );
    }

    renderEvents() {
        const {events, collapsibleSize} = this.props;

        return (
            events && (
                <CollapsibleSection
                    name="Events"
                    className={block('events')}
                    size={collapsibleSize}
                    marginDirection="bottom"
                >
                    <Events events={events} />
                </CollapsibleSection>
            )
        );
    }

    render() {
        return (
            <div className={block()}>
                <div className={block('section')}>
                    {this.renderDescription()}
                    {this.renderSpecification()}
                </div>

                <div className={block('section')}>
                    {this.renderAlerts()}
                    {this.renderError()}
                    {this.renderRuntime()}
                    {this.renderJobs()}
                    {this.renderResources()}
                    {this.renderEvents()}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {operations, global} = state;

    const {cluster} = global;
    const {operation} = operations.detail;

    return {
        cluster,
        operation,
        ...operations.detail.details,
        collapsibleSize: UI_COLLAPSIBLE_SIZE,
        alertEvents: getOperationAlertEvents(state),
    };
};

const mapDispatchToProps = {
    showEditPoolsWeightsModal,
};

const DetailsConnected = connect(mapStateToProps, mapDispatchToProps)(Details);

export default function DetailsWithRum() {
    const loadState = useSelector(getOperationDetailsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.OPERATION_TAB_DETAILS,
        additionalStartType: RumMeasureTypes.OPERATION,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.OPERATION_TAB_DETAILS,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <DetailsConnected />;
}
