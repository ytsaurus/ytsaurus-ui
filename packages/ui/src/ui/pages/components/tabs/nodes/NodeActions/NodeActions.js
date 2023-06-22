import React, {Component, Fragment} from 'react';
import cn from 'bem-cn-lite';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';

import ClickableAttributesButton from '../../../../../components/AttributesButton/ClickableAttributesButton';
import Button from '../../../../../components/Button/Button';
import Icon from '../../../../../components/Icon/Icon';
import ChartLink from '../../../../../components/ChartLink/ChartLink';

import './NodeActions.scss';

const block = cn('node-actions');

import {
    JOBS,
    TABLET_CELLS,
    WRITE_SESSION,
} from '../../../../../constants/components/nodes/actions/disable-enable';
import {openResourcesModal} from '../../../../../store/actions/components/nodes/actions/set-resources-limits';
import {openDisableModal} from '../../../../../store/actions/components/nodes/actions/disable-enable';
import {openBanModal, openUnbanModal} from '../../../../../store/actions/components/ban-unban';
import {nodeProps} from '../../../../../pages/components/tabs/nodes/NodeCard/NodeCard';
import {getCluster} from '../../../../../store/selectors/global';
import {DropdownMenu} from '@gravity-ui/uikit';
import {toggleNodeDecommissioned} from '../../../../../store/actions/components/nodes/actions/decommission';

import UIFactory from '../../../../../UIFactory';

const withPropagationStopped = (item) => ({
    ...item,
    action:
        item.action &&
        function (evt, ...rest) {
            evt.stopPropagation();
            return item.action.call(this, evt, ...rest);
        },
});

class NodeActions extends Component {
    static propTypes = {
        // from parent
        node: nodeProps.isRequired,

        // from connect
        openBanModal: PropTypes.func.isRequired,
        openUnbanModal: PropTypes.func.isRequired,
        openDisableModal: PropTypes.func.isRequired,
        openResourcesModal: PropTypes.func.isRequired,
    };

    get items() {
        const {openDisableModal, openResourcesModal, toggleNodeDecommissioned, node} = this.props;
        const {host, disableWriteSession, disableTabletCells, disableJobs, decommissioned} = node;

        const writeSessionType = disableWriteSession ? 'enable' : 'disable';
        const tabletCellsType = disableTabletCells ? 'enable' : 'disable';
        const jobsType = disableJobs ? 'enable' : 'disable';

        return [
            {
                text: disableJobs ? 'Enable jobs' : 'Disable jobs',
                action: () => openDisableModal({host, type: jobsType, subject: JOBS}),
            },
            {
                text: disableWriteSession ? 'Enable write session' : 'Disable write session',
                action: () =>
                    openDisableModal({
                        host,
                        type: writeSessionType,
                        subject: WRITE_SESSION,
                    }),
            },
            {
                text: disableTabletCells ? 'Enable tablet cells' : 'Disable tablet cells',
                action: () =>
                    openDisableModal({
                        host,
                        type: tabletCellsType,
                        subject: TABLET_CELLS,
                    }),
            },
            {
                text: decommissioned ? 'Recommission node' : 'Decommission node',
                action: () => {
                    toggleNodeDecommissioned(node);
                },
            },
            {
                text: 'Set resource limits',
                action: () => openResourcesModal(node),
                disabled: _.keys(node.resourcesLimit).length === 0,
            },
        ].map(withPropagationStopped);
    }

    get tooltipProps() {
        const {node} = this.props;

        return {
            placement: 'bottom',
            content: node.banned ? 'Unban node' : 'Ban node',
        };
    }

    handleBanClick = () => {
        const {node, openBanModal} = this.props;

        openBanModal(node.host);
    };

    handleUnbanClick = () => {
        const {node, openUnbanModal} = this.props;

        openUnbanModal(node.host);
    };

    render() {
        const {node, cluster} = this.props;
        const icon = <Icon awesome="ellipsis-h" />;
        const button = <Button view="flat-secondary">{icon}</Button>;

        const {url, title} = UIFactory.getComponentsNodeDashboardUrl({cluster, host: node.host});

        return (
            <Fragment>
                <ClickableAttributesButton
                    title={node.host}
                    path={`//sys/cluster_nodes/${node.host}`}
                    withTooltip
                />

                <ChartLink
                    url={url}
                    wrapContent={(node) => (
                        <Button
                            tooltipProps={{
                                placement: 'bottom',
                                content: title,
                            }}
                            target="_blank"
                            view="flat-secondary"
                            size="m"
                            withTooltip
                        >
                            {node}
                        </Button>
                    )}
                />

                {node.banned ? (
                    <Button
                        tooltipProps={this.tooltipProps}
                        onClick={this.handleUnbanClick}
                        view="flat-secondary"
                        size="m"
                        withTooltip
                    >
                        <Icon face="regular" awesome="undo" />
                    </Button>
                ) : (
                    <Button
                        tooltipProps={this.tooltipProps}
                        onClick={this.handleBanClick}
                        view="flat-secondary"
                        size="m"
                        withTooltip
                    >
                        <Icon face="regular" awesome="ban" />
                    </Button>
                )}

                <DropdownMenu
                    size="xl"
                    switcher={button}
                    items={this.items}
                    popupPlacement={['bottom', 'top']}
                    popupClassName={block('popup')}
                />
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        cluster: getCluster(state),
    };
};

const mapDispatchToProps = {
    openBanModal,
    openUnbanModal,
    openDisableModal,
    openResourcesModal,
    toggleNodeDecommissioned,
};

export default connect(mapStateToProps, mapDispatchToProps)(NodeActions);
