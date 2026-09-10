import React from 'react';

import ClickableAttributesButton from '../../../../../components/AttributesButton/ClickableAttributesButton';
import Button from '../../../../../components/Button/Button';
import Icon from '../../../../../components/Icon/Icon';
import ChartLink from '../../../../../components/ChartLink/ChartLink';

import UIFactory from '../../../../../UIFactory';
import {type NodeMaintenanceState} from '../../../../../store/reducers/components/node-maintenance-modal';

type NodeActionsProps = {node: {host: string}} & {
    cluster: string;
    showNodeMaintenance(params: Pick<NodeMaintenanceState, 'address' | 'component'>): void;
};

export class NodeActionsBase extends React.Component<NodeActionsProps> {
    handleEditClick = () => {
        const {node, showNodeMaintenance} = this.props;

        showNodeMaintenance({
            address: node.host,
            component: 'cluster_node',
        });
    };

    override render() {
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
