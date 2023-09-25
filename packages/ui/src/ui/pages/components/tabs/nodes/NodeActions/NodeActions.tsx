import React from 'react';
import {ConnectedProps, connect} from 'react-redux';

import ClickableAttributesButton from '../../../../../components/AttributesButton/ClickableAttributesButton';
import Button from '../../../../../components/Button/Button';
import Icon from '../../../../../components/Icon/Icon';
import ChartLink from '../../../../../components/ChartLink/ChartLink';

import {getCluster} from '../../../../../store/selectors/global';
import {showNodeMaintenance} from '../../../../../store/actions/components/node-maintenance-modal';

import UIFactory from '../../../../../UIFactory';
import {RootState} from '../../../../../store/reducers';

export type NodeActionsProps = {node: {host: string}} & ConnectedProps<typeof connector>;

class NodeActions extends React.Component<NodeActionsProps> {
    handleEditClick = () => {
        const {node, showNodeMaintenance} = this.props;

        showNodeMaintenance({
            address: node.host,
            component: 'cluster_node',
        });
    };

    render() {
        const {node, cluster} = this.props;
        const {url, title} = UIFactory.getComponentsNodeDashboardUrl({cluster, host: node.host});

        return (
            <React.Fragment>
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
                <Button onClick={this.handleEditClick} view="flat-secondary" size="m" withTooltip>
                    <Icon face="regular" awesome="pencil" />
                </Button>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        cluster: getCluster(state),
    };
};

const mapDispatchToProps = {
    showNodeMaintenance,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(NodeActions);
