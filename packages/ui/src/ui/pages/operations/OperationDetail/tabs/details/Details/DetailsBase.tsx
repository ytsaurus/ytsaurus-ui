import React, {Component} from 'react';
import cn from 'bem-cn-lite';

import AlertEvents from '../../../../../../components/AlertEvents/AlertEvents';
import {Description} from '../../../../../../pages/operations/OperationDetail/tabs/details/Description';
import CollapsibleSection from '../../../../../../components/CollapsibleSection/CollapsibleSection';
import Button from '../../../../../../components/Button/Button';
import {YTErrorBlock} from '../../../../../../containers/Block/Block';
import Icon from '../../../../../../components/Icon/Icon';
import {Flex, Switch} from '@gravity-ui/uikit';
import {type AlertInfo} from '../../../../../../components/AlertEvents/AlertEvents';
import {
    type AlertEvent,
    type RuntimeItem,
} from '../../../../../../store/reducers/operations/detail';
import {type DetailedOperationSelector} from '../../../../selectors';
import {type YTError} from '../../../../../../types';

import DataFlow from '../DataFlow/DataFlow';
import Specification from '../Specification/Specification';
import Runtime from '../Runtime/Runtime';
import Events from '../Events/Events';
import Tasks from '../Tasks/Tasks';

import i18n from './i18n';

const block = cn('operation-details');

type ReduxProps = {
    collapsibleSize: 'ss';
    alertEvents: AlertInfo[];
    isVanillaGpuOperation: boolean | undefined;
    isOperationInGpuTree: boolean | undefined;
    alert_events: AlertEvent[];
    runtime?: RuntimeItem[] | undefined;
    specification?: unknown;
    resources?: unknown[] | undefined;
    error?: YTError | undefined;
    events?: unknown[] | undefined;
    intermediateResources?: unknown;
    cluster: string;
    operation: DetailedOperationSelector;
    treeConfigs:
        | {
              tree: string;
              config: {main_resource?: 'gpu'; resource_limits?: Record<string, number>};
          }[]
        | undefined;
    showEditPoolsWeightsModal(operation: DetailedOperationSelector, editable?: boolean): void;
};

export class DetailsBase extends Component<ReduxProps> {
    override state = {
        isAbsoluteValue: true,
    };

    handleSwitchChange = (checked: boolean) => {
        this.setState({isAbsoluteValue: checked});
    };

    handleEditClick = () => {
        const {operation, showEditPoolsWeightsModal} = this.props;
        showEditPoolsWeightsModal(operation);
    };

    renderDescription() {
        const {collapsibleSize} = this.props;
        const {description} = this.props.operation;

        return (
            Boolean(description) && (
                <CollapsibleSection
                    name={i18n('title_description')}
                    className={block('description')}
                    size={collapsibleSize}
                    marginDirection="bottom"
                >
                    <Description description={description} />
                </CollapsibleSection>
            )
        );
    }

    renderSpecification() {
        const {specification, cluster, collapsibleSize} = this.props;

        return (
            <CollapsibleSection
                name={i18n('title_specification')}
                className={block('specification')}
                size={collapsibleSize}
                marginDirection="bottom"
            >
                <Specification specification={specification} cluster={cluster} />
            </CollapsibleSection>
        );
    }

    renderAlerts() {
        const {alertEvents, collapsibleSize, isVanillaGpuOperation} = this.props;
        return !alertEvents?.length ? null : (
            <CollapsibleSection
                name={i18n('title_alerts')}
                size={collapsibleSize}
                marginDirection="bottom"
                collapsed={isVanillaGpuOperation}
            >
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
                title={i18n('context_edit-pools-and-weights')}
                className={block('edit-button')}
            >
                <Icon awesome="pencil" />
                &nbsp;{i18n('action_edit')}
            </Button>
        );
    }

    renderRuntime() {
        const {runtime, operation, cluster, collapsibleSize, treeConfigs} = this.props;

        return (
            runtime !== undefined &&
            runtime.length > 0 && (
                <CollapsibleSection
                    name={i18n('title_runtime')}
                    className={block('runtime')}
                    overview={this.renderRuntimeOverview()}
                    size={collapsibleSize}
                    marginDirection="bottom"
                >
                    <Flex className={block('runtime-switch')} gap={2}>
                        {i18n('context_show-abs-resources')}{' '}
                        <Switch
                            checked={this.state.isAbsoluteValue}
                            onUpdate={this.handleSwitchChange}
                        ></Switch>
                    </Flex>
                    <Runtime
                        isAbsoluteValue={this.state.isAbsoluteValue}
                        runtime={runtime}
                        treeConfigs={treeConfigs}
                        operation={operation}
                        cluster={cluster}
                    />
                </CollapsibleSection>
            )
        );
    }

    renderJobs() {
        const {collapsibleSize, isVanillaGpuOperation} = this.props;
        return (
            <Tasks
                className={block('jobs')}
                collapsibleSize={collapsibleSize}
                collapsed={isVanillaGpuOperation}
            />
        );
    }

    renderResources() {
        const {resources, intermediateResources, operation, collapsibleSize} = this.props;

        return (
            resources &&
            operation.type !== 'vanilla' && (
                <CollapsibleSection
                    name={i18n('title_data-flow')}
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
        const {events, collapsibleSize, isOperationInGpuTree} = this.props;

        return (
            events && (
                <CollapsibleSection
                    name={i18n('title_events')}
                    className={block('events')}
                    size={collapsibleSize}
                    marginDirection="bottom"
                    collapsed={isOperationInGpuTree}
                >
                    <Events events={events} />
                </CollapsibleSection>
            )
        );
    }

    override render() {
        const {isVanillaGpuOperation} = this.props;
        return (
            <div className={block()}>
                <div className={block('section')}>
                    {this.renderDescription()}
                    {this.renderSpecification()}
                </div>

                <div className={block('section')}>
                    {isVanillaGpuOperation ? (
                        <React.Fragment>
                            {this.renderError()}
                            {this.renderRuntime()}
                            {this.renderResources()}
                            {this.renderEvents()}
                            {this.renderAlerts()}
                            {this.renderJobs()}
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            {this.renderAlerts()}
                            {this.renderError()}
                            {this.renderRuntime()}
                            {this.renderJobs()}
                            {this.renderResources()}
                            {this.renderEvents()}
                        </React.Fragment>
                    )}
                </div>
            </div>
        );
    }
}
