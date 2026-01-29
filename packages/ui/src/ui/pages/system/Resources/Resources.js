import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import block from 'bem-cn-lite';

import forEach_ from 'lodash/forEach';

import {Progress} from '@gravity-ui/uikit';

import {YTErrorBlock} from '../../../components/Block/Block';
import hammer from '../../../common/hammer';
import {getMediumList} from '../../../store/selectors/thor';
import {loadSystemResources} from '../../../store/actions/system/resources';
import {useDispatch} from '../../../store/redux-hooks';
import {useUpdater} from '../../../hooks/use-updater';

import './Resources.scss';

const formatNumber = hammer.format.Number;
const formatBytes = hammer.format.Bytes;

const b = block('system');

class Resources extends Component {
    static propTypes = {
        // from connect
        resources: PropTypes.object.isRequired,
        nodeAttributes: PropTypes.object,
        mediumList: PropTypes.arrayOf(PropTypes.string),
    };

    prepareResources() {
        const {resources} = this.props;
        if (!resources) {
            return [];
        }
        const {resource_usage: usage, resource_limits: limits} = resources;
        return [
            {
                caption: 'CPU',
                usage: {
                    text: formatNumber(usage?.cpu) + ' / ' + formatNumber(limits?.cpu),
                    progress: limits?.cpu ? (usage.cpu / limits.cpu) * 100 : 0,
                },
            },
            {
                caption: 'Memory',
                usage: {
                    text:
                        formatBytes(usage?.user_memory) + ' / ' + formatBytes(limits?.user_memory),
                    progress: limits?.user_memory
                        ? (usage.user_memory / limits.user_memory) * 100
                        : 0,
                },
            },
            {
                caption: 'GPU',
                usage: {
                    text: formatNumber(usage?.gpu) + ' / ' + formatNumber(limits?.gpu),
                    progress: limits?.gpu ? (usage.gpu / limits.gpu) * 100 : 0,
                },
            },
        ];
    }

    prepareDiskResources() {
        const {nodeAttributes, mediumList} = this.props;
        const diskResourcesPerMedium = [];
        if (nodeAttributes && mediumList) {
            const {
                available_space_per_medium: availableSpacePerMedium,
                used_space_per_medium: usedSpacePerMedium,
            } = nodeAttributes;

            forEach_(mediumList, (medium) => {
                const available = availableSpacePerMedium[medium];
                const used = usedSpacePerMedium[medium];

                if (available > 0 || used > 0) {
                    const total = available + used;
                    const displayUsed = Math.max(0, used);
                    const caption = hammer.format['ReadableField'](medium);
                    const progressText =
                        hammer.format['Bytes'](displayUsed) + ' / ' + hammer.format['Bytes'](total);
                    const progressValue = (displayUsed / total) * 100;

                    diskResourcesPerMedium.push({
                        caption: caption,
                        show: true,
                        usage: {
                            text: progressText,
                            progress: progressValue,
                        },
                    });
                }
            });
        }
        return diskResourcesPerMedium;
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
            return (
                <div key={caption} className={b('resource')}>
                    <div className={b('resources-caption')}>{caption}</div>
                    <div className={b('resources-progress')}>
                        <Progress theme={'success'} text={usage.text} value={usage.progress} />
                    </div>
                </div>
            );
        });
    }

    renderImpl() {
        const headingCN = b('resources-heading');
        const resources = this.prepareResources();
        const diskResources = this.prepareDiskResources();
        const showResources = resources.length > 0;
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
                        this.renderResources(resources),
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
