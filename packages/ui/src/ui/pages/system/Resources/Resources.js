import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import block from 'bem-cn-lite';

import {Progress} from '@gravity-ui/uikit';
import {addProgressStackSpacers} from '../../../utils/progress';
import {YTErrorBlock} from '../../../containers/Block/Block';
import {
    getMediumList,
    getSystemReservedDiskSpaceByMedium,
    getUncommittedDiskSpaceByMedium,
} from '../../../store/selectors/thor';
import {loadSystemResources} from '../../../store/actions/system/resources';
import {useDispatch} from '../../../store/redux-hooks';
import {useUpdater} from '../../../hooks/use-updater';
import {MetaTable, Tooltip} from '@ytsaurus/components';
import {ColorCircle} from '../../../components/ColorCircle/ColorCircle';
import {prepareDiskResources, prepareResources} from '../../../utils/system/resources';

import './Resources.scss';

const b = block('system');

class Resources extends Component {
    static propTypes = {
        // from connect
        resources: PropTypes.object.isRequired,
        nodeAttributes: PropTypes.object,
        mediumList: PropTypes.arrayOf(PropTypes.string),
        systemReservedDiskSpacePerMedium: PropTypes.object,
        uncommittedDiskSpacePerMedium: PropTypes.object,
    };

    renderTooltipContent(tooltipItems) {
        const items = tooltipItems.map((item) => {
            const isTotal = item.isTotal;
            return {
                key: item.title || '',
                label: isTotal ? (
                    <span>{item.title}</span>
                ) : (
                    <span>
                        <ColorCircle theme={item.theme} color={item.color} marginRight />
                        {item.title}
                    </span>
                ),
                value: item.value,
            };
        });

        return <MetaTable items={items} />;
    }

    renderFullNodesMessage() {
        const {nodeAttributes} = this.props;
        if (!nodeAttributes) {
            return null;
        }

        const {full_node_count: fullNodeCount, online_node_count: onlineNodeCount} = nodeAttributes;
        const fullNodePercentage = (fullNodeCount / onlineNodeCount) * 100;

        if (!fullNodePercentage) {
            return null;
        }
        return (
            <YTErrorBlock
                type={fullNodePercentage >= 90 ? 'error' : 'alert'}
                message={`${fullNodePercentage.toFixed(2)} % (${fullNodeCount}) of nodes are full.`}
            />
        );
    }

    renderResources(entries) {
        return entries.map(({caption, usage}) => {
            const progressElement = usage.tooltipInfo ? (
                <Tooltip
                    className={b('resources-progress-tooltip')}
                    placement={'bottom'}
                    content={this.renderTooltipContent(usage.tooltipInfo)}
                >
                    <Progress stack={addProgressStackSpacers(usage.stack)} text={usage.text} />
                </Tooltip>
            ) : (
                <Progress theme={'success'} text={usage.text} value={usage.progress} />
            );

            return (
                <div key={caption} className={b('resource')}>
                    <div className={b('resources-caption')}>{caption}</div>
                    <div className={b('resources-progress')}>{progressElement}</div>
                </div>
            );
        });
    }

    renderImpl() {
        const headingCN = b('resources-heading');
        const {
            resources,
            nodeAttributes,
            mediumList,
            systemReservedDiskSpacePerMedium,
            uncommittedDiskSpacePerMedium,
        } = this.props;

        const resourcesData = prepareResources(resources);
        const diskResources = prepareDiskResources({
            nodeAttributes,
            mediumList,
            systemReservedDiskSpacePerMedium,
            uncommittedDiskSpacePerMedium,
        });

        const showResources = resourcesData.length > 0;
        const showDiskResources = diskResources.length > 0;
        const diskResourcesCN = b('resources-heading', b('resources-meters-disk'));

        return (
            <div className={b('resources')}>
                <div className={b('resources-message')}>{this.renderFullNodesMessage()}</div>
                <div className={b('resources-meters')}>
                    {showResources && [
                        <div key="resources" className={headingCN}>
                            Resources
                        </div>,
                        this.renderResources(resourcesData),
                    ]}
                    {showDiskResources && [
                        <div key="disk-resources" className={diskResourcesCN}>
                            Disk space
                        </div>,
                        this.renderResources(diskResources),
                    ]}
                </div>
            </div>
        );
    }

    render() {
        return (
            <React.Fragment>
                <ResourcesUpdater />
                {this.renderImpl()}
            </React.Fragment>
        );
    }
}

function mapStateToProps(state) {
    const {resources, nodeAttributes} = state.system.resources;
    return {
        resources,
        nodeAttributes,
        mediumList: getMediumList(state),
        systemReservedDiskSpacePerMedium: getSystemReservedDiskSpaceByMedium(state),
        uncommittedDiskSpacePerMedium: getUncommittedDiskSpaceByMedium(state),
    };
}

function ResourcesUpdater() {
    const dispatch = useDispatch();

    const updateFn = React.useMemo(() => {
        let allowUpdate = true;
        return () => {
            if (allowUpdate) {
                dispatch(loadSystemResources()).then((data) => {
                    if (data?.isRetryFutile) {
                        allowUpdate = false;
                    }
                });
            }
        };
    }, [dispatch]);

    useUpdater(updateFn);

    return null;
}

export default connect(mapStateToProps)(Resources);
