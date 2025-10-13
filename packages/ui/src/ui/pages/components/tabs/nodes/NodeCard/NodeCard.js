import React, {Component} from 'react';
import {connect} from 'react-redux';
import {useDispatch} from '../../../../../store/redux-hooks';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {Progress} from '@gravity-ui/uikit';

import Icon from '../../../../../components/Icon/Icon';
import Link from '../../../../../components/Link/Link';
import Label from '../../../../../components/Label/Label';
import {YTAlertBlock} from '../../../../../components/Alert/Alert';
import Button from '../../../../../components/Button/Button';
import {YTErrorBlock} from '../../../../../components/Error/Error';
import MetaTable, {Template} from '../../../../../components/MetaTable/MetaTable';
import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';

import {loadNodeAttributes} from '../../../../../store/actions/components/node/node';
import {getSortedItems} from '../../../../../store/selectors/components/nodes/node-card';

import {nodeSelector} from '../../../../../store/selectors/components/node/node';
import {getCluster, getCurrentClusterConfig} from '../../../../../store/selectors/global';
import hammer from '../../../../../common/hammer';
import NodeCpuAndMemory, {
    hasCpuAndMemoryMeta,
} from '../../../../../pages/components/tabs/node/NodeCpuAndMemory/NodeCpuAndMemory';
import NodeResources, {
    hasResourcesMeta,
} from '../../../../../pages/components/tabs/node/NodeResources/NodeResources';
import NodeStorage, {
    hasStorageMeta,
} from '../../../../../pages/components/tabs/node/NodeStorage/NodeStorage';
import NodeTabletSlots from '../../../../../pages/components/tabs/node/NodeTabletSlots/NodeTabletSlots';
import {useUpdater} from '../../../../../hooks/use-updater';

import withSplit from '../../../../../hocs/withSplit';
import UIFactory from '../../../../../UIFactory';
import ClipboardButton from '../../../../../components/ClipboardButton/ClipboardButton';
import {makeComponentsNodesUrl} from '../../../../../utils/app-url';
import {getNodeMetaItems} from '../../../../../utils/components/nodes/node-meta-items';

import './NodeCard.scss';

const block = cn('node-card');

export const nodeProps = PropTypes.shape({
    locations: PropTypes.arrayOf(
        PropTypes.shape({
            low_watermark_space: PropTypes.number.isRequired,
            available_space: PropTypes.number.isRequired,
            session_count: PropTypes.number.isRequired,
            chunk_count: PropTypes.number.isRequired,
            used_space: PropTypes.number.isRequired,
            throttling_writes: PropTypes.bool.isRequired,
            throttling_reads: PropTypes.bool.isRequired,
            enabled: PropTypes.bool.isRequired,
            sick: PropTypes.bool.isRequired,
            full: PropTypes.bool.isRequired,
            medium_name: PropTypes.string.isRequired,
            location_uuid: PropTypes.string.isRequired,
        }),
    ),
    tabletSlots: PropTypes.shape({
        byState: PropTypes.object.isRequired,
        raw: PropTypes.array.isRequired,
    }),
    host: PropTypes.string.isRequired,
    alerts: PropTypes.arrayOf(PropTypes.object),
    banned: PropTypes.bool.isRequired,
    disableJobs: PropTypes.bool.isRequired,
    disableTabletCells: PropTypes.bool.isRequired,
    disableWriteSession: PropTypes.bool.isRequired,
});

function NodeCardUpdater({host}) {
    const dispatch = useDispatch();

    const updateFn = React.useCallback(() => {
        dispatch(loadNodeAttributes(host));
    }, [dispatch, host]);

    useUpdater(updateFn, {timeout: 15 * 1000, onlyOnce: !host});
    return null;
}

class NodeCard extends Component {
    static propTypes = {
        // from parent
        handleClose: PropTypes.func.isRequired,
        handleKeyDown: PropTypes.func,
        // from connect
        node: nodeProps,
        tabletSlots: PropTypes.array,
        loadNodeAttributes: PropTypes.func.isRequired,
    };

    componentWillUnmount() {
        this.props.handleClose();
    }

    renderTop() {
        const {clusterConfig} = this.props;
        const {physicalHost, host} = this.props.node;
        return UIFactory.renderComponentsNodeCardTop({host, physicalHost, clusterConfig});
    }

    renderLocation(location, index) {
        return (
            <div className={block('location')} key={index}>
                <MetaTable
                    items={[
                        {
                            key: 'uuid',
                            value: (
                                <span>
                                    {location.location_uuid}
                                    &nbsp;
                                    <ClipboardButton
                                        view="flat-secondary"
                                        text={location.location_uuid}
                                        size="s"
                                    />
                                </span>
                            ),
                        },
                        {key: 'location number', value: index + 1},
                        {key: 'enabled', value: location.enabled.toString()},
                        {key: 'full', value: location.full.toString()},
                        {key: 'medium name', value: location.medium_name},
                        {key: 'sessions', value: location.session_count},
                        {
                            key: 'chunks',
                            value: hammer.format['Number'](location.chunk_count),
                        },
                        {
                            key: 'used space',
                            value: (
                                <Progress
                                    value={location.locationProgress}
                                    text={location.locationText}
                                    theme="success"
                                />
                            ),
                        },
                        {
                            key: 'available space',
                            value: (
                                <Template.FormattedValue
                                    value={location.available_space}
                                    format="Bytes"
                                />
                            ),
                        },
                        {
                            key: 'watermark space',
                            value: (
                                <Template.FormattedValue
                                    value={location.low_watermark_space}
                                    format="Bytes"
                                />
                            ),
                        },
                    ]}
                />
            </div>
        );
    }

    renderLocations() {
        const {locations} = this.props.node;

        return (
            locations && (
                <CollapsibleSection
                    size="s"
                    name="Locations"
                    className={block('locations')}
                    collapsed
                >
                    {map_(locations, (location, index) => this.renderLocation(location, index))}
                </CollapsibleSection>
            )
        );
    }

    renderAlerts() {
        const {alerts} = this.props.node;

        return (
            alerts?.length > 0 && (
                <CollapsibleSection size="s" name="Alerts" className={block('alerts')} collapsed>
                    {map_(alerts, (alert) => (
                        <YTAlertBlock key={alert.message} error={alert} />
                    ))}
                </CollapsibleSection>
            )
        );
    }

    renderTabletSlots() {
        const {tabletSlots} = this.props;

        return (
            tabletSlots.length > 0 && (
                <CollapsibleSection size="s" name="Tablet slots" collapsed={false}>
                    <NodeTabletSlots tabletSlots={tabletSlots} />
                </CollapsibleSection>
            )
        );
    }

    renderDefault() {
        const {systemTags, userTags} = this.props.node;

        return (
            <CollapsibleSection size="s" name="Default" className={block('default')}>
                <MetaTable
                    items={[
                        {
                            key: 'system_tags',
                            value: map_(systemTags, (tag) => <Label key={tag} text={tag} />),
                            visible: systemTags?.length > 0,
                        },
                        {
                            key: 'user_tags',
                            value: map_(userTags, (tag) => <Label key={tag} text={tag} />),
                            visible: userTags?.length > 0,
                        },
                        ...getNodeMetaItems(this.props.node),
                    ]}
                />
            </CollapsibleSection>
        );
    }

    renderStorage() {
        const {node} = this.props;
        const hasMeta = hasStorageMeta(node);

        return (
            hasMeta && (
                <CollapsibleSection size="s" name="Storage" className={block('storage')} collapsed>
                    <NodeStorage {...node} />
                </CollapsibleSection>
            )
        );
    }

    renderCpuAndMemory() {
        const {node} = this.props;
        const hasMeta = hasCpuAndMemoryMeta(node);

        return (
            hasMeta && (
                <CollapsibleSection
                    size="s"
                    name="CPU and memory"
                    className={block('cpu')}
                    collapsed
                >
                    <NodeCpuAndMemory {...{node}} />
                </CollapsibleSection>
            )
        );
    }

    renderResources() {
        const {node} = this.props;
        const hasMeta = hasResourcesMeta(node);

        return (
            hasMeta && (
                <CollapsibleSection
                    size="s"
                    name="Resources"
                    className={block('resources')}
                    collapsed
                >
                    <NodeResources {...node} />
                </CollapsibleSection>
            )
        );
    }

    renderCard() {
        const {cluster, handleClose, handleKeyDown, errorData, node} = this.props;

        return (
            <div className={block()} onKeyDown={handleKeyDown} tabIndex={-1}>
                <div className={block('header')}>
                    <Link
                        routed
                        url={makeComponentsNodesUrl({cluster, host: node?.host})}
                        className={block('node')}
                    >
                        {node?.host}
                    </Link>

                    <Button view="flat-secondary" size="m" onClick={handleClose}>
                        <Icon awesome="times" face={'light'} />
                    </Button>
                </div>

                {errorData && <YTErrorBlock error={errorData} />}

                {Boolean(node) && (
                    <React.Fragment>
                        {this.renderTop()}
                        {this.renderDefault()}
                        {this.renderAlerts()}
                        {this.renderLocations()}
                        {this.renderTabletSlots()}
                        {this.renderCpuAndMemory()}
                        {this.renderStorage()}
                        {this.renderResources()}
                    </React.Fragment>
                )}
            </div>
        );
    }

    render() {
        return (
            <React.Fragment>
                <NodeCardUpdater host={this.props.host} />
                {this.renderCard()}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const {node, loaded, error, errorData} = nodeSelector(state);
    const cluster = getCluster(state);

    return {
        cluster,
        error,
        errorData,
        loaded,
        node,
        tabletSlots: node && getSortedItems(state, {node}),
        clusterConfig: getCurrentClusterConfig(state),
    };
};

const mapDispatchToProps = {
    loadNodeAttributes,
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withSplit)(NodeCard);
